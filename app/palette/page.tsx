"use client";

import Link from "next/link";
import { useState, useMemo } from "react";
import ThemeToggle from "../components/theme-toggle";

// ── Color math utilities ──
function hexToHSL(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  let r = parseInt(h.substring(0, 2), 16) / 255;
  let g = parseInt(h.substring(2, 4), 16) / 255;
  let b = parseInt(h.substring(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  let hue = 0;
  let s = 0;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === r) hue = ((g - b) / d + (g < b ? 6 : 0)) / 6;
    else if (max === g) hue = ((b - r) / d + 2) / 6;
    else hue = ((r - g) / d + 4) / 6;
  }

  return [hue * 360, s * 100, l * 100];
}

function hslToHex(h: number, s: number, l: number): string {
  h = ((h % 360) + 360) % 360;
  s = Math.max(0, Math.min(100, s)) / 100;
  l = Math.max(0, Math.min(100, l)) / 100;

  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(color * 255).toString(16).padStart(2, "0");
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

type Harmony =
  | "complementary"
  | "analogous"
  | "triadic"
  | "split-complementary"
  | "tetradic"
  | "monochromatic";

const HARMONY_LABELS: Record<Harmony, string> = {
  complementary: "Complementary",
  analogous: "Analogous",
  triadic: "Triadic",
  "split-complementary": "Split Comp.",
  tetradic: "Tetradic",
  monochromatic: "Monochromatic",
};

function generatePalette(baseHex: string, harmony: Harmony): { hex: string; label: string }[] {
  const [h, s, l] = hexToHSL(baseHex);

  const make = (hue: number, sat: number, lit: number, label: string) => ({
    hex: hslToHex(hue, sat, lit),
    label,
  });

  switch (harmony) {
    case "complementary":
      return [
        make(h, s, l, "Base"),
        make(h, s, Math.min(l + 15, 90), "Light"),
        make(h, s, Math.max(l - 15, 10), "Dark"),
        make(h + 180, s, l, "Complement"),
        make(h + 180, s, Math.min(l + 15, 90), "Comp. Light"),
      ];
    case "analogous":
      return [
        make(h - 30, s, l, "Analogous −30°"),
        make(h - 15, s, l, "Analogous −15°"),
        make(h, s, l, "Base"),
        make(h + 15, s, l, "Analogous +15°"),
        make(h + 30, s, l, "Analogous +30°"),
      ];
    case "triadic":
      return [
        make(h, s, l, "Base"),
        make(h, s, Math.min(l + 20, 90), "Base Light"),
        make(h + 120, s, l, "Triad 2"),
        make(h + 240, s, l, "Triad 3"),
        make(h + 240, s, Math.max(l - 15, 10), "Triad 3 Dark"),
      ];
    case "split-complementary":
      return [
        make(h, s, l, "Base"),
        make(h, s, Math.max(l - 15, 10), "Base Dark"),
        make(h + 150, s, l, "Split 1"),
        make(h + 210, s, l, "Split 2"),
        make(h + 210, s, Math.min(l + 15, 90), "Split 2 Light"),
      ];
    case "tetradic":
      return [
        make(h, s, l, "Base"),
        make(h + 90, s, l, "Quad 2"),
        make(h + 180, s, l, "Quad 3"),
        make(h + 270, s, l, "Quad 4"),
        make(h, s * 0.5, Math.min(l + 25, 92), "Neutral"),
      ];
    case "monochromatic":
      return [
        make(h, s, 95, "50"),
        make(h, s, 80, "200"),
        make(h, s, l, "500"),
        make(h, s, Math.max(l - 25, 15), "700"),
        make(h, s, Math.max(l - 40, 8), "900"),
      ];
    default:
      return [make(h, s, l, "Base")];
  }
}

// ── Shades generator ──
function generateShades(baseHex: string): { hex: string; label: string }[] {
  const [h, s] = hexToHSL(baseHex);
  const steps = [95, 90, 80, 70, 60, 50, 40, 30, 20, 10, 5];
  const labels = ["50", "100", "200", "300", "400", "500", "600", "700", "800", "900", "950"];
  return steps.map((l, i) => ({ hex: hslToHex(h, s, l), label: labels[i] }));
}

function contrastText(hex: string): string {
  const h = hex.replace("#", "");
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.55 ? "#000000" : "#ffffff";
}

export default function PalettePage() {
  const [copied, setCopied] = useState(false);
  const [copiedSwatch, setCopiedSwatch] = useState<string | null>(null);
  const [baseColor, setBaseColor] = useState("#6366f1");
  const [harmony, setHarmony] = useState<Harmony>("complementary");

  const palette = useMemo(() => generatePalette(baseColor, harmony), [baseColor, harmony]);
  const shades = useMemo(() => generateShades(baseColor), [baseColor]);
  const [h, s, l] = useMemo(() => hexToHSL(baseColor), [baseColor]);

  const cssCode = useMemo(() => {
    let code = `:root {\n  /* ${HARMONY_LABELS[harmony]} palette from ${baseColor} */\n`;
    palette.forEach((c, i) => {
      code += `  --palette-${i + 1}: ${c.hex}; /* ${c.label} */\n`;
    });
    code += `\n  /* Shade scale */\n`;
    shades.forEach((s) => {
      code += `  --shade-${s.label}: ${s.hex};\n`;
    });
    code += `}`;
    return code;
  }, [palette, shades, harmony, baseColor]);

  const copySwatch = async (hex: string) => {
    try {
      await navigator.clipboard.writeText(hex);
      setCopiedSwatch(hex);
      setTimeout(() => setCopiedSwatch(null), 800);
    } catch { /* */ }
  };

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
            <h2>Color Palette Lab</h2>
            <p className="playground-desc">
              Generate harmonious color palettes using color theory. Pick a base color, choose a harmony rule, and export production-ready CSS variables.
            </p>
          </div>
          <button className="export-btn" onClick={copyCode}>
            {copied ? "Copied!" : "Export CSS"}
          </button>
        </div>

        {/* Harmony selection */}
        <div className="preset-row">
          {(Object.keys(HARMONY_LABELS) as Harmony[]).map((key) => (
            <button
              key={key}
              className="preset-btn"
              style={{
                background: harmony === key ? "var(--text-primary)" : "",
                color: harmony === key ? "var(--app-bg)" : "",
              }}
              onClick={() => setHarmony(key)}
            >
              {HARMONY_LABELS[key]}
            </button>
          ))}
        </div>

        {/* Base color picker */}
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
            <span>Base Color</span>
            <input
              type="color"
              value={baseColor}
              onChange={(e) => setBaseColor(e.target.value)}
              style={{ width: "28px", height: "28px", border: "1px solid var(--border)", borderRadius: "6px", cursor: "pointer", padding: 0 }}
            />
            <span style={{ fontFamily: "var(--font-geist-mono), monospace" }}>{baseColor.toUpperCase()}</span>
          </div>
          <div style={{ width: "1px", height: "20px", background: "var(--border)" }} />
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span>H</span>
            <span style={{ fontFamily: "var(--font-geist-mono), monospace" }}>{Math.round(h)}°</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span>S</span>
            <span style={{ fontFamily: "var(--font-geist-mono), monospace" }}>{Math.round(s)}%</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span>L</span>
            <span style={{ fontFamily: "var(--font-geist-mono), monospace" }}>{Math.round(l)}%</span>
          </div>

          <div style={{ width: "1px", height: "20px", background: "var(--border)" }} />

          {/* Quick presets */}
          {["#6366f1", "#f43f5e", "#10b981", "#f59e0b", "#8b5cf6", "#06b6d4", "#ec4899"].map((c) => (
            <button
              key={c}
              onClick={() => setBaseColor(c)}
              style={{
                width: "20px",
                height: "20px",
                borderRadius: "50%",
                border: baseColor === c ? "2px solid var(--text-primary)" : "1px solid var(--border)",
                background: c,
                cursor: "pointer",
                transform: baseColor === c ? "scale(1.2)" : "scale(1)",
                transition: "transform 0.15s",
              }}
            />
          ))}
        </div>

        {/* Harmony palette */}
        <div className="preview-stack">
          <div className="preview-meta">
            <span className="preview-badge">Harmony Palette</span>
            <span>{HARMONY_LABELS[harmony]} · {palette.length} colors</span>
          </div>
          <div
            className="preview"
            style={{
              padding: 0,
              minHeight: "10rem",
              display: "flex",
              flexDirection: "row",
              overflow: "hidden",
            }}
          >
            {palette.map((swatch, i) => (
              <button
                key={i}
                onClick={() => copySwatch(swatch.hex)}
                style={{
                  flex: 1,
                  background: swatch.hex,
                  border: "none",
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "flex-end",
                  padding: "1rem 0.5rem",
                  color: contrastText(swatch.hex),
                  fontFamily: "var(--font-geist-mono), monospace",
                  fontSize: "0.65rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  gap: "0.25rem",
                  transition: "flex 0.3s ease",
                  position: "relative",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.flex = "1.5"; }}
                onMouseLeave={(e) => { e.currentTarget.style.flex = "1"; }}
              >
                {copiedSwatch === swatch.hex && (
                  <span style={{ fontSize: "0.6rem", opacity: 0.7 }}>Copied!</span>
                )}
                <span style={{ fontWeight: 600 }}>{swatch.hex.toUpperCase()}</span>
                <span style={{ opacity: 0.7 }}>{swatch.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Full shade scale */}
        <div className="preview-stack" style={{ marginTop: "1.5rem" }}>
          <div className="preview-meta">
            <span className="preview-badge">Shade Scale</span>
            <span>11 steps from base hue</span>
          </div>
          <div
            className="preview"
            style={{
              padding: 0,
              minHeight: "6rem",
              display: "flex",
              flexDirection: "row",
              overflow: "hidden",
            }}
          >
            {shades.map((shade, i) => (
              <button
                key={i}
                onClick={() => copySwatch(shade.hex)}
                style={{
                  flex: 1,
                  background: shade.hex,
                  border: "none",
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "flex-end",
                  padding: "0.5rem 0.25rem",
                  color: contrastText(shade.hex),
                  fontFamily: "var(--font-geist-mono), monospace",
                  fontSize: "0.55rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                  gap: "0.15rem",
                  transition: "flex 0.2s ease",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.flex = "1.4"; }}
                onMouseLeave={(e) => { e.currentTarget.style.flex = "1"; }}
              >
                {copiedSwatch === shade.hex && (
                  <span style={{ fontSize: "0.55rem", opacity: 0.7 }}>✓</span>
                )}
                <span>{shade.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* CSS export */}
        <div className="code-wrap" style={{ marginTop: "1.5rem" }}>
          <div className="code-head">
            <span>CSS Custom Properties</span>
            <span>.css</span>
          </div>
          <pre className="code-block">{cssCode}</pre>
        </div>
      </div>
    </div>
  );
}
