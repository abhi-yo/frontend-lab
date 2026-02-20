"use client";

import Link from "next/link";
import { useState, useMemo, useRef } from "react";
import ThemeToggle from "../components/theme-toggle";
import FullscreenButton from "../components/fullscreen-button";

type PatternType = "dots" | "lines" | "crosses" | "diagonal" | "isometric" | "grid";

const PATTERN_LABELS: Record<PatternType, string> = {
  dots: "Dots",
  lines: "Lines",
  crosses: "Crosses",
  diagonal: "Diagonal",
  isometric: "Isometric",
  grid: "Grid",
};

function generatePatternSVG(
  type: PatternType,
  spacing: number,
  size: number,
  strokeWidth: number,
  color: string,
  opacity: number,
  rotation: number
): string {
  const s = spacing;
  const r = size;
  const sw = strokeWidth;
  const c = encodeURIComponent(color);
  const o = opacity;

  switch (type) {
    case "dots":
      return `<svg xmlns='http://www.w3.org/2000/svg' width='${s}' height='${s}'><circle cx='${s / 2}' cy='${s / 2}' r='${r}' fill='${c}' opacity='${o}'/></svg>`;

    case "lines":
      return `<svg xmlns='http://www.w3.org/2000/svg' width='${s}' height='${s}'><line x1='0' y1='${s / 2}' x2='${s}' y2='${s / 2}' stroke='${c}' stroke-width='${sw}' opacity='${o}'/></svg>`;

    case "crosses":
      const half = s / 2;
      const arm = r;
      return `<svg xmlns='http://www.w3.org/2000/svg' width='${s}' height='${s}'><line x1='${half - arm}' y1='${half}' x2='${half + arm}' y2='${half}' stroke='${c}' stroke-width='${sw}' opacity='${o}'/><line x1='${half}' y1='${half - arm}' x2='${half}' y2='${half + arm}' stroke='${c}' stroke-width='${sw}' opacity='${o}'/></svg>`;

    case "diagonal":
      return `<svg xmlns='http://www.w3.org/2000/svg' width='${s}' height='${s}'><line x1='0' y1='${s}' x2='${s}' y2='0' stroke='${c}' stroke-width='${sw}' opacity='${o}'/></svg>`;

    case "isometric":
      const h = s * Math.sqrt(3) / 2;
      return `<svg xmlns='http://www.w3.org/2000/svg' width='${s}' height='${Math.round(h * 2)}'><circle cx='0' cy='0' r='${r}' fill='${c}' opacity='${o}'/><circle cx='${s}' cy='0' r='${r}' fill='${c}' opacity='${o}'/><circle cx='${s / 2}' cy='${Math.round(h)}' r='${r}' fill='${c}' opacity='${o}'/><circle cx='0' cy='${Math.round(h * 2)}' r='${r}' fill='${c}' opacity='${o}'/><circle cx='${s}' cy='${Math.round(h * 2)}' r='${r}' fill='${c}' opacity='${o}'/></svg>`;

    case "grid":
      return `<svg xmlns='http://www.w3.org/2000/svg' width='${s}' height='${s}'><line x1='0' y1='0' x2='${s}' y2='0' stroke='${c}' stroke-width='${sw}' opacity='${o}'/><line x1='0' y1='0' x2='0' y2='${s}' stroke='${c}' stroke-width='${sw}' opacity='${o}'/></svg>`;

    default:
      return "";
  }
}

