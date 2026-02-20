"use client";

import Link from "next/link";
import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import ThemeToggle from "../components/theme-toggle";
import FullscreenButton from "../components/fullscreen-button";

type Point = { x: number; y: number };

const PRESETS: Record<string, { label: string; p1: Point; p2: Point }> = {
  linear:     { label: "Linear",      p1: { x: 0.25, y: 0.25 }, p2: { x: 0.75, y: 0.75 } },
  ease:       { label: "Ease",        p1: { x: 0.25, y: 0.1 },  p2: { x: 0.25, y: 1.0 } },
  easeIn:     { label: "Ease In",     p1: { x: 0.42, y: 0.0 },  p2: { x: 1.0, y: 1.0 } },
  easeOut:    { label: "Ease Out",    p1: { x: 0.0, y: 0.0 },   p2: { x: 0.58, y: 1.0 } },
  easeInOut:  { label: "Ease In Out", p1: { x: 0.42, y: 0.0 },  p2: { x: 0.58, y: 1.0 } },
  snappy:     { label: "Snappy",      p1: { x: 0.2, y: 0.0 },   p2: { x: 0.0, y: 1.0 } },
  bouncy:     { label: "Bouncy",      p1: { x: 0.68, y: -0.55 }, p2: { x: 0.27, y: 1.55 } },
  spring:     { label: "Spring",      p1: { x: 0.175, y: 0.885 }, p2: { x: 0.32, y: 1.275 } },
  smooth:     { label: "Smooth",      p1: { x: 0.4, y: 0.0 },   p2: { x: 0.2, y: 1.0 } },
  aggressive: { label: "Aggressive",  p1: { x: 0.9, y: 0.0 },   p2: { x: 0.1, y: 1.0 } },
};

function cubicBezier(p1: Point, p2: Point, t: number): Point {
  const cx = 3 * p1.x;
  const bx = 3 * (p2.x - p1.x) - cx;
  const ax = 1 - cx - bx;
  const cy = 3 * p1.y;
  const by = 3 * (p2.y - p1.y) - cy;
  const ay = 1 - cy - by;
  return {
    x: ((ax * t + bx) * t + cx) * t,
    y: ((ay * t + by) * t + cy) * t,
  };
}

