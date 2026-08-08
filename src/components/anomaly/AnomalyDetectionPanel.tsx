import React, { useState, useRef, useEffect, useMemo } from 'react';
import { SystemState } from '../../types';
import { audioFx } from '../../services/telemetryEngine';
import {
  CHOREOGRAPHY_FILES,
  SESSION_COLORS,
  THRESHOLD,
  getBadgeClass,
  getBadgeText,
  dist,
  drawPath,
  drawStraight,
  classScore,
  buildReasons,
  generateAlertId,
} from './choreographyEngine';
import { NavigationPoint, SessionFeatures, SessionStateMap } from './types';
import {
  ShieldAlert,
  ShieldCheck,
  Fingerprint,
  RotateCcw,
  Search,
  CheckCircle2,
  AlertTriangle,
  X,
  FileText,
  BarChart3,
  ExternalLink,
} from 'lucide-react';
import './anomalyDetection.css';

interface Props {
  state: SystemState;
  onClose?: () => void;
}

export const AnomalyDetectionPanel: React.FC<Props> = ({ state, onClose }) => {
  const [searchA, setSearchA] = useState('');
  const [searchB, setSearchB] = useState('');

  const [sessionData, setSessionData] = useState<SessionStateMap>({
    A: null,
    B: null,
  });

  // Canvas and Tracking Refs
  const canvasRefA = useRef<HTMLCanvasElement | null>(null);
  const canvasRefB = useRef<HTMLCanvasElement | null>(null);
  const listRefA = useRef<HTMLDivElement | null>(null);
  const listRefB = useRef<HTMLDivElement | null>(null);

  const trackingRefA = useRef<{
    rowName: string;
    sens: number;
    entry: NavigationPoint;
    path: NavigationPoint[];
    scrollCount: number;
  } | null>(null);

  const trackingRefB = useRef<{
    rowName: string;
    sens: number;
    entry: NavigationPoint;
    path: NavigationPoint[];
    scrollCount: number;
  } | null>(null);

  // Filtered file lists
  const filteredFilesA = useMemo(() => {
    return CHOREOGRAPHY_FILES.filter((f) =>
      f.name.toLowerCase().includes(searchA.toLowerCase().trim())
    );
  }, [searchA]);

  const filteredFilesB = useMemo(() => {
    return CHOREOGRAPHY_FILES.filter((f) =>
      f.name.toLowerCase().includes(searchB.toLowerCase().trim())
    );
  }, [searchB]);

  // Canvas Resize Handler
  const handleResize = () => {
    [
      { canvas: canvasRefA.current, list: listRefA.current },
      { canvas: canvasRefB.current, list: listRefB.current },
    ].forEach(({ canvas, list }) => {
      if (canvas && list) {
        canvas.width = list.clientWidth;
        canvas.height = list.clientHeight;
      }
    });
  };

  useEffect(() => {
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [filteredFilesA, filteredFilesB]);

  // Session interaction handlers
  const handleMouseEnterRow = (
    letter: 'A' | 'B',
    fileName: string,
    sens: number,
    e: React.MouseEvent<HTMLDivElement>
  ) => {
    const listEl = letter === 'A' ? listRefA.current : listRefB.current;
    const canvasEl = letter === 'A' ? canvasRefA.current : canvasRefB.current;
    if (!listEl || !canvasEl) return;

    const ctx = canvasEl.getContext('2d');
    if (ctx) ctx.clearRect(0, 0, canvasEl.width, canvasEl.height);

    const rect = listEl.getBoundingClientRect();
    const entryPt: NavigationPoint = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      t: performance.now(),
    };

    const trackingObj = {
      rowName: fileName,
      sens,
      entry: entryPt,
      path: [entryPt],
      scrollCount: 0,
    };

    if (letter === 'A') trackingRefA.current = trackingObj;
    else trackingRefB.current = trackingObj;
  };

  const handleMouseMoveList = (letter: 'A' | 'B', e: React.MouseEvent<HTMLDivElement>) => {
    const listEl = letter === 'A' ? listRefA.current : listRefB.current;
    const canvasEl = letter === 'A' ? canvasRefA.current : canvasRefB.current;
    const tracking = letter === 'A' ? trackingRefA.current : trackingRefB.current;

    if (!listEl || !canvasEl || !tracking) return;

    const rect = listEl.getBoundingClientRect();
    const currentPt: NavigationPoint = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };

    tracking.path.push(currentPt);

    const ctx = canvasEl.getContext('2d');
    if (ctx) drawPath(ctx, tracking.path);
  };

  const handleWheelList = (letter: 'A' | 'B') => {
    const tracking = letter === 'A' ? trackingRefA.current : trackingRefB.current;
    if (tracking) tracking.scrollCount++;
  };

  const handleClickRow = (
    letter: 'A' | 'B',
    fileName: string,
    sens: number,
    e: React.MouseEvent<HTMLDivElement>
  ) => {
    const listEl = letter === 'A' ? listRefA.current : listRefB.current;
    const canvasEl = letter === 'A' ? canvasRefA.current : canvasRefB.current;
    const tracking = letter === 'A' ? trackingRefA.current : trackingRefB.current;

    if (!listEl || !canvasEl || !tracking || tracking.rowName !== fileName) return;

    const rect = listEl.getBoundingClientRect();
    const clickPt: NavigationPoint = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };

    const dwellMs = performance.now() - (tracking.entry.t || performance.now());
    let pathLen = 0;
    for (let i = 1; i < tracking.path.length; i++) {
      pathLen += dist(tracking.path[i - 1], tracking.path[i]);
    }
    const straight = dist(tracking.entry, clickPt);
    const efficiency = pathLen > 2 ? Math.min(1, straight / pathLen) : 1;

    const ctx = canvasEl.getContext('2d');
    if (ctx) {
      drawPath(ctx, tracking.path);
      drawStraight(ctx, tracking.entry, clickPt, SESSION_COLORS[letter]);
    }

    const features: SessionFeatures = {
      efficiency,
      dwellMs,
      scrollCount: tracking.scrollCount,
      sens,
      offHours: false,
      fname: fileName,
    };

    audioFx.playClick(letter === 'A' ? 'toggle' : 'alarm');

    setSessionData((prev) => ({
      ...prev,
      [letter]: features,
    }));

    if (letter === 'A') trackingRefA.current = null;
    else trackingRefB.current = null;
  };

  const handleResetSessions = () => {
    audioFx.playClick('toggle');
    setSessionData({ A: null, B: null });
    [canvasRefA.current, canvasRefB.current].forEach((canvas) => {
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    });
    trackingRefA.current = null;
    trackingRefB.current = null;
  };

  // Compute Top Detection Result
  const detectionResult = useMemo(() => {
    const scored = (['A', 'B'] as const)
      .filter((l) => sessionData[l] !== null)
      .map((l) => {
        const f = sessionData[l]!;
        const score = classScore(l, f);
        return { letter: l, f, score };
      })
      .sort((a, b) => b.score - a.score);

    if (scored.length === 0) return null;

    const top = scored[0];
    const suspicious = top.score >= THRESHOLD;
    const pct = Math.round(top.score * 100);
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now
      .getMinutes()
      .toString()
      .padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;

    return {
      top,
      suspicious,
      pct,
      timeStr,
      alertId: generateAlertId(top.letter),
      reasons: buildReasons(top.letter, top.f),
    };
  }, [sessionData]);

  return (
    <div className="anomaly-view-root p-4 sm:p-8">
      <div className="anomaly-wrap">
        {/* HEADER BAR */}
        <header className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E1E3E9] pb-5">
          <div>
            <div className="ad-eyebrow flex items-center gap-2 mb-1">
              <Fingerprint className="w-4 h-4 text-[#159A48]" />
              <span>Insider Threat Biometrics · Navigation Choreography (Anomaly Detection)</span>
            </div>
            <h1 className="ad-title">Behavioral Anomaly Detection</h1>
            <p className="ad-subtitle">
              Two file browsers below track your real mouse path, dwell time, and scroll behaviour as you navigate — no simulation. Play the real user on the left, then play the impersonator / insider on the right, and watch the detection result react.
            </p>
          </div>

          <div className="flex items-center gap-2.5 self-start sm:self-center">
            <button
              onClick={handleResetSessions}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-[#FFFFFF] hover:bg-[#F0F1F4] text-[#333846] hover:text-[#12141B] border border-[#D5D8E0] rounded-md text-xs font-mono font-semibold transition-all shadow-sm cursor-pointer"
              title="Reset Live Trajectories & Verdicts"
            >
              <RotateCcw className="w-3.5 h-3.5 text-[#767C8A]" />
              <span>RESET DATA</span>
            </button>

            {onClose && (
              <button
                onClick={onClose}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-[#D6293E] hover:bg-[#b82032] text-white border border-[#D6293E] rounded-md text-xs font-mono font-bold transition-all shadow-sm cursor-pointer"
                title="Return to SCADA Main Grid"
              >
                <X className="w-3.5 h-3.5" />
                <span>CLOSE</span>
              </button>
            )}
          </div>
        </header>

        {/* SESSIONS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* SESSION A: REAL USER */}
          <div className="ad-session-panel" data-session="A">
            <div className="ad-panel-header">
              <div>
                <div className="ad-panel-title-A flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#159A48]" />
                  <span>SESSION A — REAL USER</span>
                </div>
                <div className="ad-panel-desc">
                  Browse naturally: hover around, wander a bit, and open a couple of ordinary files.
                </div>
              </div>
              <div className="ad-badge normal">
                TRUE / BASELINE
              </div>
            </div>

            <div className="ad-search-box">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-[#767C8A] absolute left-2.5 top-2.5 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search files..."
                  value={searchA}
                  onChange={(e) => setSearchA(e.target.value)}
                  className="ad-search-input"
                />
              </div>
            </div>

            <div
              className="ad-file-list"
              ref={listRefA}
              onWheel={() => handleWheelList('A')}
              onMouseMove={(e) => handleMouseMoveList('A', e)}
            >
              <canvas ref={canvasRefA} className="absolute inset-0 pointer-events-none z-10" />
              <div className="space-y-1">
                {filteredFilesA.map((f) => (
                  <div
                    key={f.name}
                    className="ad-file-row"
                    onMouseEnter={(e) => handleMouseEnterRow('A', f.name, f.sens, e)}
                    onClick={(e) => handleClickRow('A', f.name, f.sens, e)}
                  >
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 ad-icon" />
                      <span className="ad-fname">{f.name}</span>
                    </div>
                    <span className={`ad-badge ${getBadgeClass(f.sens)}`}>
                      {getBadgeText(f.sens)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* SESSION B: TEST / IMPERSONATOR */}
          <div className="ad-session-panel" data-session="B">
            <div className="ad-panel-header">
              <div>
                <div className="ad-panel-title-B flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-[#D6293E]" />
                  <span>SESSION B — TEST / IMPERSONATOR</span>
                </div>
                <div className="ad-panel-desc">
                  Go straight for a sensitive file. Pause on the name, then click it.
                </div>
              </div>
              <div className="ad-badge suspicious">
                FALSE / IMPOSTOR
              </div>
            </div>

            <div className="ad-search-box">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-[#767C8A] absolute left-2.5 top-2.5 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search files..."
                  value={searchB}
                  onChange={(e) => setSearchB(e.target.value)}
                  className="ad-search-input"
                />
              </div>
            </div>

            <div
              className="ad-file-list"
              ref={listRefB}
              onWheel={() => handleWheelList('B')}
              onMouseMove={(e) => handleMouseMoveList('B', e)}
            >
              <canvas ref={canvasRefB} className="absolute inset-0 pointer-events-none z-10" />
              <div className="space-y-1">
                {filteredFilesB.map((f) => (
                  <div
                    key={f.name}
                    className="ad-file-row"
                    onMouseEnter={(e) => handleMouseEnterRow('B', f.name, f.sens, e)}
                    onClick={(e) => handleClickRow('B', f.name, f.sens, e)}
                  >
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 ad-icon" />
                      <span className="ad-fname">{f.name}</span>
                    </div>
                    <span className={`ad-badge ${getBadgeClass(f.sens)}`}>
                      {getBadgeText(f.sens)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* VERDICT CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* VERDICT A */}
          <div className="ad-card p-5">
            <div className="flex justify-between items-center mb-3">
              <span className="ad-verdict-header">SESSION A VERDICT</span>
              {sessionData.A ? (
                <span className="ad-badge normal">
                  NORMAL · {Math.round(classScore('A', sessionData.A) * 100)}%
                </span>
              ) : (
                <span className="font-mono text-xs px-2.5 py-1 rounded bg-[#F0F1F4] text-[#767C8A]">
                  AWAITING DATA
                </span>
              )}
            </div>

            <div className="h-2 rounded bg-[#EEF0F4] overflow-hidden mb-4">
              <div
                className="h-full bg-[#159A48] transition-all duration-500"
                style={{ width: sessionData.A ? `${Math.round(classScore('A', sessionData.A) * 100)}%` : '0%' }}
              />
            </div>

            {sessionData.A ? (
              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <div className="ad-metric-row">
                  <span className="ad-metric-label">Target file</span>
                  <b className="ad-metric-value truncate max-w-[130px]">{sessionData.A.fname}</b>
                </div>
                <div className="ad-metric-row">
                  <span className="ad-metric-label">Path efficiency</span>
                  <b className="text-[#159A48] font-bold">{Math.round(sessionData.A.efficiency * 100)}%</b>
                </div>
                <div className="ad-metric-row">
                  <span className="ad-metric-label">Dwell time</span>
                  <b className="ad-metric-value">{(sessionData.A.dwellMs / 1000).toFixed(2)}s</b>
                </div>
                <div className="ad-metric-row">
                  <span className="ad-metric-label">Sensitivity</span>
                  <b className="ad-metric-value">{getBadgeText(sessionData.A.sens)}</b>
                </div>
                <div className="ad-metric-row">
                  <span className="ad-metric-label">Scroll count</span>
                  <b className="ad-metric-value">{sessionData.A.scrollCount}</b>
                </div>
                <div className="ad-metric-row">
                  <span className="ad-metric-label">Off-hours</span>
                  <b className="text-[#767C8A]">NO</b>
                </div>
              </div>
            ) : (
              <div className="text-xs text-[#767C8A] font-mono text-center py-6">
                Hover and click on any file in Session A above to compute live behavioral telemetry.
              </div>
            )}
          </div>

          {/* VERDICT B */}
          <div className="ad-card p-5">
            <div className="flex justify-between items-center mb-3">
              <span className="ad-verdict-header">SESSION B VERDICT</span>
              {sessionData.B ? (
                <span className="ad-badge suspicious">
                  SUSPICIOUS · {Math.round(classScore('B', sessionData.B) * 100)}%
                </span>
              ) : (
                <span className="font-mono text-xs px-2.5 py-1 rounded bg-[#F0F1F4] text-[#767C8A]">
                  AWAITING DATA
                </span>
              )}
            </div>

            <div className="h-2 rounded bg-[#EEF0F4] overflow-hidden mb-4">
              <div
                className="h-full bg-[#D6293E] transition-all duration-500"
                style={{ width: sessionData.B ? `${Math.round(classScore('B', sessionData.B) * 100)}%` : '0%' }}
              />
            </div>

            {sessionData.B ? (
              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <div className="ad-metric-row">
                  <span className="ad-metric-label">Target file</span>
                  <b className="ad-metric-value truncate max-w-[130px]">{sessionData.B.fname}</b>
                </div>
                <div className="ad-metric-row">
                  <span className="ad-metric-label">Path efficiency</span>
                  <b className="text-[#D6293E] font-bold">{Math.round(sessionData.B.efficiency * 100)}%</b>
                </div>
                <div className="ad-metric-row">
                  <span className="ad-metric-label">Dwell time</span>
                  <b className="ad-metric-value">{(sessionData.B.dwellMs / 1000).toFixed(2)}s</b>
                </div>
                <div className="ad-metric-row">
                  <span className="ad-metric-label">Sensitivity</span>
                  <b className="text-[#D6293E] font-bold">{getBadgeText(sessionData.B.sens)}</b>
                </div>
                <div className="ad-metric-row">
                  <span className="ad-metric-label">Scroll count</span>
                  <b className="ad-metric-value">{sessionData.B.scrollCount}</b>
                </div>
                <div className="ad-metric-row">
                  <span className="ad-metric-label">Off-hours</span>
                  <b className={sessionData.B.offHours ? 'text-[#B5790A] font-bold' : 'text-[#767C8A]'}>
                    {sessionData.B.offHours ? 'YES (02:14 AM)' : 'NO'}
                  </b>
                </div>
              </div>
            ) : (
              <div className="text-xs text-[#767C8A] font-mono text-center py-6">
                Hover and click on any file in Session B above to compute live behavioral telemetry.
              </div>
            )}
          </div>
        </div>

        {/* DETECTION RESULT CARD */}
        <div className={`ad-detection-box mb-6 ${detectionResult ? (detectionResult.suspicious ? 'is-alert' : 'is-clear') : ''}`}>
          <div className="flex justify-between items-start gap-4 flex-wrap mb-3">
            <div>
              <div className="ad-eyebrow">AI Detection Engine Verdict</div>
              <h3 className={`font-mono text-lg sm:text-xl font-bold mt-1 ${detectionResult ? (detectionResult.suspicious ? 'text-[#D6293E]' : 'text-[#159A48]') : 'text-[#767C8A]'}`}>
                {detectionResult
                  ? detectionResult.suspicious
                    ? `SESSION ${detectionResult.top.letter} — FALSE (IMPERSONATOR DETECTED) · ${detectionResult.pct}% CONFIDENCE`
                    : `SESSION ${detectionResult.top.letter} — TRUE (LEGITIMATE USER) · ${detectionResult.pct}% CONFIDENCE`
                  : 'AWAITING SESSION DATA'}
              </h3>
            </div>

            {detectionResult && (
              <div className="font-mono text-xs text-[#555C6D] text-right leading-relaxed">
                <div>Alert ID: <b className="text-[#12141B]">{detectionResult.alertId}</b></div>
                <div>Timestamp: <b className="text-[#12141B]">{detectionResult.timeStr}</b></div>
                <div>Session: <b className="text-[#12141B]">{detectionResult.top.letter}</b> · Account: <b className="text-[#12141B]">{detectionResult.top.letter === 'A' ? 'real_operator' : 'test_session_svc'}</b></div>
              </div>
            )}
          </div>

          {detectionResult ? (
            <>
              <ul className="space-y-2 my-4 border-t border-[#E1E3E9] pt-3 text-xs text-[#333846]">
                {detectionResult.reasons.map((reason, idx) => (
                  <li key={idx} className="flex items-start gap-2 leading-relaxed">
                    <span className={detectionResult.suspicious ? 'text-[#D6293E] font-bold text-sm leading-none' : 'text-[#159A48] font-bold text-sm leading-none'}>
                      {detectionResult.suspicious ? '▸' : '✓'}
                    </span>
                    <span>{reason}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-4 pt-3 border-t border-dashed border-[#E1E3E9] flex items-center gap-3 flex-wrap text-xs font-mono text-[#333846]">
                <span className={`ad-soc-btn ${detectionResult.suspicious ? 'alert' : 'clear'}`}>
                  {detectionResult.suspicious ? 'ESCALATE TO SOC' : 'NO ACTION NEEDED'}
                </span>
                <span className="text-[#555C6D]">
                  {detectionResult.suspicious
                    ? 'Require zero-trust step-up authentication on next sensitive-file access · Flag session for live replay review'
                    : 'Session interaction metadata verified and logged for baseline model training'}
                </span>
              </div>
            </>
          ) : (
            <p className="text-xs text-[#767C8A] font-mono py-2">
              Interact with the file explorer tables above to generate real-time choreography vectors.
            </p>
          )}
        </div>

        {/* FEATURE VECTOR COMPARISON */}
        <div className="ad-card p-5 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-4 h-4 text-[#475569]" />
            <h3 className="ad-eyebrow font-bold text-[#12141B]">
              Feature Vector Comparison (5-Dimensional Biometric Model)
            </h3>
          </div>

          <div className="space-y-4">
            {/* 1. Path Efficiency */}
            <div>
              <div className="flex justify-between text-xs font-mono text-[#555C6D] mb-1 font-medium">
                <span>1. Path Efficiency (Directness vs Curvature)</span>
                <span className="font-bold text-[#12141B]">{sessionData.A ? `${Math.round(sessionData.A.efficiency * 100)}%` : '--'} vs {sessionData.B ? `${Math.round(sessionData.B.efficiency * 100)}%` : '--'}</span>
              </div>
              <div className="space-y-1">
                <div className="ad-bar-bg">
                  <div className="ad-bar-fill-A" style={{ width: sessionData.A ? `${Math.round(sessionData.A.efficiency * 100)}%` : '0%' }} />
                  <span className="absolute right-2 top-0 text-[9px] font-mono text-[#555C6D] leading-3 font-semibold">Session A</span>
                </div>
                <div className="ad-bar-bg">
                  <div className="ad-bar-fill-B" style={{ width: sessionData.B ? `${Math.round(sessionData.B.efficiency * 100)}%` : '0%' }} />
                  <span className="absolute right-2 top-0 text-[9px] font-mono text-[#555C6D] leading-3 font-semibold">Session B</span>
                </div>
              </div>
            </div>

            {/* 2. Dwell Time Hesitation */}
            <div>
              <div className="flex justify-between text-xs font-mono text-[#555C6D] mb-1 font-medium">
                <span>2. Dwell Time / Target Hover Reconnaissance</span>
                <span className="font-bold text-[#12141B]">{sessionData.A ? `${(sessionData.A.dwellMs / 1000).toFixed(2)}s` : '--'} vs {sessionData.B ? `${(sessionData.B.dwellMs / 1000).toFixed(2)}s` : '--'}</span>
              </div>
              <div className="space-y-1">
                <div className="ad-bar-bg">
                  <div className="ad-bar-fill-A" style={{ width: sessionData.A ? `${Math.min(100, (sessionData.A.dwellMs / 3000) * 100)}%` : '0%' }} />
                  <span className="absolute right-2 top-0 text-[9px] font-mono text-[#555C6D] leading-3 font-semibold">Session A</span>
                </div>
                <div className="ad-bar-bg">
                  <div className="ad-bar-fill-B" style={{ width: sessionData.B ? `${Math.min(100, (sessionData.B.dwellMs / 3000) * 100)}%` : '0%' }} />
                  <span className="absolute right-2 top-0 text-[9px] font-mono text-[#555C6D] leading-3 font-semibold">Session B</span>
                </div>
              </div>
            </div>

            {/* 3. Target File Sensitivity */}
            <div>
              <div className="flex justify-between text-xs font-mono text-[#555C6D] mb-1 font-medium">
                <span>3. Target File Sensitivity Classification</span>
                <span className="font-bold text-[#12141B]">{sessionData.A ? getBadgeText(sessionData.A.sens) : '--'} vs {sessionData.B ? getBadgeText(sessionData.B.sens) : '--'}</span>
              </div>
              <div className="space-y-1">
                <div className="ad-bar-bg">
                  <div className="ad-bar-fill-A" style={{ width: sessionData.A ? `${sessionData.A.sens * 100}%` : '0%' }} />
                  <span className="absolute right-2 top-0 text-[9px] font-mono text-[#555C6D] leading-3 font-semibold">Session A</span>
                </div>
                <div className="ad-bar-bg">
                  <div className="ad-bar-fill-B" style={{ width: sessionData.B ? `${sessionData.B.sens * 100}%` : '0%' }} />
                  <span className="absolute right-2 top-0 text-[9px] font-mono text-[#555C6D] leading-3 font-semibold">Session B</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* FOOTER DISCLOSURE */}
        <footer className="text-xs font-mono text-[#767C8A] border-t border-[#E1E3E9] pt-4 leading-relaxed">
          Path efficiency and dwell time are computed live from actual <b className="text-[#12141B]">mousemove</b> and <b className="text-[#12141B]">click</b> interaction events (Fitts's Law: intentional, known-target movement is mathematically more direct than exploratory movement). No file contents or keystrokes are captured — only navigation trajectory metadata. Production deployment runs an ensemble Isolation Forest trained on user baseline interaction profiles.
        </footer>
      </div>
    </div>
  );
};
