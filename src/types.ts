export type ThreatLevel = 'LOW' | 'MED' | 'HIGH' | 'CRITICAL';

export type LockoutState = 'ENGAGED' | 'DISENGAGED' | 'PHYSICAL_TRIPPED';

export type OperatingMode = 'AUTOMATIC' | 'DIAGNOSTIC' | 'MANUAL_OVERRIDE' | 'MAINTENANCE';

export interface SensorBeam {
  id: number;
  name: string;
  voltage: number; // 0.00 - 3.30V VDC
  powerDb: number; // e.g. -12.4 dBm
  intact: boolean; // true if beam unbroken
  frequencyHz: number;
  signalQuality: number; // 0 - 100%
}

export interface TelemetryPoint {
  timestamp: number;
  timeLabel: string;
  beamVoltage: number;
  beamPowerDb: number;
  servoCurrentMa: number;
  servoTorqueNm: number;
  relayTempC: number;
  opticalIntactnessPct: number;
  latencyMs: number;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  millis: number;
  level: 'INFO' | 'WARN' | 'ALERT' | 'CRITICAL' | 'HARDWARE';
  source: 'ESP32' | 'MODBUS' | 'IR_BEAM' | 'SERVO' | 'SYSTEM' | 'ZERO_TRUST';
  message: string;
  rawHex?: string;
}

export interface CyberCommand {
  id: string;
  protocol: 'MODBUS_TCP' | 'DNP3' | 'IEC_60870_5_104';
  originIp: string;
  commandType: 'FORCE_TRIP_BREAKER' | 'OVERRIDE_RELAY' | 'DISABLE_INTERLOCK' | 'READ_COILS';
  rawHexPayload: string;
  timestamp: string;
  status: 'REJECTED_BY_PHYSICAL_AIRGAP' | 'PENDING' | 'PASS_THROUGH';
  physicalValidation: 'IR_BEAM_INTACT_OVERRIDE' | 'BEAM_BROKEN_VALIDATED' | 'PHYSICAL_LOCKOUT_ENGAGED';
}

export interface OverrideSwitches {
  keySwitchState: 'OFF' | 'CALIBRATE' | 'ARMED';
  emergencyRockerFlipped: boolean; // true = Air-Gap Disconnect forced
  rotaryModePosition: 1 | 2 | 3; // 1: Auto, 2: Force Open, 3: Bypass
  dipSwitches: [boolean, boolean, boolean, boolean];
  calibratingBeams: boolean;
  relays: {
    powerFeedA: boolean;
    powerFeedB: boolean;
    servoRelay1: boolean;
    servoRelay2: boolean;
    airGapIsolator: boolean;
  };
}

export interface SystemState {
  isWsConnected: boolean;
  useMockTelemetry: boolean;
  wsUrl: string;
  uptimeStartMs: number;
  uptimeCurrentMs: number;
  threatLevel: ThreatLevel;
  lockoutState: LockoutState;
  servoAngle: number; // 0° = Locked/Closed, 45° = Air-gap Disconnect
  relayLatched: boolean; // true = Latched Closed, false = Open Air-Gap
  opticalPathIntactnessPct: number;
  servoCurrentDrawMa: number;
  relayContactTempC: number;
  pingLatencyMs: number;
  activeBeams: SensorBeam[];
  switches: OverrideSwitches;
  logs: LogEntry[];
  recentThreats: CyberCommand[];
  telemetryHistory: TelemetryPoint[];
  cameraView: 'orbit' | 'top' | 'isometric' | 'close_servo';
  isWireframe3d: boolean;
  showLaserMesh: boolean;
  isSimulatingAttack: boolean;
  isSimulatingBeamBreak: boolean;
  themeMode: 'light' | 'dark';
  isMuted: boolean;
  presentationDemoMode: boolean;
}
