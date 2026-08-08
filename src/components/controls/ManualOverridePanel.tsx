import React, { useState } from 'react';
import { SystemState } from '../../types';
import { audioFx } from '../../services/telemetryEngine';
import { Sliders, Key, Power, RotateCw, AlertTriangle, CheckCircle2, ShieldAlert, Cpu, Settings2, Lock } from 'lucide-react';

interface Props {
  state: SystemState;
  setState: React.Dispatch<React.SetStateAction<SystemState>>;
  onEmergencyPhysicalDisconnect: () => void;
  onCalibrateBeams: () => void;
}

export const ManualOverridePanel: React.FC<Props> = ({
  state,
  setState,
  onEmergencyPhysicalDisconnect,
  onCalibrateBeams,
}) => {
  const [safetyGuardOpen, setSafetyGuardOpen] = useState(false);

  // Key Switch State Toggle (OFF / CALIBRATE / ARMED)
  const handleKeySwitchToggle = () => {
    audioFx.playClick('key');
    setState((prev) => {
      const nextState =
        prev.switches.keySwitchState === 'OFF'
          ? 'CALIBRATE'
          : prev.switches.keySwitchState === 'CALIBRATE'
          ? 'ARMED'
          : 'OFF';
      return {
        ...prev,
        switches: {
          ...prev.switches,
          keySwitchState: nextState,
        },
      };
    });
  };

  // Rotary Knob Position Toggle (1: Auto, 2: Force Open, 3: Bypass)
  const handleRotaryToggle = () => {
    audioFx.playClick('rotary');
    setState((prev) => {
      const nextPos = (prev.switches.rotaryModePosition % 3) + 1;
      return {
        ...prev,
        switches: {
          ...prev.switches,
          rotaryModePosition: nextPos as 1 | 2 | 3,
        },
      };
    });
  };

  // DIP Switch Toggle
  const handleDipToggle = (idx: number) => {
    audioFx.playClick('toggle');
    setState((prev) => {
      const newDips = [...prev.switches.dipSwitches] as [boolean, boolean, boolean, boolean];
      newDips[idx] = !newDips[idx];
      return {
        ...prev,
        switches: {
          ...prev.switches,
          dipSwitches: newDips,
        },
      };
    });
  };

  const keyRotations = {
    OFF: 'rotate-0',
    CALIBRATE: 'rotate-45',
    ARMED: 'rotate-90',
  };

  return (
    <section className="scada-panel flex flex-col h-full border border-[#1d2636] corner-brackets overflow-hidden">
      {/* HEADER */}
      <div className="flex items-center justify-between px-3.5 h-10 bg-[#0a0f19] border-b border-[#1d2636] font-mono text-xs select-none">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-[#ff9f0a]" />
          <span className="font-bold text-white tracking-wider">PANEL D: MANUAL OVERRIDE CONTROLS</span>
        </div>
        <span className="text-[10px] px-1.5 py-0.5 bg-[#ff9f0a]/10 border border-[#ff9f0a]/30 text-[#ff9f0a] rounded-sm font-bold">
          TACTICAL PHYSICAL SWITCHES
        </span>
      </div>

      <div className="p-3 bg-[#080d16] flex flex-col gap-3 flex-1 font-mono text-xs">
        {/* ROW 1: KEY SWITCH & EMERGENCY ROCKER & ROTARY KNOB */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {/* 1. PHYSICAL KEY SWITCH [DIAGNOSTIC TESTING] */}
          <div className="bg-[#0c1320] border border-[#1c293c] p-2.5 rounded-sm flex flex-col items-center justify-between text-center relative group">
            <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
              Diagnostic Key Switch
            </div>

            {/* Key Cylinder UI */}
            <button
              onClick={handleKeySwitchToggle}
              className="w-14 h-14 rounded-full bg-[#050911] border-2 border-[#2b3e5a] shadow-[inset_0_2px_8px_rgba(0,0,0,0.8)] flex items-center justify-center relative cursor-pointer active:scale-95 transition-transform"
              title="Click to rotate Key Position (OFF / CALIBRATE / ARMED)"
            >
              <div
                className={`w-9 h-1.5 bg-gradient-to-r from-slate-400 to-slate-200 rounded-sm shadow transition-transform duration-300 ${
                  keyRotations[state.switches.keySwitchState]
                }`}
              />
              <Key className="w-3.5 h-3.5 text-[#ff9f0a] absolute" />
            </button>

            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-base font-extrabold text-white font-mono tracking-tight">
                {state.switches.keySwitchState}
              </span>
            </div>
            <div className="text-[9px] text-slate-500 font-mono">KEY LOCK: ARMED MODE</div>
          </div>

          {/* 2. HEAVY RED ROCKER SWITCH [EMERGENCY MANUAL PHYSICAL DISCONNECT] */}
          <div className="bg-[#0c1320] border border-[#ff453a]/40 p-2.5 rounded-sm flex flex-col items-center justify-between text-center relative">
            <div className="text-[10px] text-[#ff453a] uppercase tracking-wider font-bold flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5 text-[#ff453a]" /> Emergency Air-Gap
            </div>

            {/* Safety Cover Guard Toggle */}
            <div className="relative my-1 w-full max-w-[120px]">
              {!safetyGuardOpen && (
                <button
                  onClick={() => {
                    audioFx.playClick('heavy');
                    setSafetyGuardOpen(true);
                  }}
                  className="absolute inset-0 bg-[#ff453a]/20 border border-[#ff453a] rounded-sm flex flex-col items-center justify-center z-20 cursor-pointer backdrop-blur-md hover:bg-[#ff453a]/30 transition-colors"
                  title="Click to Flip Open Safety Guard"
                >
                  <Lock className="w-3.5 h-3.5 text-[#ff453a] mb-0.5" />
                  <span className="text-[8px] font-bold text-white uppercase tracking-widest">
                    FLIP GUARD
                  </span>
                </button>
              )}

              {/* Red Rocker Button */}
              <button
                onClick={onEmergencyPhysicalDisconnect}
                className={`w-full h-11 rounded-sm font-bold text-xs uppercase tracking-wider border shadow-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  state.lockoutState === 'PHYSICAL_TRIPPED'
                    ? 'bg-[#ff453a] text-white border-[#ff453a] shadow-[0_0_20px_rgba(255,69,58,0.8)] animate-pulse-fast'
                    : 'bg-[#ff453a]/20 hover:bg-[#ff453a]/30 text-[#ff453a] border-[#ff453a]/60'
                }`}
              >
                <Power className="w-3.5 h-3.5" />
                {state.lockoutState === 'PHYSICAL_TRIPPED' ? 'TRIPPED' : 'TRIP RELAY'}
              </button>
            </div>

            <div className="flex items-center justify-between w-full text-[9px] text-slate-400 font-mono">
              <button
                onClick={() => {
                  audioFx.playClick('toggle');
                  setSafetyGuardOpen(!safetyGuardOpen);
                }}
                className="hover:text-white underline cursor-pointer"
              >
                {safetyGuardOpen ? 'Close Guard' : 'Guard Closed'}
              </button>
              <span className="text-[#ff453a] font-bold">PHYSICAL OVERRIDE</span>
            </div>
          </div>

          {/* 3. ROTARY SELECTOR KNOB [MAINTENANCE MODE] */}
          <div className="bg-[#0c1320] border border-[#1c293c] p-2.5 rounded-sm flex flex-col items-center justify-between text-center">
            <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
              Operating Mode Rotary
            </div>

            {/* Rotary Dial */}
            <button
              onClick={handleRotaryToggle}
              className="w-14 h-14 rounded-full bg-[#050911] border-2 border-[#ff9f0a]/80 shadow-[inset_0_2px_8px_rgba(0,0,0,0.8)] flex items-center justify-center relative cursor-pointer active:scale-95 transition-transform"
              title="Click to turn Rotary Switch (1: AUTO, 2: FORCE OPEN, 3: BYPASS)"
            >
              <div
                className={`w-1.5 h-6 bg-[#ff9f0a] rounded-sm absolute top-1.5 transition-transform duration-300 origin-bottom ${
                  state.switches.rotaryModePosition === 1
                    ? '-rotate-45'
                    : state.switches.rotaryModePosition === 2
                    ? 'rotate-0'
                    : 'rotate-45'
                }`}
              />
              <div className="w-3 h-3 rounded-full bg-slate-800 border border-slate-600 z-10" />
            </button>

            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-base font-extrabold text-[#ff9f0a] font-mono tracking-tight">
                {state.switches.rotaryModePosition === 1
                  ? 'POS 01'
                  : state.switches.rotaryModePosition === 2
                  ? 'POS 02'
                  : 'POS 03'}
              </span>
              <span className="text-xs font-semibold text-slate-400 font-mono">
                {state.switches.rotaryModePosition === 1
                  ? 'AUTO'
                  : state.switches.rotaryModePosition === 2
                  ? 'FORCE'
                  : 'BYPASS'}
              </span>
            </div>
            <div className="text-[9px] text-slate-500 font-mono">ZERO-TRUST SELECTOR</div>
          </div>
        </div>

        {/* ROW 2: DIP SWITCH MATRIX & IR RE-CALIBRATION */}
        <div className="bg-[#0c1320] border border-[#1c293c] p-2.5 rounded-sm flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* DIP Switches for IR Sensitivity */}
          <div className="flex items-center gap-3">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
              IR Threshold DIPs:
            </span>
            <div className="flex items-center gap-2">
              {state.switches.dipSwitches.map((val, idx) => (
                <button
                  key={idx}
                  onClick={() => handleDipToggle(idx)}
                  className={`w-7 h-10 rounded-sm border font-bold text-[10px] flex flex-col items-center justify-between p-1 transition-colors cursor-pointer ${
                    val
                      ? 'bg-[#30d158]/10 border-[#30d158] text-[#30d158]'
                      : 'bg-slate-900 border-slate-700 text-slate-500'
                  }`}
                >
                  <span>{idx + 1}</span>
                  <div className={`w-3 h-2 rounded-sm ${val ? 'bg-[#30d158]' : 'bg-slate-700'}`} />
                  <span>{val ? 'ON' : 'OFF'}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Re-calibrate IR Beams button */}
          <button
            onClick={onCalibrateBeams}
            className="w-full sm:w-auto px-4 py-2 bg-[#121824] hover:bg-[#1a2334] border border-[#1d2636] hover:border-[#2d3a50] text-slate-200 rounded-sm font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors"
          >
            <RotateCw className="w-3.5 h-3.5 text-sky-400" />
            RE-CALIBRATE 8X IR BEAMS
          </button>
        </div>

        {/* ROW 3: HARDWARE INTERLOCK LED MATRIX */}
        <div className="bg-[#0c1320] border border-[#1c293c] p-2.5 rounded-sm">
          <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold mb-2 flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-[#30d158]" /> Hardware Interlock LED Matrix
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-[10px] font-mono">
            {/* LED 1: Power Feed A */}
            <div className="p-2 bg-[#060a12] border border-[#172436] rounded-sm flex items-center justify-between">
              <span className="text-slate-300">POWER A</span>
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  state.switches.relays.powerFeedA
                    ? 'bg-[#30d158] shadow-[0_0_8px_#30d158]'
                    : 'bg-slate-800'
                }`}
              />
            </div>

            {/* LED 2: Power Feed B */}
            <div className="p-2 bg-[#060a12] border border-[#172436] rounded-sm flex items-center justify-between">
              <span className="text-slate-300">POWER B</span>
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  state.switches.relays.powerFeedB
                    ? 'bg-[#30d158] shadow-[0_0_8px_#30d158]'
                    : 'bg-slate-800'
                }`}
              />
            </div>

            {/* LED 3: Servo Relay 1 */}
            <div className="p-2 bg-[#060a12] border border-[#172436] rounded-sm flex items-center justify-between">
              <span className="text-slate-300">SERVO R1</span>
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  state.switches.relays.servoRelay1
                    ? 'bg-[#ff9f0a] shadow-[0_0_8px_#ff9f0a]'
                    : 'bg-slate-800'
                }`}
              />
            </div>

            {/* LED 4: Servo Relay 2 */}
            <div className="p-2 bg-[#060a12] border border-[#172436] rounded-sm flex items-center justify-between">
              <span className="text-slate-300">SERVO R2</span>
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  state.switches.relays.servoRelay2
                    ? 'bg-[#ff9f0a] shadow-[0_0_8px_#ff9f0a]'
                    : 'bg-slate-800'
                }`}
              />
            </div>

            {/* LED 5: Air-Gap Isolator */}
            <div className="p-2 bg-[#060a12] border border-[#172436] rounded-sm flex items-center justify-between col-span-2 sm:col-span-1">
              <span className="text-slate-300">ISOLATOR</span>
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  state.lockoutState === 'PHYSICAL_TRIPPED'
                    ? 'bg-[#ff453a] animate-pulse-fast shadow-[0_0_8px_#ff453a]'
                    : 'bg-[#30d158] shadow-[0_0_8px_#30d158]'
                }`}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
