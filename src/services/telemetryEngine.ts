import { LogEntry, SensorBeam, SystemState, TelemetryPoint, CyberCommand } from '../types';

// Web Audio API for industrial SCADA switch clicks & alarm beeps
class AudioFx {
  private ctx: AudioContext | null = null;
  private muted: boolean = false;

  setMuted(muted: boolean) {
    this.muted = muted;
  }

  isMuted() {
    return this.muted;
  }

  private initCtx() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  playClick(type: 'heavy' | 'toggle' | 'rotary' | 'key' | 'alarm' | 'ping' = 'toggle') {
    if (this.muted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const now = this.ctx.currentTime;

      if (type === 'heavy') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(120, now);
        osc.frequency.exponentialRampToValueAtTime(40, now + 0.12);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      } else if (type === 'rotary') {
        osc.type = 'square';
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(200, now + 0.05);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
      } else if (type === 'key') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(1200, now);
        osc.frequency.exponentialRampToValueAtTime(400, now + 0.08);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
      } else if (type === 'alarm') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(880, now);
        osc.frequency.linearRampToValueAtTime(440, now + 0.15);
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
      } else if (type === 'ping') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(980, now);
        osc.frequency.exponentialRampToValueAtTime(1200, now + 0.06);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
      } else {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.exponentialRampToValueAtTime(150, now + 0.04);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
      }

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.2);
    } catch {
      // Audio autoplay restrictions or context error gracefully handled
    }
  }
}

export const audioFx = new AudioFx();

// Initial Beams configuration (8 active IR break-beams)
export const initialBeams: SensorBeam[] = Array.from({ length: 8 }, (_, i) => ({
  id: i + 1,
  name: `ZONE_A${i + 1}_IR_BEAM`,
  voltage: 3.28 + (Math.random() * 0.04 - 0.02),
  powerDb: -12.2 + (Math.random() * 0.4 - 0.2),
  intact: true,
  frequencyHz: 38000 + i * 500,
  signalQuality: 99.4 + Math.random() * 0.5,
}));

// Initial Mock Logs
export const initialLogs: LogEntry[] = [
  {
    id: 'log-1',
    timestamp: '14:15:28.002',
    millis: 141528002,
    level: 'INFO',
    source: 'ESP32',
    message: 'BOOT: ESP32-WROOM-32U initialized. Firmware v2.8.4-ZeroTrust.',
  },
  {
    id: 'log-2',
    timestamp: '14:15:28.115',
    millis: 141528115,
    level: 'INFO',
    source: 'IR_BEAM',
    message: 'CALIBRATION COMPLETE: 8/8 Optical Break-Beam channels locked at 38kHz modulation.',
  },
  {
    id: 'log-3',
    timestamp: '14:15:29.400',
    millis: 141529400,
    level: 'INFO',
    source: 'SERVO',
    message: 'ACTUATOR READY: MG996R Metal Gear Servo homed at 0.0° (Locked Position).',
  },
  {
    id: 'log-4',
    timestamp: '14:15:30.010',
    millis: 141530010,
    level: 'INFO',
    source: 'ZERO_TRUST',
    message: 'AIR-GAP OVERRIDE ENGINE: Active. Hardware physical ground-truth monitoring enabled.',
  },
  {
    id: 'log-5',
    timestamp: '14:15:32.100',
    millis: 141532100,
    level: 'INFO',
    source: 'SYSTEM',
    message: 'SYSTEM CHECK: All 8 Zones Secure. WebSocket telemetry client listening at 100Hz.',
  },
];

export const initialThreats: CyberCommand[] = [
  {
    id: 'cmd-101',
    protocol: 'MODBUS_TCP',
    originIp: '192.168.10.244 (UNAUTHORIZED_WAN)',
    commandType: 'FORCE_TRIP_BREAKER',
    rawHexPayload: '0x00 0x01 0x00 0x00 0x00 0x06 0x01 0x05 0x00 0x10 0xFF 0x00',
    timestamp: '14:15:22.040',
    status: 'REJECTED_BY_PHYSICAL_AIRGAP',
    physicalValidation: 'IR_BEAM_INTACT_OVERRIDE',
  },
];

export function createInitialTelemetryHistory(): TelemetryPoint[] {
  const points: TelemetryPoint[] = [];
  const now = Date.now();
  for (let i = 30; i >= 0; i--) {
    const t = now - i * 1000;
    const date = new Date(t);
    const timeLabel = `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}`;
    points.push({
      timestamp: t,
      timeLabel,
      beamVoltage: 3.28 + (Math.random() * 0.03 - 0.015),
      beamPowerDb: -12.1 + (Math.random() * 0.3 - 0.15),
      servoCurrentMa: 12 + Math.random() * 5,
      servoTorqueNm: 0.12 + Math.random() * 0.03,
      relayTempC: 28.2 + Math.random() * 0.4,
      opticalIntactnessPct: 99.8 + Math.random() * 0.2,
      latencyMs: 11 + Math.floor(Math.random() * 5),
    });
  }
  return points;
}
