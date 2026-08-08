import React, { useState } from 'react';
import { SystemState } from '../types';
import { audioFx } from '../services/telemetryEngine';
import {
  Shield,
  ShieldAlert,
  Wifi,
  Radio,
  Cpu,
  Settings,
  Activity,
  AlertTriangle,
  Lock,
  Unlock,
  Sun,
  Moon,
  Volume2,
  VolumeX,
  Tv,
  Fingerprint,
} from 'lucide-react';

interface Props {
  state: SystemState;
  setState: React.Dispatch<React.SetStateAction<SystemState>>;
  onSimulateCyberAttack: () => void;
  onSimulateBeamBreak: () => void;
  onResetSystem: () => void;
  onToggleAnomalyView?: () => void;
  showAnomalyView?: boolean;
}

export const TopCommandBar: React.FC<Props> = ({
  state,
  setState,
  onSimulateCyberAttack,
  onSimulateBeamBreak,
  onResetSystem,
  onToggleAnomalyView,
  showAnomalyView,
}) => {
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [inputWsUrl, setInputWsUrl] = useState(state.wsUrl);

  const formatUptime = (ms: number) => {
    const totalSec = Math.floor(ms / 1000);
    const hours = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;
    const millisRem = Math.floor(ms % 1000);
    return `${hours.toString().padStart(2, '0')}h ${mins.toString().padStart(2, '0')}m ${secs.toString().padStart(2, '0')}s ${millisRem.toString().padStart(3, '0')}ms`;
  };

  const handleToggleMockMode = () => {
    audioFx.playClick('toggle');
    setState((prev) => ({
      ...prev,
      useMockTelemetry: !prev.useMockTelemetry,
    }));
  };

  const handleSaveWsUrl = () => {
    audioFx.playClick('toggle');
    setState((prev) => ({
      ...prev,
      wsUrl: inputWsUrl,
      useMockTelemetry: false,
    }));
    setShowConfigModal(false);
  };

  const threatColor =
    state.threatLevel === 'CRITICAL'
      ? 'bg-[#ff453a]/10 text-[#ff453a] border-[#ff453a] animate-pulse-fast'
      : state.threatLevel === 'HIGH'
      ? 'bg-[#ff9f0a]/10 text-[#ff9f0a] border-[#ff9f0a]'
      : 'bg-[#30d158]/10 text-[#30d158] border-[#30d158]/40';

  const lockoutColor =
    state.lockoutState === 'PHYSICAL_TRIPPED' || state.lockoutState === 'ENGAGED'
      ? 'bg-[#ff9f0a]/10 text-[#ff9f0a] border-[#ff9f0a]'
      : 'bg-[#05070a] text-slate-400 border-[#1d2636]';

  return (
    <header className="w-full bg-[#0d121c] border-b border-[#1d2636] px-4 py-2 text-slate-200 select-none sticky top-0 z-40">
      <div className="max-w-[1920px] mx-auto flex flex-col lg:flex-row items-center justify-between gap-2">
        {/* LEFT BRAND & HEARTBEAT */}
        <div className="flex items-center gap-3 w-full lg:w-auto justify-between lg:justify-start">
          <div className="flex items-center gap-2">
            <span className="text-[#30d158] bg-[#30d158]/10 px-1.5 py-0.5 border border-[#30d158]/30 font-mono text-xs font-bold">
              OG
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono font-extrabold tracking-tighter text-lg text-[#f0f0f0]">
                  OPTIGUARD
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 bg-[#121824] border border-[#1d2636] text-slate-300 uppercase tracking-wider">
                  SCADA v2.8
                </span>
              </div>
              <div className="text-[10px] font-mono text-slate-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#30d158] shadow-[0_0_8px_#30d158] animate-pulse-fast"></span>
                <span className="text-[#30d158] font-semibold uppercase">System Active [Un-Spoofable]</span>
              </div>
            </div>
          </div>

          {/* DYNAMIC MILLISECOND UPTIME COUNTER */}
          <div className="hidden sm:flex flex-col px-3 py-1 bg-[#05070a] border border-[#1d2636] font-mono text-xs">
            <span className="text-[9px] text-slate-500 uppercase tracking-widest">System Uptime</span>
            <span className="text-[#30d158] font-bold tracking-tight">
              {formatUptime(state.uptimeCurrentMs)}
            </span>
          </div>
        </div>

        {/* CENTER SUBTITLE */}
        <div className="hidden xl:flex flex-col items-center justify-center text-center px-4">
          <h1 className="text-[11px] font-medium tracking-[0.2em] text-slate-400 uppercase">
            Perimeter Defense &amp; Physical Air-Gap Relay Control
          </h1>
          <div className="flex items-center gap-3 text-[10px] font-mono text-slate-500 mt-0.5">
            <span className="flex items-center gap-1">
              <Cpu className="w-3 h-3 text-[#30d158]" /> Node: ESP32-WROOM-32U
            </span>
            <span>•</span>
            <span className="flex items-center gap-1 text-sky-400">
              <Radio className="w-3 h-3 text-sky-400" /> 8x Optical IR Break-Beam
            </span>
            <span>•</span>
            <span className="text-[#ff9f0a] font-semibold">Zero-Trust Ground Truth</span>
          </div>
        </div>

        {/* RIGHT DEFCON & HARDWARE LOCKOUT BADGES */}
        <div className="flex items-center gap-2 flex-wrap justify-end w-full lg:w-auto">
          {/* DEFCON Threat Badge */}
          <div className={`flex items-center gap-1.5 px-3 py-1 border font-mono text-xs ${threatColor}`}>
            <ShieldAlert className="w-4 h-4" />
            <div className="flex flex-col">
              <span className="text-[8px] uppercase tracking-wider font-bold">Threat Level</span>
              <span className="font-bold tracking-wider">{state.threatLevel}</span>
            </div>
          </div>

          {/* Physical Hardware Lockout Indicator */}
          <div className={`flex items-center gap-1.5 px-3 py-1 border font-mono text-xs ${lockoutColor}`}>
            {state.lockoutState === 'PHYSICAL_TRIPPED' ? (
              <AlertTriangle className="w-4 h-4 text-[#ff9f0a] animate-bounce" />
            ) : state.lockoutState === 'ENGAGED' ? (
              <Lock className="w-4 h-4 text-[#ff9f0a]" />
            ) : (
              <Unlock className="w-4 h-4 text-slate-400" />
            )}
            <div className="flex flex-col">
              <span className="text-[8px] uppercase tracking-wider font-bold">Hardware Override</span>
              <span className="font-bold tracking-wider">
                {state.lockoutState === 'PHYSICAL_TRIPPED'
                  ? 'TRIPPED [AIR-GAP]'
                  : state.lockoutState === 'ENGAGED'
                  ? 'STATUS: ENGAGED'
                  : 'DISENGAGED'}
              </span>
            </div>
          </div>

          {/* Connection Mode Badge / Toggle */}
          <button
            onClick={() => {
              audioFx.playClick('toggle');
              setShowConfigModal(true);
            }}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-[#121824] hover:bg-[#1a2334] border border-[#1d2636] text-slate-300 hover:text-white font-mono text-xs transition-colors cursor-pointer"
            title="Configure ESP32 WebSocket / Mock Telemetry"
          >
            <Wifi className={`w-3.5 h-3.5 ${state.useMockTelemetry ? 'text-[#ff9f0a]' : 'text-[#30d158]'}`} />
            <div className="flex flex-col text-left">
              <span className="text-[8px] text-slate-500 uppercase">WEBSOCKET FEED</span>
              <span className="font-semibold text-[10px] text-[#30d158]">
                {state.useMockTelemetry ? 'MOCK_STREAM' : 'ESP32 WS: ONLINE'}
              </span>
            </div>
            <Settings className="w-3.5 h-3.5 text-slate-400 ml-1" />
          </button>

          {/* Presentation Demo Mode Fail-Safe Toggle */}
          <button
            onClick={() => {
              const nextM = !state.presentationDemoMode;
              audioFx.playClick('toggle');
              setState((prev) => ({ ...prev, presentationDemoMode: nextM }));
            }}
            className={`flex items-center gap-1.5 px-2.5 py-1 font-mono text-xs border transition-colors cursor-pointer ${
              state.presentationDemoMode
                ? 'bg-emerald-950/80 border-[#30d158] text-[#30d158] font-bold shadow-[0_0_10px_rgba(48,209,88,0.3)]'
                : 'bg-[#121824] border-[#1d2636] text-slate-400 hover:text-slate-200'
            }`}
            title="Presentation Pitch Fail-Safe Demo Mode: Guarantees continuous live signal telemetry stream"
          >
            <Tv className={`w-3.5 h-3.5 ${state.presentationDemoMode ? 'text-[#30d158] animate-pulse' : 'text-slate-400'}`} />
            <div className="flex flex-col text-left">
              <span className="text-[8px] text-slate-500 uppercase">DEMO MODE</span>
              <span className="font-bold text-[10px]">
                {state.presentationDemoMode ? 'PITCH DEMO: ON' : 'PITCH DEMO: OFF'}
              </span>
            </div>
          </button>

          {/* Auditory Feedback Mute Toggle */}
          <button
            onClick={() => {
              const nextMuted = !state.isMuted;
              audioFx.setMuted(nextMuted);
              if (!nextMuted) audioFx.playClick('toggle');
              setState((prev) => ({ ...prev, isMuted: nextMuted }));
            }}
            className={`p-1.5 border font-mono text-xs transition-colors cursor-pointer flex items-center justify-center ${
              state.isMuted
                ? 'bg-red-950/40 border-red-800 text-red-400'
                : 'bg-[#121824] border-[#1d2636] text-[#30d158] hover:text-white'
            }`}
            title={state.isMuted ? 'Unmute Industrial Audio Feedback' : 'Mute Industrial Audio Feedback'}
          >
            {state.isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* Anomal Detect Navigation Button */}
          <button
            onClick={() => {
              audioFx.playClick('toggle');
              onToggleAnomalyView?.();
            }}
            className={`flex items-center gap-1.5 px-3 py-1 font-mono text-xs font-bold border transition-all cursor-pointer ${
              showAnomalyView
                ? 'bg-indigo-600 hover:bg-indigo-500 border-indigo-400 text-white shadow-[0_0_12px_rgba(99,102,241,0.5)]'
                : 'bg-[#121824] hover:bg-[#1c2438] border-indigo-500/50 text-indigo-300 hover:text-white'
            }`}
            title="Toggle Behavioral Anomaly Detection & Navigation Choreography Analysis"
          >
            <Fingerprint className={`w-4 h-4 ${showAnomalyView ? 'text-white animate-pulse' : 'text-indigo-400'}`} />
            <div className="flex flex-col text-left">
              <span className="text-[8px] uppercase tracking-wider text-indigo-300">AI BIOMETRICS</span>
              <span className="text-[10px] tracking-wider uppercase font-extrabold">ANOMAL DETECT</span>
            </div>
          </button>

          {/* Theme Switcher Button */}
          <button
            onClick={() => {
              audioFx.playClick('toggle');
              setState((prev) => ({
                ...prev,
                themeMode: prev.themeMode === 'light' ? 'dark' : 'light',
              }));
            }}
            className="flex items-center gap-1.5 px-3 py-1 bg-[#0055ff] hover:bg-[#0044cc] text-white font-mono text-xs font-bold transition-all shadow-sm cursor-pointer border border-[#0055ff]"
            title="Toggle Light / Neutral or Dark SCADA Theme"
          >
            {state.themeMode === 'light' ? (
              <>
                <Sun className="w-3.5 h-3.5 text-yellow-300 fill-yellow-300" />
                <span className="text-[10px] tracking-wider uppercase">LIGHT MODE</span>
              </>
            ) : (
              <>
                <Moon className="w-3.5 h-3.5 text-sky-200" />
                <span className="text-[10px] tracking-wider uppercase">DARK MODE</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* WEBSOCKET / TELEMETRY CONFIGURATION MODAL */}
      {showConfigModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0e1626] border border-[#23334c] rounded-md max-w-md w-full p-5 font-mono text-slate-200 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-[#1f2d42] pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Radio className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-sm tracking-wider text-white">HARDWARE WEBSOCKET INTEGRATION</h3>
              </div>
              <button
                onClick={() => setShowConfigModal(false)}
                className="text-slate-400 hover:text-white text-lg font-bold px-2 py-0.5 hover:bg-slate-800 rounded"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-300 mb-4 leading-relaxed font-sans">
              Connect dashboard directly to the physical ESP32 microcontroller WebSocket server on port 81 (`ws://&lt;ESP32_IP&gt;:81`). If hardware is disconnected or offline, fallback mock telemetry automatically feeds signal jitter and simulated events.
            </p>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1 uppercase tracking-wider">
                  ESP32 WebSocket Endpoint:
                </label>
                <input
                  type="text"
                  value={inputWsUrl}
                  onChange={(e) => setInputWsUrl(e.target.value)}
                  placeholder="ws://192.168.1.100:81"
                  className="w-full bg-[#070b12] border border-[#22334d] rounded px-3 py-2 text-emerald-300 font-mono text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="p-3 bg-[#070b12] border border-[#1c293c] rounded flex items-center justify-between">
                <div>
                  <div className="font-bold text-white text-xs">Fallback Mock Telemetry Stream</div>
                  <div className="text-[10px] text-slate-400">Generate realistic noise floor, voltage fluctuations & beam breaks</div>
                </div>
                <button
                  onClick={handleToggleMockMode}
                  className={`px-3 py-1.5 rounded font-bold text-xs transition-colors cursor-pointer ${
                    state.useMockTelemetry
                      ? 'bg-amber-600 hover:bg-amber-500 text-white'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                  }`}
                >
                  {state.useMockTelemetry ? 'MOCK ACTIVE' : 'USE MOCK'}
                </button>
              </div>

              <div className="pt-2 border-t border-[#1f2d42] flex items-center justify-between gap-2">
                <button
                  onClick={onResetSystem}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded font-bold text-xs cursor-pointer"
                >
                  Reset Telemetry Logs
                </button>
                <button
                  onClick={handleSaveWsUrl}
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-bold text-xs cursor-pointer"
                >
                  Connect Hardware WS
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
