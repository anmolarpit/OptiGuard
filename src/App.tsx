import React, { useState, useEffect, useCallback } from 'react';
import { SystemState, LogEntry, CyberCommand, TelemetryPoint } from './types';
import {
  initialBeams,
  initialLogs,
  initialThreats,
  createInitialTelemetryHistory,
  audioFx,
} from './services/telemetryEngine';
import { TopCommandBar } from './components/TopCommandBar';
import { PerimeterTwinPanel } from './components/3d/PerimeterTwinPanel';
import { TelemetryFeedPanel } from './components/telemetry/TelemetryFeedPanel';
import { LogsThreatPanel } from './components/logs/LogsThreatPanel';
import { ManualOverridePanel } from './components/controls/ManualOverridePanel';
import { AnomalyDetectionPanel } from './components/anomaly/AnomalyDetectionPanel';

export default function App() {
  const [showAnomalyView, setShowAnomalyView] = useState(false);
  const [state, setState] = useState<SystemState>(() => ({
    isWsConnected: false,
    useMockTelemetry: true,
    wsUrl: 'ws://192.168.1.100:81',
    uptimeStartMs: Date.now(),
    uptimeCurrentMs: 0,
    threatLevel: 'LOW',
    lockoutState: 'DISENGAGED',
    servoAngle: 0, // 0° = Locked/Closed, 45° = Air-gap Disconnect
    relayLatched: true, // true = Latched Closed, false = Open Air-Gap
    opticalPathIntactnessPct: 99.8,
    servoCurrentDrawMa: 12.4,
    relayContactTempC: 28.5,
    pingLatencyMs: 11,
    activeBeams: initialBeams,
    switches: {
      keySwitchState: 'ARMED',
      emergencyRockerFlipped: false,
      rotaryModePosition: 1, // 1 = Auto Zero-Trust
      dipSwitches: [true, true, false, true],
      calibratingBeams: false,
      relays: {
        powerFeedA: true,
        powerFeedB: true,
        servoRelay1: true,
        servoRelay2: true,
        airGapIsolator: true,
      },
    },
    logs: initialLogs,
    recentThreats: initialThreats,
    telemetryHistory: createInitialTelemetryHistory(),
    cameraView: 'orbit',
    isWireframe3d: false,
    showLaserMesh: true,
    isSimulatingAttack: false,
    isSimulatingBeamBreak: false,
    themeMode: 'light',
    isMuted: false,
    presentationDemoMode: true,
  }));

  // Synchronize document body class for theme
  useEffect(() => {
    if (state.themeMode === 'light') {
      document.body.classList.add('theme-light');
    } else {
      document.body.classList.remove('theme-light');
    }
  }, [state.themeMode]);

  // Helper to append a timestamped log entry
  const addLog = useCallback((level: LogEntry['level'], source: LogEntry['source'], message: string) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${now.getMilliseconds().toString().padStart(3, '0')}`;

    const newEntry: LogEntry = {
      id: `log-${Date.now()}-${Math.random()}`,
      timestamp: timeStr,
      millis: Date.now(),
      level,
      source,
      message,
    };

    setState((prev) => ({
      ...prev,
      logs: [...prev.logs.slice(-150), newEntry], // keep max 150 entries in buffer
    }));
  }, []);

  // 1. DYNAMIC TELEMETRY & MILLISECOND TICKER LOOP (100ms)
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setState((prev) => {
        const elapsed = now - prev.uptimeStartMs;

        // If mock telemetry OR presentation demo mode is active, simulate realistic noise & jitter
        if (prev.useMockTelemetry || prev.presentationDemoMode) {
          const noiseV = (Math.random() - 0.5) * 0.02;
          const noiseI = (Math.random() - 0.5) * 2;
          const noiseTemp = (Math.random() - 0.5) * 0.1;

          const currentV = Math.max(0, Math.min(3.3, 3.28 + noiseV));
          const currentI = prev.servoAngle > 10 ? 5200 + Math.random() * 200 : Math.max(0, 12 + noiseI);
          const currentTemp = Math.max(20, Math.min(60, prev.relayContactTempC + noiseTemp));

          // Update telemetry history array
          const date = new Date(now);
          const timeLabel = `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}`;

          const newPoint: TelemetryPoint = {
            timestamp: now,
            timeLabel,
            beamVoltage: currentV,
            beamPowerDb: -12.1 + (Math.random() * 0.2 - 0.1),
            servoCurrentMa: currentI,
            servoTorqueNm: prev.servoAngle > 10 ? 1.85 : 0.12,
            relayTempC: currentTemp,
            opticalIntactnessPct: prev.isSimulatingBeamBreak ? 0.0 : 99.8 + (Math.random() * 0.2 - 0.1),
            latencyMs: 10 + Math.floor(Math.random() * 6),
          };

          const updatedHistory = [...prev.telemetryHistory.slice(-29), newPoint];

          return {
            ...prev,
            uptimeCurrentMs: elapsed,
            servoCurrentDrawMa: currentI,
            relayContactTempC: currentTemp,
            pingLatencyMs: newPoint.latencyMs,
            opticalPathIntactnessPct: newPoint.opticalIntactnessPct,
            telemetryHistory: updatedHistory,
          };
        }

        return {
          ...prev,
          uptimeCurrentMs: elapsed,
        };
      });
    }, 100);

    return () => clearInterval(interval);
  }, []);

  // 2. WEBSOCKET HARDWARE CLIENT INTEGRATION
  useEffect(() => {
    if (state.useMockTelemetry || !state.wsUrl) return;

    let ws: WebSocket | null = null;
    try {
      ws = new WebSocket(state.wsUrl);

      ws.onopen = () => {
        setState((prev) => ({ ...prev, isWsConnected: true }));
        addLog('INFO', 'ESP32', `WebSocket connected to physical node at ${state.wsUrl}`);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          // Process raw ESP32 GPIO payload
          if (data.servoAngle !== undefined) {
            setState((prev) => ({
              ...prev,
              servoAngle: data.servoAngle,
              relayLatched: data.relayLatched ?? prev.relayLatched,
            }));
          }
        } catch {
          // Ignore non-json frames
        }
      };

      ws.onerror = () => {
        addLog('WARN', 'ESP32', `WebSocket error connecting to ${state.wsUrl}. Reverting to fallback mock stream.`);
        setState((prev) => ({ ...prev, isWsConnected: false, useMockTelemetry: true }));
      };

      ws.onclose = () => {
        setState((prev) => ({ ...prev, isWsConnected: false }));
      };
    } catch {
      setState((prev) => ({ ...prev, isWsConnected: false, useMockTelemetry: true }));
    }

    return () => {
      if (ws) ws.close();
    };
  }, [state.wsUrl, state.useMockTelemetry, addLog]);

  // 3. ACTION: SIMULATE CYBER ATTACK (MODBUS INJECTION)
  const handleSimulateCyberAttack = () => {
    audioFx.playClick('alarm');
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${now.getMilliseconds().toString().padStart(3, '0')}`;

    addLog('ALERT', 'MODBUS', `INCOMING THREAT: Malicious MODBUS payload injected from 192.168.10.244.`);
    addLog('HARDWARE', 'ZERO_TRUST', `ZERO-TRUST CHECK: Validating software command against physical IR beam status.`);

    setTimeout(() => {
      addLog(
        'HARDWARE',
        'SERVO',
        `PHYSICAL OVERRIDE ENGAGED: Physical ground truth validated intact. Command REJECTED. Servo flipped in 3.2ms.`
      );

      setState((prev) => ({
        ...prev,
        isSimulatingAttack: true,
        threatLevel: 'HIGH',
        lockoutState: 'ENGAGED',
        servoAngle: 45, // Flip servo mechanical arm to open air gap
        relayLatched: false,
        recentThreats: [
          {
            id: `cmd-${Date.now()}`,
            protocol: 'MODBUS_TCP',
            originIp: '192.168.10.244 (ATTACKER_INJECTION)',
            commandType: 'FORCE_TRIP_BREAKER',
            rawHexPayload: '0x00 0x01 0x00 0x00 0x00 0x06 0x01 0x05 0x00 0x10 0xFF 0x00',
            timestamp: timeStr,
            status: 'REJECTED_BY_PHYSICAL_AIRGAP',
            physicalValidation: 'IR_BEAM_INTACT_OVERRIDE',
          },
          ...prev.recentThreats,
        ],
      }));
    }, 400);
  };

  // 4. ACTION: SIMULATE IR BEAM BREAK
  const handleSimulateBeamBreak = () => {
    audioFx.playClick('alarm');
    const isCurrentlyBroken = state.isSimulatingBeamBreak;

    if (!isCurrentlyBroken) {
      addLog(
        'HARDWARE',
        'IR_BEAM',
        `HARDWARE TRIGGER: Zone A5 Break-Beam Path Interrupted! Physical Ground Truth Validated.`
      );
      addLog(
        'CRITICAL',
        'ZERO_TRUST',
        `AIR-GAP DISCONNECT ENFORCED: Servo mechanical knife arm activated. Substation power isolated.`
      );

      setState((prev) => ({
        ...prev,
        isSimulatingBeamBreak: true,
        activeBeams: prev.activeBeams.map((b, i) =>
          i === 4 ? { ...b, intact: false, signalQuality: 0, voltage: 0.05 } : b
        ),
        threatLevel: 'CRITICAL',
        lockoutState: 'PHYSICAL_TRIPPED',
        servoAngle: 45,
        relayLatched: false,
        opticalPathIntactnessPct: 0.0,
      }));
    } else {
      addLog('INFO', 'IR_BEAM', `IR BEAM RESTORED: Zone A5 break-beam optical alignment restored. Matrix 8/8 secure.`);

      setState((prev) => ({
        ...prev,
        isSimulatingBeamBreak: false,
        activeBeams: prev.activeBeams.map((b) => ({
          ...b,
          intact: true,
          signalQuality: 99.4 + Math.random() * 0.5,
          voltage: 3.28,
        })),
        threatLevel: 'LOW',
        lockoutState: 'DISENGAGED',
        servoAngle: 0,
        relayLatched: true,
        opticalPathIntactnessPct: 99.8,
      }));
    }
  };

  // 5. ACTION: MANUAL EMERGENCY PHYSICAL DISCONNECT
  const handleEmergencyPhysicalDisconnect = () => {
    audioFx.playClick('heavy');
    addLog('CRITICAL', 'SERVO', `MANUAL EMERGENCY OVERRIDE: Physical knife disconnect switch tripped by operator.`);

    setState((prev) => ({
      ...prev,
      lockoutState: 'PHYSICAL_TRIPPED',
      servoAngle: 45,
      relayLatched: false,
    }));
  };

  // 6. ACTION: CALIBRATE IR BEAMS
  const handleCalibrateBeams = () => {
    audioFx.playClick('toggle');
    addLog('INFO', 'IR_BEAM', `RE-CALIBRATION: Sweeping 8x optical IR break-beam channels at 38kHz modulation...`);

    setTimeout(() => {
      addLog('INFO', 'IR_BEAM', `CALIBRATION COMPLETE: All 8 zones aligned. Signal noise floor optimal at -12.1 dBm.`);
    }, 600);
  };

  // 7. ACTION: RESET SYSTEM
  const handleResetSystem = () => {
    audioFx.playClick('toggle');
    setState((prev) => ({
      ...prev,
      threatLevel: 'LOW',
      lockoutState: 'DISENGAGED',
      servoAngle: 0,
      relayLatched: true,
      isSimulatingAttack: false,
      isSimulatingBeamBreak: false,
      activeBeams: initialBeams,
      opticalPathIntactnessPct: 99.8,
      logs: initialLogs,
    }));
    addLog('INFO', 'SYSTEM', `SYSTEM RESET: OptiGuard zero-trust physical state restored to nominal.`);
  };

  return (
    <div
      className={`min-h-screen flex flex-col font-sans transition-colors duration-200 ${
        showAnomalyView
          ? 'bg-[#F5F6F8] text-[#333846]'
          : 'bg-[#0b0f17] text-slate-200 crt-scanlines'
      }`}
    >
      {/* TOP COMMAND BAR */}
      <TopCommandBar
        state={state}
        setState={setState}
        onSimulateCyberAttack={handleSimulateCyberAttack}
        onSimulateBeamBreak={handleSimulateBeamBreak}
        onResetSystem={handleResetSystem}
        onToggleAnomalyView={() => setShowAnomalyView((prev) => !prev)}
        showAnomalyView={showAnomalyView}
      />

      {/* VIEW SWITCHER / MAIN CONTENT */}
      {showAnomalyView ? (
        <main className="flex-1 w-full bg-[#F5F6F8] flex flex-col items-stretch">
          <AnomalyDetectionPanel
            state={state}
            onClose={() => setShowAnomalyView(false)}
          />
        </main>
      ) : (
        /* MAIN DASHBOARD GRID (4 CORE SCADA PANELS) */
        <main className="flex-1 p-2 sm:p-3 max-w-[1920px] w-full mx-auto grid grid-cols-1 lg:grid-cols-2 gap-3 items-stretch">
          {/* PANEL A: PERIMETER SENSOR ARRAY (3D INTERACTIVE TWIN) */}
          <PerimeterTwinPanel
            state={state}
            setState={setState}
            onSimulateBeamBreak={handleSimulateBeamBreak}
            onSimulateCyberAttack={handleSimulateCyberAttack}
          />

          {/* PANEL B: TACTICAL SENSOR TELEMETRY FEED */}
          <TelemetryFeedPanel state={state} />

          {/* PANEL C: LIVE LOGS & THREAT VECTORS */}
          <LogsThreatPanel state={state} setState={setState} />

          {/* PANEL D: MANUAL OVERRIDE CONTROLS */}
          <ManualOverridePanel
            state={state}
            setState={setState}
            onEmergencyPhysicalDisconnect={handleEmergencyPhysicalDisconnect}
            onCalibrateBeams={handleCalibrateBeams}
          />
        </main>
      )}

      {/* BOTTOM SCADA FOOTER BAR */}
      <footer className="w-full bg-[#070b12] border-t border-[#182335] px-3 py-1.5 text-[10px] font-mono text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-2 select-none">
        <div className="flex items-center gap-3">
          <span className="text-emerald-400 font-bold">OPTIGUARD ZERO-TRUST PHYSICAL OVERRIDE ARCHITECTURE</span>
          <span>•</span>
          <span>HARDWARE: ESP32-WROOM-32U + MG996R SERVO + 38kHz IR BREAK-BEAM</span>
        </div>
        <div className="flex items-center gap-3 text-slate-500">
          <span>LATENCY: &lt;3.2ms MECHANICAL ISOLATION</span>
          <span>•</span>
          <span>STATUS: NO SINGLE POINT OF CYBER FAILURE</span>
        </div>
      </footer>
    </div>
  );
}