export default function EasingPage() {
  const previewRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [copied, setCopied] = useState(false);
  const [p1, setP1] = useState<Point>({ x: 0.4, y: 0.0 });
  const [p2, setP2] = useState<Point>({ x: 0.2, y: 1.0 });
  const [duration, setDuration] = useState(600);
  const [animKey, setAnimKey] = useState(0);
  const [dragging, setDragging] = useState<"p1" | "p2" | null>(null);

  // SVG dimensions
  const W = 300;
  const H = 300;
  const PAD = 40;
  const plotW = W - PAD * 2;
  const plotH = H - PAD * 2;

  // Map control points to SVG coords
  const toSVG = useCallback(
    (p: Point): Point => ({
      x: PAD + p.x * plotW,
      y: PAD + (1 - p.y) * plotH,
    }),
    [plotW, plotH]
  );

  const fromSVG = useCallback(
    (sx: number, sy: number): Point => ({
      x: Math.max(0, Math.min(1, (sx - PAD) / plotW)),
      y: Math.max(-0.5, Math.min(1.5, 1 - (sy - PAD) / plotH)),
    }),
    [plotW, plotH]
  );

  // Generate curve path
  const curvePath = useMemo(() => {
    const steps = 80;
    const points: string[] = [];
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const pt = cubicBezier(p1, p2, t);
      const sx = PAD + pt.x * plotW;
      const sy = PAD + (1 - pt.y) * plotH;
      points.push(`${i === 0 ? "M" : "L"} ${sx.toFixed(1)} ${sy.toFixed(1)}`);
    }
    return points.join(" ");
  }, [p1, p2, plotW, plotH]);

  // Drag handlers
  const handlePointerDown = useCallback(
    (which: "p1" | "p2") => (e: React.PointerEvent) => {
      e.preventDefault();
      (e.target as Element).setPointerCapture(e.pointerId);
      setDragging(which);
    },
    []
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragging || !svgRef.current) return;
      const rect = svgRef.current.getBoundingClientRect();
      const sx = (e.clientX - rect.left) * (W / rect.width);
      const sy = (e.clientY - rect.top) * (H / rect.height);
      const pt = fromSVG(sx, sy);
      if (dragging === "p1") setP1(pt);
      else setP2(pt);
    },
    [dragging, fromSVG]
  );

  const handlePointerUp = useCallback(() => {
    setDragging(null);
  }, []);

  // Replay animation
  const replay = () => setAnimKey((k) => k + 1);

  // Auto-replay on changes
  useEffect(() => {
    setAnimKey((k) => k + 1);
  }, [p1, p2, duration]);

  const cubicStr = `cubic-bezier(${p1.x.toFixed(3)}, ${p1.y.toFixed(3)}, ${p2.x.toFixed(3)}, ${p2.y.toFixed(3)})`;

  const cssCode = `.animated-element {
  transition: transform ${duration}ms ${cubicStr};
}

/* Or as a CSS variable: */
:root {
  --ease: ${cubicStr};
  --duration: ${duration}ms;
}`;

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(cssCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch { /* */ }
  }

  const svgP1 = toSVG(p1);
  const svgP2 = toSVG(p2);
  const svgStart = toSVG({ x: 0, y: 0 });
  const svgEnd = toSVG({ x: 1, y: 1 });

  return (
    <div className="page-wrap">
      <div className="grain" />
      <div className="playground">
        <div className="nav-row">
          <Link href="/" className="back-link">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Back
          </Link>
          <ThemeToggle />
        </div>

        <div className="playground-header">
          <div>
            <h2>Easing Curve Studio</h2>
            <p className="playground-desc">
              Design custom cubic-bezier easing curves by dragging control points. 10 curated presets with live animation preview.
            </p>
          </div>
          <button className="export-btn" onClick={copyCode}>
            {copied ? "Copied!" : "Export CSS"}
          </button>
        </div>

        {/* Presets */}
        <div className="preset-row" style={{ flexWrap: "wrap" }}>
          {Object.entries(PRESETS).map(([key, preset]) => (
            <button
              key={key}
              className="preset-btn"
              onClick={() => { setP1({ ...preset.p1 }); setP2({ ...preset.p2 }); }}
            >
              {preset.label}
            </button>
          ))}
        </div>

        {/* Controls */}
        <div
          style={{
            display: "flex",
            gap: "1.5rem",
            alignItems: "center",
            flexWrap: "wrap",
            padding: "0.75rem 1rem",
            borderRadius: "0.5rem",
            border: "1px solid var(--border)",
            background: "var(--bgt-secondary)",
            marginBottom: "1rem",
            fontSize: "0.75rem",
            textTransform: "uppercase",
            letterSpacing: "0.04em",
            color: "var(--text-secondary)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span>Duration</span>
            <input type="range" min="100" max="2000" step="50" value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              style={{ width: "80px", accentColor: "var(--text-primary)" }} />
            <span style={{ fontFamily: "var(--font-geist-mono), monospace", minWidth: "3rem" }}>{duration}ms</span>
          </div>

          <div style={{ width: "1px", height: "20px", background: "var(--border)" }} />

          <span style={{ fontFamily: "var(--font-geist-mono), monospace", fontSize: "0.7rem", color: "var(--text-primary)" }}>
            {cubicStr}
          </span>

          <div style={{ width: "1px", height: "20px", background: "var(--border)" }} />

          <button
            onClick={replay}
            style={{
              padding: "4px 12px",
              borderRadius: "4px",
              border: "1px solid var(--border)",
              background: "transparent",
              color: "var(--text-primary)",
              cursor: "pointer",
              fontSize: "0.7rem",
              textTransform: "uppercase",
              letterSpacing: "0.04em",
            }}
          >
            ▶ Replay
          </button>
        </div>

        {/* Preview: curve + animations */}
        <div className="preview-stack">
          <div className="preview-meta">
            <span className="preview-badge">Live Preview</span>
            <span>Drag handles to design</span>
          </div>
          <div
            ref={previewRef}
            className="preview"
            style={{
              padding: "2rem",
              minHeight: "auto",
              display: "flex",
              gap: "3rem",
              alignItems: "center",
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            {/* SVG Curve Editor */}
            <svg
              ref={svgRef}
              viewBox={`0 0 ${W} ${H}`}
              width={W}
              height={H}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerLeave={handlePointerUp}
              style={{
                background: "var(--bgt-secondary)",
                borderRadius: "0.75rem",
                border: "1px solid var(--border)",
                cursor: dragging ? "grabbing" : "default",
                touchAction: "none",
                flexShrink: 0,
              }}
            >
              {/* Grid */}
              {[0.25, 0.5, 0.75].map((v) => (
                <g key={v}>
                  <line
                    x1={PAD + v * plotW} y1={PAD} x2={PAD + v * plotW} y2={PAD + plotH}
                    stroke="var(--border)" strokeWidth="0.5" strokeDasharray="4 4"
                  />
                  <line
                    x1={PAD} y1={PAD + v * plotH} x2={PAD + plotW} y2={PAD + v * plotH}
                    stroke="var(--border)" strokeWidth="0.5" strokeDasharray="4 4"
                  />
                </g>
              ))}

              {/* Diagonal reference */}
              <line
                x1={svgStart.x} y1={svgStart.y} x2={svgEnd.x} y2={svgEnd.y}
                stroke="var(--text-secondary)" strokeWidth="0.5" opacity="0.3"
              />

              {/* Control handle lines */}
              <line x1={svgStart.x} y1={svgStart.y} x2={svgP1.x} y2={svgP1.y}
                stroke="var(--text-secondary)" strokeWidth="1" opacity="0.4" />
              <line x1={svgEnd.x} y1={svgEnd.y} x2={svgP2.x} y2={svgP2.y}
                stroke="var(--text-secondary)" strokeWidth="1" opacity="0.4" />

              {/* Curve */}
              <path d={curvePath} fill="none" stroke="var(--text-primary)" strokeWidth="2.5" />

              {/* Endpoints */}
              <circle cx={svgStart.x} cy={svgStart.y} r="4" fill="var(--text-secondary)" />
              <circle cx={svgEnd.x} cy={svgEnd.y} r="4" fill="var(--text-secondary)" />

              {/* Draggable handle P1 */}
              <circle
                cx={svgP1.x} cy={svgP1.y} r="8"
                fill="var(--text-primary)" stroke="var(--app-bg)" strokeWidth="2"
                cursor="grab"
                onPointerDown={handlePointerDown("p1")}
              />
              {/* Draggable handle P2 */}
              <circle
                cx={svgP2.x} cy={svgP2.y} r="8"
                fill="var(--text-primary)" stroke="var(--app-bg)" strokeWidth="2"
                cursor="grab"
                onPointerDown={handlePointerDown("p2")}
              />

              {/* Axis labels */}
              <text x={PAD + plotW / 2} y={H - 8} textAnchor="middle" fill="var(--text-secondary)" fontSize="9" fontFamily="var(--font-geist-mono), monospace">
                TIME →
              </text>
              <text x={10} y={PAD + plotH / 2} textAnchor="middle" fill="var(--text-secondary)" fontSize="9" fontFamily="var(--font-geist-mono), monospace"
                transform={`rotate(-90, 10, ${PAD + plotH / 2})`}>
                PROGRESS →
              </text>
            </svg>

            {/* Animation demos */}
            <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", flex: 1, minWidth: "200px" }}>
              {/* Translate demo */}
              <div>
                <div style={{ fontSize: "0.65rem", textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-secondary)", marginBottom: "0.5rem" }}>
                  Translate X
                </div>
                <div style={{ height: "40px", borderRadius: "0.5rem", background: "var(--bgt-secondary)", border: "1px solid var(--border)", position: "relative", overflow: "hidden" }}>
                  <div
                    key={`tx-${animKey}`}
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "0.5rem",
                      background: "var(--text-primary)",
                      position: "absolute",
                      left: 0,
                      animation: `slide-right ${duration}ms ${cubicStr} forwards`,
                    }}
                  />
                </div>
              </div>

              {/* Scale demo */}
              <div>
                <div style={{ fontSize: "0.65rem", textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-secondary)", marginBottom: "0.5rem" }}>
                  Scale
                </div>
                <div style={{ height: "60px", borderRadius: "0.5rem", background: "var(--bgt-secondary)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <div
                    key={`sc-${animKey}`}
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "8px",
                      background: "var(--text-primary)",
                      animation: `scale-up ${duration}ms ${cubicStr} forwards`,
                    }}
                  />
                </div>
              </div>

              {/* Opacity demo */}
              <div>
                <div style={{ fontSize: "0.65rem", textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-secondary)", marginBottom: "0.5rem" }}>
                  Opacity
                </div>
                <div style={{ height: "40px", borderRadius: "0.5rem", background: "var(--bgt-secondary)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <div
                    key={`op-${animKey}`}
                    style={{
                      width: "80%",
                      height: "24px",
                      borderRadius: "6px",
                      background: "var(--text-primary)",
                      animation: `fade-in ${duration}ms ${cubicStr} forwards`,
                      opacity: 0,
                    }}
                  />
                </div>
              </div>

              {/* Rotate demo */}
              <div>
                <div style={{ fontSize: "0.65rem", textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-secondary)", marginBottom: "0.5rem" }}>
                  Rotate
                </div>
                <div style={{ height: "60px", borderRadius: "0.5rem", background: "var(--bgt-secondary)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <div
                    key={`rot-${animKey}`}
                    style={{
                      width: "36px",
                      height: "36px",
                      borderRadius: "6px",
                      background: "var(--text-primary)",
                      animation: `spin-once ${duration}ms ${cubicStr} forwards`,
                    }}
                  />
                </div>
              </div>
            </div>

            <FullscreenButton targetRef={previewRef} />
          </div>
        </div>

        {/* CSS keyframe definitions (injected inline) */}
        <style>{`
          @keyframes slide-right {
            from { transform: translateX(0); }
            to { transform: translateX(calc(100% + 200%)); }
          }
          @keyframes scale-up {
            from { transform: scale(0.3); }
            to { transform: scale(1); }
          }
          @keyframes fade-in {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes spin-once {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>

        {/* Code */}
        <div className="code-wrap">
          <div className="code-head">
            <span>Easing CSS</span>
            <span>.css</span>
          </div>
          <pre className="code-block">{cssCode}</pre>
        </div>
      </div>
    </div>
  );
}
