import React, { useEffect, useRef } from 'react';
import { SystemState } from '../../types';
import { Activity, Gauge, Cpu, Network, Zap, Thermometer, Radio, ShieldCheck } from 'lucide-react';

interface Props {
  state: SystemState;
}

export const TelemetryFeedPanel: React.FC<Props> = ({ state }) => {
  const chartCanvasRef = useRef<HTMLCanvasElement>(null);
  const ecgCanvasRef = useRef<HTMLCanvasElement>(null);

  // 1. Draw Multi-Line Telemetry Canvas Chart with Gradient Fills & Smooth Oscilloscope Animation
  useEffect(() => {
    let animId: number;

    const renderChart = () => {
      const canvas = chartCanvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      // Draw SCADA Grid
      ctx.strokeStyle = state.themeMode === 'light' ? '#e2e8f0' : '#1a2436';
      ctx.lineWidth = 1;

      // Horizontal grid lines
      const gridRows = 5;
      for (let i = 0; i <= gridRows; i++) {
        const y = (height / gridRows) * i;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Vertical grid lines
      const gridCols = 8;
      for (let i = 0; i <= gridCols; i++) {
        const x = (width / gridCols) * i;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }

      const history = state.telemetryHistory;
      if (history.length < 2) return;

      // GRADIENT FILL 1: IR Beam Voltage (#30d158)
      const gradV = ctx.createLinearGradient(0, 0, 0, height);
      gradV.addColorStop(0, 'rgba(48, 209, 88, 0.35)');
      gradV.addColorStop(1, 'rgba(48, 209, 88, 0.0)');

      ctx.beginPath();
      history.forEach((pt, idx) => {
        const x = (width / (history.length - 1)) * idx;
        const normV = Math.max(0, Math.min(3.5, pt.beamVoltage)) / 3.5;
        const y = height - normV * (height - 20) - 10;
        if (idx === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.lineTo(width, height);
      ctx.lineTo(0, height);
      ctx.closePath();
      ctx.fillStyle = gradV;
      ctx.fill();

      // LINE 1: IR Beam Voltage stroke
      ctx.beginPath();
      ctx.strokeStyle = '#30d158';
      ctx.lineWidth = 2;
      history.forEach((pt, idx) => {
        const x = (width / (history.length - 1)) * idx;
        const normV = Math.max(0, Math.min(3.5, pt.beamVoltage)) / 3.5;
        const y = height - normV * (height - 20) - 10;
        if (idx === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();

      // GRADIENT FILL 2: Servo Draw Current (#ff9f0a)
      const gradI = ctx.createLinearGradient(0, 0, 0, height);
      gradI.addColorStop(0, 'rgba(255, 159, 10, 0.25)');
      gradI.addColorStop(1, 'rgba(255, 159, 10, 0.0)');

      ctx.beginPath();
      history.forEach((pt, idx) => {
        const x = (width / (history.length - 1)) * idx;
        const normI = Math.max(0, Math.min(200, pt.servoCurrentMa)) / 200;
        const y = height - normI * (height - 20) - 10;
        if (idx === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.lineTo(width, height);
      ctx.lineTo(0, height);
      ctx.closePath();
      ctx.fillStyle = gradI;
      ctx.fill();

      // LINE 2: Servo Draw Current stroke
      ctx.beginPath();
      ctx.strokeStyle = '#ff9f0a';
      ctx.lineWidth = 1.5;
      history.forEach((pt, idx) => {
        const x = (width / (history.length - 1)) * idx;
        const normI = Math.max(0, Math.min(200, pt.servoCurrentMa)) / 200;
        const y = height - normI * (height - 20) - 10;
        if (idx === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();

      // Chart Legend / Current value dot
      const lastPt = history[history.length - 1];
      const lastX = width - 4;
      const lastNormV = Math.max(0, Math.min(3.5, lastPt.beamVoltage)) / 3.5;
      const lastY = height - lastNormV * (height - 20) - 10;

      ctx.fillStyle = state.isSimulatingBeamBreak ? '#ff453a' : '#30d158';
      ctx.beginPath();
      ctx.arc(lastX, lastY, 4, 0, Math.PI * 2);
      ctx.fill();
    };

    renderChart();
  }, [state.telemetryHistory, state.isSimulatingBeamBreak, state.themeMode]);

  // 2. Draw ECG Heartbeat Canvas Chart
  useEffect(() => {
    const canvas = ecgCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    // ECG baseline pulse line
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 1.5;
    ctx.beginPath();

    const t = Date.now() / 200;
    for (let x = 0; x < w; x++) {
      const phase = (x + t * 20) % w;
      let y = h / 2;
      if (phase > 40 && phase < 45) y -= 12;
      else if (phase >= 45 && phase < 52) y += 18;
      else if (phase >= 52 && phase < 58) y -= 8;

      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }, [state.uptimeCurrentMs]);

  // Radial Gauge Math Helper
  const renderGaugeArc = (valuePct: number, color: string) => {
    const radius = 28;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (valuePct / 100) * circumference * 0.75;
    return (
      <svg className="w-16 h-16 transform -rotate-225">
        <circle
          cx="32"
          cy="32"
          r={radius}
          stroke="#162032"
          strokeWidth="6"
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * 0.25}
        />
        <circle
          cx="32"
          cy="32"
          r={radius}
          stroke={color}
          strokeWidth="6"
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-300"
        />
      </svg>
    );
  };

  const isWarningState = state.isSimulatingBeamBreak || state.threatLevel === 'CRITICAL';

  return (
    <section
      className={`scada-panel flex flex-col h-full border corner-brackets overflow-hidden transition-all duration-300 ${
        isWarningState
          ? 'border-[#ff453a] shadow-[0_0_20px_rgba(255,69,58,0.4)] animate-pulse-fast'
          : 'border-[#1d2636]'
      }`}
    >
      {/* HEADER */}
      <div className="flex items-center justify-between px-3.5 h-10 bg-[#0a0f19] border-b border-[#1d2636] font-mono text-xs select-none">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-sky-400" />
          <span className="font-bold text-white tracking-wider">PANEL B: TACTICAL SENSOR TELEMETRY FEED</span>
        </div>
        <div className="flex items-center gap-3 text-[10px] font-mono text-slate-400">
          <span className="text-[#30d158] flex items-center gap-1 font-bold">● IR VOLTAGE: 3.28V VDC</span>
          <span className="text-[#ff9f0a] flex items-center gap-1 font-bold">● SERVO CURRENT: {state.servoCurrentDrawMa.toFixed(0)}mA</span>
        </div>
      </div>

      <div className="p-3 flex flex-col gap-3 flex-1 bg-[#080d16] font-mono">
        {/* MULTI-LINE TELEMETRY LIVE CHART */}
        <div className="bg-[#0c1320] border border-[#1c293c] p-2.5 rounded-sm relative">
          <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1 font-medium">
            <span>REAL-TIME VOLTAGE (VDC) &amp; CURRENT (mA) DRIFT</span>
            <span className="text-[#30d158] font-bold">INTERVAL: 100ms SAMPLING</span>
          </div>
          <canvas
            ref={chartCanvasRef}
            width={520}
            height={130}
            className="w-full h-[130px] rounded-sm bg-[#04070d] block border border-[#141e2e]"
          />
          <div className="flex items-center justify-between text-[9px] text-slate-500 mt-1 font-mono">
            <span>-30s</span>
            <span>-20s</span>
            <span>-10s</span>
            <span className="text-[#30d158] font-bold">LIVE [NOW]</span>
          </div>
        </div>

        {/* DIGITAL RADIAL METERS (3 CARDS WITH UNIFIED BASELINE) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {/* Gauge 1: Optical Path Intactness */}
          <div className="bg-[#0c1320] border border-[#1c293c] p-2.5 rounded-sm flex items-center gap-3 h-[76px]">
            <div className="relative flex items-center justify-center shrink-0 w-14 h-14">
              {renderGaugeArc(state.opticalPathIntactnessPct, state.opticalPathIntactnessPct < 50 ? '#ff453a' : '#30d158')}
              <span className="absolute text-[10px] font-bold text-white font-mono">
                {state.opticalPathIntactnessPct.toFixed(0)}%
              </span>
            </div>
            <div className="flex flex-col justify-center flex-1 min-w-0">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold truncate">
                Optical Intactness
              </span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-base font-extrabold text-white font-mono tracking-tight">
                  {state.opticalPathIntactnessPct.toFixed(1)}
                </span>
                <span className="text-xs font-semibold text-slate-400 font-mono">%</span>
              </div>
              <div className="flex items-center justify-between text-[9px] font-mono mt-0.5">
                <span className={state.opticalPathIntactnessPct > 90 ? 'text-[#30d158] font-bold' : 'text-[#ff453a] font-bold'}>
                  {state.opticalPathIntactnessPct > 90 ? 'BEAM SECURE' : 'BEAM SEVERED'}
                </span>
                <span className="text-slate-500">&gt;98.5%</span>
              </div>
            </div>
          </div>

          {/* Gauge 2: Servo Actuation Current Draw */}
          <div className="bg-[#0c1320] border border-[#1c293c] p-2.5 rounded-sm flex items-center gap-3 h-[76px]">
            <div className="relative flex items-center justify-center shrink-0 w-14 h-14">
              {renderGaugeArc(
                Math.min(100, (state.servoCurrentDrawMa / 500) * 100),
                state.servoCurrentDrawMa > 200 ? '#ff453a' : '#ff9f0a'
              )}
              <span className="absolute text-[10px] font-bold text-[#ff9f0a] font-mono">
                {state.servoCurrentDrawMa.toFixed(0)}mA
              </span>
            </div>
            <div className="flex flex-col justify-center flex-1 min-w-0">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold truncate">
                Actuator Current
              </span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-base font-extrabold text-white font-mono tracking-tight">
                  {state.servoCurrentDrawMa.toFixed(0)}
                </span>
                <span className="text-xs font-semibold text-slate-400 font-mono">mA</span>
              </div>
              <div className="flex items-center justify-between text-[9px] font-mono mt-0.5">
                <span className={state.servoCurrentDrawMa > 200 ? 'text-[#ff453a] font-bold' : 'text-[#ff9f0a] font-bold'}>
                  {state.servoCurrentDrawMa > 200 ? 'PEAK TRIP' : 'NOMINAL IDLE'}
                </span>
                <span className="text-slate-500">2500 mA</span>
              </div>
            </div>
          </div>

          {/* Gauge 3: Relay Contact Temp & State */}
          <div className="bg-[#0c1320] border border-[#1c293c] p-2.5 rounded-sm flex items-center gap-3 h-[76px]">
            <div className="relative flex items-center justify-center shrink-0 w-14 h-14">
              {renderGaugeArc(
                Math.min(100, (state.relayContactTempC / 80) * 100),
                state.relayContactTempC > 45 ? '#ff453a' : '#30d158'
              )}
              <span className="absolute text-[10px] font-bold text-white font-mono">
                {state.relayContactTempC.toFixed(0)}°C
              </span>
            </div>
            <div className="flex flex-col justify-center flex-1 min-w-0">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold truncate">
                Relay Contact Temp
              </span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-base font-extrabold text-white font-mono tracking-tight">
                  {state.relayContactTempC.toFixed(1)}
                </span>
                <span className="text-xs font-semibold text-slate-400 font-mono">°C</span>
              </div>
              <div className="flex items-center justify-between text-[9px] font-mono mt-0.5">
                <span className={state.relayLatched ? 'text-[#30d158] font-bold' : 'text-[#ff453a] font-bold'}>
                  {state.relayLatched ? 'LATCHED' : 'AIR-GAP'}
                </span>
                <span className="text-slate-500">&lt;45°C</span>
              </div>
            </div>
          </div>
        </div>

        {/* SECONDARY MINI DISPLAYS: RADAR SCAN, TOPOLOGY, ECG HEARTBEAT */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
          {/* 1. 1D Radar Scan Bar */}
          <div className="bg-[#0c1320] border border-[#1c293c] p-2.5 rounded-sm flex flex-col justify-between">
            <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
              <span className="flex items-center gap-1 font-semibold">
                <Radio className="w-3 h-3 text-sky-400" /> 1D RADAR SCAN
              </span>
              <span className="text-sky-400 font-bold">500cm</span>
            </div>
            {/* Radar Beam Indicator Grid */}
            <div className="grid grid-cols-8 gap-1 h-5 items-center bg-[#060a12] p-1 rounded-sm border border-[#172436]">
              {state.activeBeams.map((beam) => (
                <div
                  key={beam.id}
                  className={`h-full rounded-sm transition-colors ${
                    beam.intact ? 'bg-[#30d158] shadow-[0_0_6px_rgba(48,209,88,0.5)]' : 'bg-[#ff453a] animate-pulse-fast'
                  }`}
                  title={`${beam.name}: ${beam.intact ? 'INTACT' : 'BROKEN'}`}
                />
              ))}
            </div>
            <div className="flex justify-between text-[8px] text-slate-500 mt-1 font-mono">
              <span>Z1</span>
              <span>Z2</span>
              <span>Z3</span>
              <span>Z4</span>
              <span>Z5</span>
              <span>Z6</span>
              <span>Z7</span>
              <span>Z8</span>
            </div>
          </div>

          {/* 2. Network Topology Diagram */}
          <div className="bg-[#0c1320] border border-[#1c293c] p-2.5 rounded-sm flex flex-col justify-between">
            <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
              <span className="flex items-center gap-1 font-semibold">
                <Network className="w-3 h-3 text-[#30d158]" /> TOPOLOGY
              </span>
            </div>
            <div className="flex items-center justify-between text-[9px] bg-[#060a12] p-1.5 rounded-sm border border-[#172436] text-slate-300">
              <span className="px-1 bg-[#121824] text-slate-400 rounded-sm">WAN</span>
              <span className="text-slate-600">➔</span>
              <span className="px-1 bg-[#121824] text-[#ff9f0a] rounded-sm">ESP32</span>
              <span className="text-[#ff453a] font-bold">⚡[AIR-GAP]⚡</span>
              <span className="px-1 bg-[#30d158]/10 text-[#30d158] border border-[#30d158]/30 rounded-sm">RELAY</span>
            </div>
            <div className="text-[8px] text-[#30d158]/80 mt-1 font-mono">Hard-wired Physical Isolation</div>
          </div>

          {/* 3. ESP32 Heartbeat ECG Line Graph */}
          <div className="bg-[#0c1320] border border-[#1c293c] p-2.5 rounded-sm flex flex-col justify-between">
            <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
              <span className="flex items-center gap-1 font-semibold">
                <Cpu className="w-3 h-3 text-sky-400" /> HEARTBEAT
              </span>
              <span className="text-sky-300 font-bold">PING: {state.pingLatencyMs}ms</span>
            </div>
            <canvas ref={ecgCanvasRef} width={150} height={24} className="w-full h-[24px] bg-[#04070d] rounded-sm border border-[#141e2e]" />
            <div className="flex justify-between text-[8px] text-slate-500 mt-1 font-mono">
              <span>ESP32 OK</span>
              <span className="text-[#30d158]">148k PKTS</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
