"use client";

import Link from "next/link";
import { useState, useMemo } from "react";
import ThemeToggle from "../components/theme-toggle";

interface ShadowLayer {
  id: number;
  x: number;
  y: number;
  blur: number;
  spread: number;
  color: string;
  opacity: number;
  inset: boolean;
}

let nextId = 1;

function createLayer(overrides?: Partial<ShadowLayer>): ShadowLayer {
  return {
    id: nextId++,
    x: 0,
    y: 4,
    blur: 16,
    spread: 0,
    color: "#000000",
    opacity: 0.15,
    inset: false,
    ...overrides,
  };
}

function hexToRgba(hex: string, alpha: number): string {
  const h = hex.replace("#", "");
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function layerToCSS(layer: ShadowLayer): string {
  const insetStr = layer.inset ? "inset " : "";
  return `${insetStr}${layer.x}px ${layer.y}px ${layer.blur}px ${layer.spread}px ${hexToRgba(layer.color, layer.opacity)}`;
}

// Presets
const PRESETS: Record<string, { label: string; layers: Partial<ShadowLayer>[] }> = {
  subtle: {
    label: "Subtle",
    layers: [
      { x: 0, y: 1, blur: 3, spread: 0, color: "#000000", opacity: 0.1 },
      { x: 0, y: 1, blur: 2, spread: -1, color: "#000000", opacity: 0.06 },
    ],
  },
  medium: {
    label: "Medium",
    layers: [
      { x: 0, y: 4, blur: 6, spread: -1, color: "#000000", opacity: 0.1 },
      { x: 0, y: 2, blur: 4, spread: -2, color: "#000000", opacity: 0.1 },
    ],
  },
  elevated: {
    label: "Elevated",
    layers: [
      { x: 0, y: 10, blur: 15, spread: -3, color: "#000000", opacity: 0.1 },
      { x: 0, y: 4, blur: 6, spread: -4, color: "#000000", opacity: 0.1 },
    ],
  },
  dramatic: {
    label: "Dramatic",
    layers: [
      { x: 0, y: 20, blur: 25, spread: -5, color: "#000000", opacity: 0.15 },
      { x: 0, y: 8, blur: 10, spread: -6, color: "#000000", opacity: 0.1 },
    ],
  },
  floating: {
    label: "Floating",
    layers: [
      { x: 0, y: 25, blur: 50, spread: -12, color: "#000000", opacity: 0.25 },
    ],
  },
  sharp: {
    label: "Sharp",
    layers: [
      { x: 4, y: 4, blur: 0, spread: 0, color: "#000000", opacity: 0.2 },
    ],
  },
  glow: {
    label: "Glow",
    layers: [
      { x: 0, y: 0, blur: 20, spread: 2, color: "#6366f1", opacity: 0.3 },
      { x: 0, y: 0, blur: 40, spread: -4, color: "#6366f1", opacity: 0.15 },
    ],
  },
  layered: {
    label: "Layered",
    layers: [
      { x: 0, y: 1, blur: 2, spread: 0, color: "#000000", opacity: 0.05 },
      { x: 0, y: 2, blur: 4, spread: 0, color: "#000000", opacity: 0.05 },
      { x: 0, y: 4, blur: 8, spread: 0, color: "#000000", opacity: 0.05 },
      { x: 0, y: 8, blur: 16, spread: 0, color: "#000000", opacity: 0.05 },
      { x: 0, y: 16, blur: 32, spread: 0, color: "#000000", opacity: 0.05 },
    ],
  },
  neumorphism: {
    label: "Neumorph.",
    layers: [
      { x: 6, y: 6, blur: 12, spread: 0, color: "#000000", opacity: 0.15 },
      { x: -6, y: -6, blur: 12, spread: 0, color: "#ffffff", opacity: 0.08 },
    ],
  },
  inset: {
    label: "Inset",
    layers: [
      { x: 0, y: 2, blur: 4, spread: 0, color: "#000000", opacity: 0.15, inset: true },
      { x: 0, y: -1, blur: 2, spread: 0, color: "#ffffff", opacity: 0.05, inset: true },
    ],
  },
};

export default function ShadowPage() {
  const [copied, setCopied] = useState(false);
  const [layers, setLayers] = useState<ShadowLayer[]>([
    createLayer({ y: 10, blur: 15, spread: -3, opacity: 0.1 }),
    createLayer({ y: 4, blur: 6, spread: -4, opacity: 0.1 }),
  ]);
  const [cardBg, setCardBg] = useState("#ffffff");
  const [pageBg, setPageBg] = useState("#f0f0f0");
  const [cardRadius, setCardRadius] = useState(12);

  const shadowCSS = useMemo(() => layers.map(layerToCSS).join(",\n             "), [layers]);
  const shadowValue = useMemo(() => layers.map(layerToCSS).join(", "), [layers]);

  const cssCode = useMemo(() => {
    return `.card {\n  background: ${cardBg};\n  border-radius: ${cardRadius}px;\n  box-shadow: ${shadowCSS};\n}`;
  }, [cardBg, cardRadius, shadowCSS]);

  const updateLayer = (id: number, updates: Partial<ShadowLayer>) => {
    setLayers((prev) => prev.map((l) => (l.id === id ? { ...l, ...updates } : l)));
  };

  const removeLayer = (id: number) => {
    setLayers((prev) => prev.filter((l) => l.id !== id));
  };

  const addLayer = () => {
    setLayers((prev) => [...prev, createLayer()]);
  };

  const applyPreset = (key: string) => {
    const preset = PRESETS[key];
    if (!preset) return;
    nextId = 100;
    setLayers(preset.layers.map((l) => createLayer(l)));
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
            <h2>Box Shadow Architect</h2>
            <p className="playground-desc">
              Design multi-layered CSS box shadows visually. Choose from 10 curated presets or build custom shadow stacks with per-layer control.
            </p>
          </div>
          <button className="export-btn" onClick={copyCode}>
            {copied ? "Copied!" : "Export CSS"}
          </button>
        </div>

        {/* Presets */}
        <div className="preset-row" style={{ flexWrap: "wrap" }}>
          {Object.entries(PRESETS).map(([key, preset]) => (
            <button key={key} className="preset-btn" onClick={() => applyPreset(key)}>
              {preset.label}
            </button>
          ))}
        </div>

        {/* Preview */}
        <div className="preview-stack">
          <div className="preview-meta">
            <span className="preview-badge">Live Preview</span>
            <span>{layers.length} layer{layers.length !== 1 ? "s" : ""}</span>
          </div>
          <div
            className="preview"
            style={{
              padding: "3rem",
              minHeight: "20rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: pageBg,
              transition: "background 0.3s",
            }}
          >
            <div
              style={{
                width: "280px",
                height: "200px",
                borderRadius: `${cardRadius}px`,
                background: cardBg,
                boxShadow: shadowValue,
                transition: "box-shadow 0.3s, border-radius 0.3s, background 0.3s",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.5rem",
              }}
            >
              <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: pageBg, opacity: 0.3 }} />
              <div style={{ width: "60%", height: "8px", borderRadius: "4px", background: pageBg, opacity: 0.15 }} />
              <div style={{ width: "40%", height: "6px", borderRadius: "3px", background: pageBg, opacity: 0.1 }} />
            </div>
          </div>
        </div>

        {/* Global controls */}
        <div className="inline-controls">
          <div className="inline-control-group">
            <span>Card</span>
            <input type="color" value={cardBg} onChange={(e) => setCardBg(e.target.value)}
              style={{ width: "24px", height: "24px", border: "1px solid var(--border)", borderRadius: "4px", cursor: "pointer", padding: 0 }} />
          </div>
          <div className="inline-control-group">
            <span>Page</span>
            <input type="color" value={pageBg} onChange={(e) => setPageBg(e.target.value)}
              style={{ width: "24px", height: "24px", border: "1px solid var(--border)", borderRadius: "4px", cursor: "pointer", padding: 0 }} />
          </div>
          <div className="inline-separator" />
          <div className="inline-control-group">
            <span>Radius</span>
            <input type="range" min="0" max="48" step="1" value={cardRadius}
              onChange={(e) => setCardRadius(Number(e.target.value))}
              style={{ width: "70px", accentColor: "var(--text-primary)" }} />
            <span style={{ fontFamily: "var(--font-geist-mono), monospace", minWidth: "2rem" }}>{cardRadius}px</span>
          </div>
          <div className="inline-separator" />
          <button
            onClick={addLayer}
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
            + Add Layer
          </button>
        </div>

        {/* Per-layer controls */}
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginBottom: "1.5rem" }}>
          {layers.map((layer, i) => (
            <div
              key={layer.id}
              style={{
                display: "flex",
                gap: "1rem",
                alignItems: "center",
                flexWrap: "wrap",
                padding: "0.6rem 1rem",
                borderRadius: "0.5rem",
                border: "1px solid var(--border)",
                background: "var(--bgt-secondary)",
                fontSize: "0.7rem",
                textTransform: "uppercase",
                letterSpacing: "0.04em",
                color: "var(--text-secondary)",
              }}
            >
              <span style={{ fontFamily: "var(--font-geist-mono), monospace", minWidth: "1.5rem", fontWeight: 600, color: "var(--text-primary)" }}>
                {i + 1}
              </span>

              <div style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
                <span>X</span>
                <input type="range" min="-40" max="40" step="1" value={layer.x}
                  onChange={(e) => updateLayer(layer.id, { x: Number(e.target.value) })}
                  style={{ width: "50px", accentColor: "var(--text-primary)" }} />
                <span style={{ fontFamily: "var(--font-geist-mono), monospace", minWidth: "2rem" }}>{layer.x}</span>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
                <span>Y</span>
                <input type="range" min="-40" max="40" step="1" value={layer.y}
                  onChange={(e) => updateLayer(layer.id, { y: Number(e.target.value) })}
                  style={{ width: "50px", accentColor: "var(--text-primary)" }} />
                <span style={{ fontFamily: "var(--font-geist-mono), monospace", minWidth: "2rem" }}>{layer.y}</span>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
                <span>Blur</span>
                <input type="range" min="0" max="80" step="1" value={layer.blur}
                  onChange={(e) => updateLayer(layer.id, { blur: Number(e.target.value) })}
                  style={{ width: "50px", accentColor: "var(--text-primary)" }} />
                <span style={{ fontFamily: "var(--font-geist-mono), monospace", minWidth: "2rem" }}>{layer.blur}</span>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
                <span>Spread</span>
                <input type="range" min="-20" max="20" step="1" value={layer.spread}
                  onChange={(e) => updateLayer(layer.id, { spread: Number(e.target.value) })}
                  style={{ width: "50px", accentColor: "var(--text-primary)" }} />
                <span style={{ fontFamily: "var(--font-geist-mono), monospace", minWidth: "2rem" }}>{layer.spread}</span>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
                <span>α</span>
                <input type="range" min="0" max="1" step="0.01" value={layer.opacity}
                  onChange={(e) => updateLayer(layer.id, { opacity: Number(e.target.value) })}
                  style={{ width: "50px", accentColor: "var(--text-primary)" }} />
                <span style={{ fontFamily: "var(--font-geist-mono), monospace", minWidth: "2rem" }}>{layer.opacity.toFixed(2)}</span>
              </div>

              <input type="color" value={layer.color}
                onChange={(e) => updateLayer(layer.id, { color: e.target.value })}
                style={{ width: "22px", height: "22px", border: "1px solid var(--border)", borderRadius: "4px", cursor: "pointer", padding: 0 }} />

              <button
                onClick={() => updateLayer(layer.id, { inset: !layer.inset })}
                style={{
                  padding: "2px 8px",
                  borderRadius: "4px",
                  border: "1px solid var(--border)",
                  background: layer.inset ? "var(--text-primary)" : "transparent",
                  color: layer.inset ? "var(--app-bg)" : "var(--text-secondary)",
                  cursor: "pointer",
                  fontSize: "0.65rem",
                }}
              >
                Inset
              </button>

              {layers.length > 1 && (
                <button
                  onClick={() => removeLayer(layer.id)}
                  style={{
                    padding: "2px 8px",
                    borderRadius: "4px",
                    border: "1px solid var(--border)",
                    background: "transparent",
                    color: "var(--text-secondary)",
                    cursor: "pointer",
                    fontSize: "0.65rem",
                    marginLeft: "auto",
                  }}
                >
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Code */}
        <div className="code-wrap">
          <div className="code-head">
            <span>Box Shadow CSS</span>
            <span>.css</span>
          </div>
          <pre className="code-block">{cssCode}</pre>
        </div>
      </div>
    </div>
  );
}