export default function PatternPage() {
  const previewRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const [patternType, setPatternType] = useState<PatternType>("dots");
  const [spacing, setSpacing] = useState(24);
  const [size, setSize] = useState(1.5);
  const [strokeWidth, setStrokeWidth] = useState(1);
  const [color, setColor] = useState("#888888");
  const [opacity, setOpacity] = useState(0.5);
  const [rotation, setRotation] = useState(0);
  const [bgColor, setBgColor] = useState("#111111");

  const svgString = useMemo(
    () => generatePatternSVG(patternType, spacing, size, strokeWidth, color, opacity, rotation),
    [patternType, spacing, size, strokeWidth, color, opacity, rotation]
  );

  const encodedSVG = useMemo(() => {
    return `url("data:image/svg+xml,${svgString.replace(/'/g, "%27")}")`;
  }, [svgString]);

  const cssCode = useMemo(() => {
    const rotStr = rotation !== 0 ? `\n  /* Apply rotation via a wrapper transform */\n  /* transform: rotate(${rotation}deg); */` : "";
    return `.pattern-bg {\n  background-color: ${bgColor};\n  background-image: ${encodedSVG};\n  background-repeat: repeat;\n  background-size: ${spacing}px ${patternType === "isometric" ? Math.round(spacing * Math.sqrt(3)) : spacing}px;${rotStr}\n}`;
  }, [encodedSVG, bgColor, spacing, rotation, patternType]);

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(cssCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch { /* */ }
  }

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
            <h2>Grid Pattern Studio</h2>
            <p className="playground-desc">
              Generate repeating SVG-based patterns for backgrounds. Dots, lines, crosses, diagonals, isometric grids — all as pure CSS with zero dependencies.
            </p>
          </div>
          <button className="export-btn" onClick={copyCode}>
            {copied ? "Copied!" : "Export CSS"}
          </button>
        </div>

        {/* Pattern type */}
        <div className="preset-row">
          {(Object.keys(PATTERN_LABELS) as PatternType[]).map((key) => (
            <button
              key={key}
              className="preset-btn"
              style={{
                background: patternType === key ? "var(--text-primary)" : "",
                color: patternType === key ? "var(--app-bg)" : "",
              }}
              onClick={() => setPatternType(key)}
            >
              {PATTERN_LABELS[key]}
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
            <span>Spacing</span>
            <input type="range" min="8" max="80" step="1" value={spacing}
              onChange={(e) => setSpacing(Number(e.target.value))}
              style={{ width: "70px", accentColor: "var(--text-primary)" }} />
            <span style={{ fontFamily: "var(--font-geist-mono), monospace", minWidth: "2rem" }}>{spacing}px</span>
          </div>

          <div style={{ width: "1px", height: "20px", background: "var(--border)" }} />

          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span>Size</span>
            <input type="range" min="0.5" max="8" step="0.5" value={size}
              onChange={(e) => setSize(Number(e.target.value))}
              style={{ width: "60px", accentColor: "var(--text-primary)" }} />
            <span style={{ fontFamily: "var(--font-geist-mono), monospace", minWidth: "1.5rem" }}>{size}</span>
          </div>

          <div style={{ width: "1px", height: "20px", background: "var(--border)" }} />

          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span>Stroke</span>
            <input type="range" min="0.5" max="4" step="0.5" value={strokeWidth}
              onChange={(e) => setStrokeWidth(Number(e.target.value))}
              style={{ width: "50px", accentColor: "var(--text-primary)" }} />
            <span style={{ fontFamily: "var(--font-geist-mono), monospace", minWidth: "1.5rem" }}>{strokeWidth}</span>
          </div>

          <div style={{ width: "1px", height: "20px", background: "var(--border)" }} />

          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span>Opacity</span>
            <input type="range" min="0.05" max="1" step="0.05" value={opacity}
              onChange={(e) => setOpacity(Number(e.target.value))}
              style={{ width: "60px", accentColor: "var(--text-primary)" }} />
            <span style={{ fontFamily: "var(--font-geist-mono), monospace", minWidth: "2rem" }}>{opacity.toFixed(2)}</span>
          </div>

          <div style={{ width: "1px", height: "20px", background: "var(--border)" }} />

          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span>Rotate</span>
            <input type="range" min="0" max="90" step="5" value={rotation}
              onChange={(e) => setRotation(Number(e.target.value))}
              style={{ width: "50px", accentColor: "var(--text-primary)" }} />
            <span style={{ fontFamily: "var(--font-geist-mono), monospace", minWidth: "2rem" }}>{rotation}°</span>
          </div>

          <div style={{ width: "1px", height: "20px", background: "var(--border)" }} />

          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span>Dot</span>
            <input type="color" value={color} onChange={(e) => setColor(e.target.value)}
              style={{ width: "24px", height: "24px", border: "1px solid var(--border)", borderRadius: "4px", cursor: "pointer", padding: 0 }} />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span>BG</span>
            <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)}
              style={{ width: "24px", height: "24px", border: "1px solid var(--border)", borderRadius: "4px", cursor: "pointer", padding: 0 }} />
          </div>
        </div>

        {/* Preview */}
        <div className="preview-stack">
          <div className="preview-meta">
            <span className="preview-badge">Live Preview</span>
            <span>{PATTERN_LABELS[patternType]} · {spacing}px spacing</span>
          </div>
          <div
            ref={previewRef}
            className="preview"
            style={{
              padding: 0,
              minHeight: "28rem",
              backgroundColor: bgColor,
              backgroundImage: encodedSVG,
              backgroundRepeat: "repeat",
              backgroundSize: `${spacing}px ${patternType === "isometric" ? Math.round(spacing * Math.sqrt(3)) : spacing}px`,
              transform: rotation !== 0 ? `rotate(${rotation}deg)` : undefined,
              transformOrigin: "center center",
              transition: "background 0.3s ease",
            }}
          >
            <FullscreenButton targetRef={previewRef} />
          </div>
        </div>

        {/* Code */}
        <div className="code-wrap">
          <div className="code-head">
            <span>Pattern CSS</span>
            <span>.css</span>
          </div>
          <pre className="code-block">{cssCode}</pre>
        </div>
      </div>
    </div>
  );
}
