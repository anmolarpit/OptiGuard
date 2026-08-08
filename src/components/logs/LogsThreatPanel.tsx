import React, { useState, useRef, useEffect } from 'react';
import { LogEntry, SystemState, CyberCommand } from '../../types';
import { audioFx } from '../../services/telemetryEngine';
import { Terminal, ShieldAlert, FileText, Pause, Play, Download, Trash2, Code, ShieldCheck, CheckCircle2, AlertTriangle, Filter } from 'lucide-react';

interface Props {
  state: SystemState;
  setState: React.Dispatch<React.SetStateAction<SystemState>>;
}

export const LogsThreatPanel: React.FC<Props> = ({ state, setState }) => {
  const [activeTab, setActiveTab] = useState<'terminal' | 'threat_inspector'>('terminal');
  const [filterLevel, setFilterLevel] = useState<'ALL' | 'INFO' | 'WARN' | 'ALERT' | 'HARDWARE'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isPauseScroll, setIsPauseScroll] = useState(false);
  const logContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll terminal to bottom unless paused
  useEffect(() => {
    if (!isPauseScroll && logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [state.logs, isPauseScroll]);

  const filteredLogs = state.logs.filter((log) => {
    if (filterLevel !== 'ALL' && log.level !== filterLevel) return false;
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      return (
        log.message.toLowerCase().includes(q) ||
        log.source.toLowerCase().includes(q) ||
        log.level.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleClearLogs = () => {
    audioFx.playClick('toggle');
    setState((prev) => ({ ...prev, logs: [] }));
  };

  const handleExportLogs = () => {
    audioFx.playClick('toggle');
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(state.logs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `optiguard_scada_logs_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleExportLogsCsv = () => {
    audioFx.playClick('toggle');
    const headers = 'Timestamp,Level,Source,Message\n';
    const rows = state.logs
      .map(
        (l) =>
          `"${l.timestamp}","${l.level}","${l.source}","${l.message.replace(/"/g, '""')}"`
      )
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `optiguard_scada_incident_logs_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const getLogStyle = (level: LogEntry['level']) => {
    switch (level) {
      case 'CRITICAL':
      case 'ALERT':
        return 'text-red-400 bg-red-950/30 border-l-2 border-red-500 font-bold';
      case 'HARDWARE':
        return 'text-amber-300 bg-amber-950/20 border-l-2 border-amber-500 font-bold';
      case 'WARN':
        return 'text-amber-400';
      default:
        return 'text-emerald-300';
    }
  };

  return (
    <section className="scada-panel flex flex-col h-full border border-[#1d2636] corner-brackets overflow-hidden">
      {/* HEADER & TAB SWITCHER */}
      <div className="flex items-center justify-between px-3.5 h-10 bg-[#0a0f19] border-b border-[#1d2636] font-mono text-xs select-none">
        <div className="flex items-center gap-1.5">
          <Terminal className="w-4 h-4 text-[#30d158]" />
          <button
            onClick={() => {
              audioFx.playClick('toggle');
              setActiveTab('terminal');
            }}
            className={`px-2.5 py-1 rounded-sm font-bold transition-colors cursor-pointer ${
              activeTab === 'terminal'
                ? 'bg-[#18263a] text-white border border-[#2b3e5a]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            PANEL C: LIVE TERMINAL LOGS ({state.logs.length})
          </button>
          <button
            onClick={() => {
              audioFx.playClick('toggle');
              setActiveTab('threat_inspector');
            }}
            className={`px-2.5 py-1 rounded-sm font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'threat_inspector'
                ? 'bg-[#18263a] text-white border border-[#2b3e5a]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5 text-[#ff9f0a]" />
            THREAT INSPECTOR ({state.recentThreats.length})
          </button>
        </div>

        {/* LOG CONTROLS */}
        {activeTab === 'terminal' && (
          <div className="flex items-center gap-1.5 flex-wrap">
            <input
              type="text"
              placeholder="Search logs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-[#05080e] border border-[#1d283b] text-slate-200 text-[10px] rounded-sm px-2 py-0.5 font-mono focus:outline-none w-28 focus:w-36 transition-all"
            />

            <select
              value={filterLevel}
              onChange={(e) => setFilterLevel(e.target.value as any)}
              className="bg-[#05080e] border border-[#1d283b] text-slate-300 text-[10px] rounded-sm px-1.5 py-0.5 font-mono focus:outline-none"
            >
              <option value="ALL">FILTER: ALL</option>
              <option value="INFO">INFO ONLY</option>
              <option value="HARDWARE">HARDWARE TRIPS</option>
              <option value="ALERT">ALERT/THREATS</option>
            </select>

            <button
              onClick={() => setIsPauseScroll(!isPauseScroll)}
              className="p-1 text-slate-400 hover:text-white bg-slate-900 border border-slate-700 rounded-sm transition-colors cursor-pointer"
              title={isPauseScroll ? 'Resume Auto-Scroll' : 'Pause Auto-Scroll'}
            >
              {isPauseScroll ? <Play className="w-3.5 h-3.5 text-[#ff9f0a]" /> : <Pause className="w-3.5 h-3.5" />}
            </button>

            <button
              onClick={handleExportLogsCsv}
              className="px-1.5 py-0.5 text-[9px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800 hover:bg-emerald-900 rounded-sm transition-colors cursor-pointer flex items-center gap-1"
              title="Export Incident Log (.csv)"
            >
              <FileText className="w-3 h-3" />
              CSV
            </button>

            <button
              onClick={handleExportLogs}
              className="p-1 text-slate-400 hover:text-white bg-slate-900 border border-slate-700 rounded-sm transition-colors cursor-pointer"
              title="Export Log File (.json)"
            >
              <Download className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={handleClearLogs}
              className="p-1 text-slate-400 hover:text-[#ff453a] bg-slate-900 border border-slate-700 rounded-sm transition-colors cursor-pointer"
              title="Clear Logs"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* CONTENT AREA */}
      <div className="flex-1 bg-[#080d16] p-3 font-mono text-xs overflow-hidden flex flex-col gap-3">
        {/* TOP BASELINE NUMERICAL READOUT STRIP */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {/* Card 1: Log Buffer Count */}
          <div className="bg-[#0c1320] border border-[#1c293c] p-2.5 rounded-sm flex flex-col justify-between h-[76px]">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold truncate flex items-center gap-1">
              <FileText className="w-3 h-3 text-[#30d158]" /> Log Buffer
            </span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-base font-extrabold text-white font-mono tracking-tight">
                {state.logs.length}
              </span>
              <span className="text-xs font-semibold text-slate-400 font-mono">/ 150</span>
            </div>
            <div className="text-[9px] font-mono text-[#30d158]">STREAM ACTIVE</div>
          </div>

          {/* Card 2: Threat Vector Count */}
          <div className="bg-[#0c1320] border border-[#1c293c] p-2.5 rounded-sm flex flex-col justify-between h-[76px]">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold truncate flex items-center gap-1">
              <ShieldAlert className="w-3 h-3 text-[#ff9f0a]" /> Threat Count
            </span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-base font-extrabold text-white font-mono tracking-tight">
                {state.recentThreats.length}
              </span>
              <span className="text-xs font-semibold text-slate-400 font-mono">EVENTS</span>
            </div>
            <div className="text-[9px] font-mono text-[#ff9f0a]">MODBUS TCP</div>
          </div>

          {/* Card 3: Protection Rate */}
          <div className="bg-[#0c1320] border border-[#1c293c] p-2.5 rounded-sm flex flex-col justify-between h-[76px]">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold truncate flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-[#30d158]" /> Air-Gap Rate
            </span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-base font-extrabold text-white font-mono tracking-tight">
                100.0
              </span>
              <span className="text-xs font-semibold text-slate-400 font-mono">%</span>
            </div>
            <div className="text-[9px] font-mono text-slate-400">ZERO BYPASS</div>
          </div>

          {/* Card 4: System Uptime */}
          <div className="bg-[#0c1320] border border-[#1c293c] p-2.5 rounded-sm flex flex-col justify-between h-[76px]">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold truncate flex items-center gap-1">
              <Terminal className="w-3 h-3 text-sky-400" /> System Uptime
            </span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-base font-extrabold text-white font-mono tracking-tight">
                {Math.floor(state.uptimeCurrentMs / 1000)}
              </span>
              <span className="text-xs font-semibold text-slate-400 font-mono">SEC</span>
            </div>
            <div className="text-[9px] font-mono text-sky-400">CONTINUOUS</div>
          </div>
        </div>

        {activeTab === 'terminal' ? (
          <div
            ref={logContainerRef}
            className="flex-1 overflow-y-auto pr-1 space-y-1 select-text scrollbar-thin"
          >
            {filteredLogs.length === 0 ? (
              <div className="text-slate-500 text-center py-8 text-xs">No event logs recorded.</div>
            ) : (
              filteredLogs.map((log) => (
                <div
                  key={log.id}
                  className={`px-2 py-1 rounded text-[11px] leading-relaxed flex items-start gap-2 ${getLogStyle(
                    log.level
                  )}`}
                >
                  <span className="text-slate-500 shrink-0 font-mono">[{log.timestamp}]</span>
                  <span className="px-1 py-0.2 bg-slate-800 text-[9px] rounded text-slate-300 uppercase shrink-0">
                    {log.source}
                  </span>
                  <span className="break-all">{log.message}</span>
                </div>
              ))
            )}
          </div>
        ) : (
          /* THREAT VECTOR INSPECTOR */
          <div className="flex-1 overflow-y-auto space-y-3">
            <div className="p-2.5 bg-[#0a101b] border border-[#1b283d] rounded">
              <div className="flex items-center justify-between mb-2">
                <span className="text-amber-400 font-bold flex items-center gap-1.5 text-xs">
                  <ShieldAlert className="w-4 h-4 text-amber-400" /> INCOMING MALICIOUS PAYLOAD DUMP (MODBUS TCP)
                </span>
                <span className="text-[10px] text-slate-400">UNAUTHORIZED COIL OVERRIDE ATTEMPT</span>
              </div>

              {state.recentThreats.map((threat) => (
                <div key={threat.id} className="space-y-2 bg-[#04070d] p-2.5 rounded border border-[#162234]">
                  <div className="flex justify-between text-[11px] text-slate-300">
                    <span>Protocol: <strong className="text-sky-300">{threat.protocol}</strong></span>
                    <span>Origin: <strong className="text-red-400">{threat.originIp}</strong></span>
                    <span>Target: <strong className="text-amber-300">SUBSTATION_COIL_0x0010</strong></span>
                  </div>

                  {/* RAW HEX PAYLOAD DISPLAY */}
                  <div>
                    <span className="text-[10px] text-slate-400 block mb-0.5">RAW MODBUS FRAME (HEX):</span>
                    <div className="p-2 bg-[#000000] border border-red-900/50 rounded text-red-400 font-mono text-xs tracking-widest break-all">
                      {threat.rawHexPayload}
                    </div>
                  </div>

                  {/* ZERO TRUST PHYSICAL VALIDATION MATRIX TABLE */}
                  <div className="mt-2 border border-[#1d2b40] rounded overflow-hidden">
                    <div className="bg-[#0e1726] px-2 py-1 text-[10px] font-bold text-slate-300 uppercase">
                      Zero-Trust Physical Validation Decision Matrix
                    </div>
                    <table className="w-full text-left text-[11px]">
                      <tbody className="divide-y divide-[#172233] text-slate-300">
                        <tr>
                          <td className="p-2 text-slate-400 bg-[#090e18] w-1/3">Cyber Command Requested:</td>
                          <td className="p-2 font-bold text-amber-400">{threat.commandType}</td>
                        </tr>
                        <tr>
                          <td className="p-2 text-slate-400 bg-[#090e18]">Physical Ground Truth (IR Beam):</td>
                          <td className="p-2 font-bold text-emerald-400 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> BEAM INTACT (NO PHYSICAL OCCUPANCY)
                          </td>
                        </tr>
                        <tr>
                          <td className="p-2 text-slate-400 bg-[#090e18]">SCADA Decision Engine:</td>
                          <td className="p-2 font-bold text-red-400">
                            {threat.status} — PHYSICAL OVERRIDE LATCHED
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-2.5 bg-[#090f18] border border-[#1b273b] rounded flex items-center justify-between text-xs text-slate-300">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" /> Physical Air-Gap Protection Rate:
              </span>
              <span className="font-bold text-emerald-400 text-sm">100.00% (ZERO UNSPOOFABLE BYPASS)</span>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
