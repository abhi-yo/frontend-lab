"use client";

import Link from "next/link";
import { useState, useMemo } from "react";
import ThemeToggle from "../components/theme-toggle";

type ScaleRatio = {
  label: string;
  value: number;
};

const RATIOS: ScaleRatio[] = [
  { label: "Minor Second", value: 1.067 },
  { label: "Major Second", value: 1.125 },
  { label: "Minor Third", value: 1.2 },
  { label: "Major Third", value: 1.25 },
  { label: "Perfect Fourth", value: 1.333 },
  { label: "Aug. Fourth", value: 1.414 },
  { label: "Perfect Fifth", value: 1.5 },
  { label: "Golden Ratio", value: 1.618 },
];

const STEP_NAMES = ["xs", "sm", "base", "md", "lg", "xl", "2xl", "3xl", "4xl", "5xl", "6xl"];

const FONT_STACKS: Record<string, string> = {
  system: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  inter: '"Inter", sans-serif',
  georgia: '"Georgia", serif',
  mono: '"SF Mono", "Fira Code", monospace',
  playfair: '"Playfair Display", serif',
};

const SAMPLE_TEXT = "The quick brown fox jumps over the lazy dog";

export default function TypeScalePage() {
  const [copied, setCopied] = useState(false);
  const [baseSize, setBaseSize] = useState(16);
  const [ratioIndex, setRatioIndex] = useState(3); // Major Third
  const [fontStack, setFontStack] = useState("system");
  const [lineHeight, setLineHeight] = useState(1.5);
  const [letterSpacing, setLetterSpacing] = useState(0);
  const [fontWeight, setFontWeight] = useState(400);

  const ratio = RATIOS[ratioIndex];

  const scale = useMemo(() => {
    // Generate steps from -2 to +8 relative to base (index 2 = base)
    return STEP_NAMES.map((name, i) => {
      const exponent = i - 2; // base is at index 2
      const size = baseSize * Math.pow(ratio.value, exponent);
      return {
        name,
        size: Math.round(size * 100) / 100,
        rounded: Math.round(size),
        exponent,
      };
    });
  }, [baseSize, ratio]);

  const cssCode = useMemo(() => {
    let code = `:root {\n  /* Type Scale — ${ratio.label} (${ratio.value}) */\n  /* Base: ${baseSize}px */\n\n`;
    scale.forEach((step) => {
      code += `  --font-${step.name}: ${step.size.toFixed(2)}px; /* ${step.rounded}px */\n`;
    });
    code += `\n  --font-family: ${FONT_STACKS[fontStack]};\n`;
    code += `  --line-height: ${lineHeight};\n`;
    code += `  --letter-spacing: ${letterSpacing}em;\n`;
    code += `}`;
    return code;
  }, [scale, ratio, baseSize, fontStack, lineHeight, letterSpacing]);

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
            <h2>Typography Scale</h2>
            <p className="playground-desc">
              Generate a modular type scale from any base size using classic musical and mathematical ratios. Export as CSS custom properties.
            </p>
          </div>
          <button className="export-btn" onClick={copyCode}>
            {copied ? "Copied!" : "Export CSS"}
          </button>
        </div>

        {/* Ratio presets */}
        <div className="preset-row" style={{ flexWrap: "wrap" }}>
          {RATIOS.map((r, i) => (
            <button
              key={r.label}
              className="preset-btn"
              style={{
                background: ratioIndex === i ? "var(--text-primary)" : "",
                color: ratioIndex === i ? "var(--app-bg)" : "",
              }}
              onClick={() => setRatioIndex(i)}
            >
              {r.label} <span style={{ opacity: 0.5, marginLeft: "0.3rem" }}>{r.value}</span>
            </button>
          ))}
        </div>

        {/* Controls */}
        <div className="inline-controls">
          <div className="inline-control-group">
            <span>Base</span>
            <input type="range" min="10" max="24" step="1" value={baseSize}
              onChange={(e) => setBaseSize(Number(e.target.value))}
              style={{ width: "70px", accentColor: "var(--text-primary)" }} />
            <span style={{ fontFamily: "var(--font-geist-mono), monospace", minWidth: "2rem" }}>{baseSize}px</span>
          </div>

          <div className="inline-separator" />

          <div className="inline-control-group">
            <span>Height</span>
            <input type="range" min="1" max="2" step="0.05" value={lineHeight}
              onChange={(e) => setLineHeight(Number(e.target.value))}
              style={{ width: "60px", accentColor: "var(--text-primary)" }} />
            <span style={{ fontFamily: "var(--font-geist-mono), monospace", minWidth: "1.5rem" }}>{lineHeight.toFixed(2)}</span>
          </div>

          <div className="inline-separator" />

          <div className="inline-control-group">
            <span>Tracking</span>
            <input type="range" min="-0.05" max="0.15" step="0.005" value={letterSpacing}
              onChange={(e) => setLetterSpacing(Number(e.target.value))}
              style={{ width: "60px", accentColor: "var(--text-primary)" }} />
            <span style={{ fontFamily: "var(--font-geist-mono), monospace", minWidth: "2.5rem" }}>{letterSpacing.toFixed(3)}em</span>
          </div>

          <div className="inline-separator" />

          <div className="inline-control-group">
            <span>Weight</span>
            {[300, 400, 500, 600, 700].map((w) => (
              <button key={w} onClick={() => setFontWeight(w)}
                style={{
                  padding: "2px 6px", borderRadius: "4px", fontSize: "0.65rem",
                  border: "1px solid var(--border)", cursor: "pointer",
                  background: fontWeight === w ? "var(--text-primary)" : "transparent",
                  color: fontWeight === w ? "var(--app-bg)" : "var(--text-secondary)",
                }}
              >{w}</button>
            ))}
          </div>

          <div className="inline-separator" />

          <div className="inline-control-group">
            <span>Font</span>
            <select
              value={fontStack}
              onChange={(e) => setFontStack(e.target.value)}
              style={{
                background: "var(--bgt-secondary)",
                border: "1px solid var(--border)",
                color: "var(--text-primary)",
                borderRadius: "4px",
                padding: "2px 6px",
                fontSize: "0.7rem",
                cursor: "pointer",
              }}
            >
              <option value="system">System UI</option>
              <option value="inter">Inter</option>
              <option value="georgia">Georgia</option>
              <option value="mono">Monospace</option>
              <option value="playfair">Playfair</option>
            </select>
          </div>
        </div>

        {/* Type scale preview */}
        <div className="preview-stack">
          <div className="preview-meta">
            <span className="preview-badge">Live Preview</span>
            <span>{ratio.label} · ×{ratio.value} · {baseSize}px base</span>
          </div>
          <div
            className="preview"
            style={{
              padding: "2rem 2.5rem",
              minHeight: "auto",
              display: "flex",
              flexDirection: "column",
              gap: 0,
            }}
          >
            {[...scale].reverse().map((step) => (
              <div
                key={step.name}
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  gap: "1.5rem",
                  padding: "0.5rem 0",
                  borderBottom: "1px solid var(--border)",
                }}
              >
                {/* Label */}
                <div
                  style={{
                    minWidth: "6rem",
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.15rem",
                    flexShrink: 0,
                  }}
                >
                  <span
                    style={{
                      fontFamily: "var(--font-geist-mono), monospace",
                      fontSize: "0.65rem",
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                      color: step.exponent === 0 ? "var(--text-primary)" : "var(--text-secondary)",
                      fontWeight: step.exponent === 0 ? 600 : 400,
                    }}
                  >
                    {step.name} {step.exponent === 0 && "←"}
                  </span>
                  <span
                    style={{
                      fontFamily: "var(--font-geist-mono), monospace",
                      fontSize: "0.6rem",
                      color: "var(--text-secondary)",
                      opacity: 0.6,
                    }}
                  >
                    {step.rounded}px
                  </span>
                </div>
                {/* Sample */}
                <div
                  style={{
                    fontSize: `${step.size}px`,
                    fontFamily: FONT_STACKS[fontStack],
                    lineHeight: lineHeight,
                    letterSpacing: `${letterSpacing}em`,
                    fontWeight,
                    color: "var(--text-primary)",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    maxWidth: "100%",
                  }}
                >
                  {SAMPLE_TEXT}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Code */}
        <div className="code-wrap">
          <div className="code-head">
            <span>Type Scale CSS</span>
            <span>.css</span>
          </div>
          <pre className="code-block">{cssCode}</pre>
        </div>
      </div>
    </div>
  );
}
