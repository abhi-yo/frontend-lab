"use client";

import Link from "next/link";
import { useState, useRef, useEffect, useCallback } from "react";
import ThemeToggle from "../components/theme-toggle";
import FullscreenButton from "../components/fullscreen-button";

// ── Noise algorithms ──

// Simple hash for deterministic randomness
function hash(x: number, y: number): number {
  let h = x * 374761393 + y * 668265263;
  h = (h ^ (h >> 13)) * 1274126177;
  return (h ^ (h >> 16)) & 0x7fffffff;
}

function fade(t: number) { return t * t * t * (t * (t * 6 - 15) + 10); }
function lerp(a: number, b: number, t: number) { return a + t * (b - a); }

// ── Value Noise ──
function valueNoise(x: number, y: number): number {
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  const fx = x - ix;
  const fy = y - iy;

  const a = (hash(ix, iy) & 0xffff) / 0xffff;
  const b = (hash(ix + 1, iy) & 0xffff) / 0xffff;
  const c = (hash(ix, iy + 1) & 0xffff) / 0xffff;
  const d = (hash(ix + 1, iy + 1) & 0xffff) / 0xffff;

  const u = fade(fx);
  const v = fade(fy);

  return lerp(lerp(a, b, u), lerp(c, d, u), v);
}

// ── Gradient Noise (Perlin-style) ──
function gradientAt(hv: number, x: number, y: number): number {
  const h = hv & 3;
  const u = h < 2 ? x : y;
  const v = h < 2 ? y : x;
  return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
}

function perlinNoise(x: number, y: number): number {
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  const fx = x - ix;
  const fy = y - iy;

  const u = fade(fx);
  const v = fade(fy);

  const n00 = gradientAt(hash(ix, iy), fx, fy);
  const n10 = gradientAt(hash(ix + 1, iy), fx - 1, fy);
  const n01 = gradientAt(hash(ix, iy + 1), fx, fy - 1);
  const n11 = gradientAt(hash(ix + 1, iy + 1), fx - 1, fy - 1);

  const val = lerp(lerp(n00, n10, u), lerp(n01, n11, u), v);
  return val * 0.5 + 0.5; // normalize to 0..1
}

// ── Worley (Cellular) Noise ──
function worleyNoise(x: number, y: number): number {
  const ix = Math.floor(x);
  const iy = Math.floor(y);

  let minDist1 = 999;
  let minDist2 = 999;

  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      const cx = ix + dx;
      const cy = iy + dy;
      const px = cx + (hash(cx, cy) & 0xffff) / 0xffff;
      const py = cy + (hash(cx * 127 + 31, cy * 269 + 17) & 0xffff) / 0xffff;
      const dist = Math.hypot(x - px, y - py);

      if (dist < minDist1) {
        minDist2 = minDist1;
        minDist1 = dist;
      } else if (dist < minDist2) {
        minDist2 = dist;
      }
    }
  }

  return minDist1; // F1 distance
}

// ── fBm (fractal Brownian motion) layer ──
function fbm(
  noiseFn: (x: number, y: number) => number,
  x: number,
  y: number,
  octaves: number,
  lacunarity: number,
  persistence: number
): number {
  let total = 0;
  let amplitude = 1;
  let frequency = 1;
  let maxVal = 0;

  for (let i = 0; i < octaves; i++) {
    total += noiseFn(x * frequency, y * frequency) * amplitude;
    maxVal += amplitude;
    amplitude *= persistence;
    frequency *= lacunarity;
  }

  return total / maxVal;
}

type NoiseType = "perlin" | "value" | "worley";

const NOISE_LABELS: Record<NoiseType, string> = {
  perlin: "Perlin",
  value: "Value",
  worley: "Worley",
};

const NOISE_FNS: Record<NoiseType, (x: number, y: number) => number> = {
  perlin: perlinNoise,
  value: valueNoise,
  worley: worleyNoise,
};

export default function NoisePage() {
  const previewRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [copied, setCopied] = useState(false);
  const [noiseType, setNoiseType] = useState<NoiseType>("perlin");
  const [noiseScale, setNoiseScale] = useState(40);
  const [octaves, setOctaves] = useState(4);
  const [lacunarity, setLacunarity] = useState(2.0);
  const [persistence, setPersistence] = useState(0.5);
  const [colorA, setColorA] = useState("#1a1a1a");
  const [colorB, setColorB] = useState("#e8e8e8");
  const [invert, setInvert] = useState(false);
  const [resolution, setResolution] = useState(512);

  const hexToRgb = (hex: string) => {
    const h = hex.replace("#", "");
    return [
      parseInt(h.substring(0, 2), 16),
      parseInt(h.substring(2, 4), 16),
      parseInt(h.substring(4, 6), 16),
    ];
  };

  const renderNoise = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const w = resolution;
    const h = resolution;
    canvas.width = w;
    canvas.height = h;

    const imgData = ctx.createImageData(w, h);
    const data = imgData.data;

    const noiseFn = NOISE_FNS[noiseType];
    const c1 = hexToRgb(invert ? colorB : colorA);
    const c2 = hexToRgb(invert ? colorA : colorB);

    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const nx = x / noiseScale;
        const ny = y / noiseScale;

        let val = fbm(noiseFn, nx, ny, octaves, lacunarity, persistence);
        val = Math.max(0, Math.min(1, val));

        const idx = (y * w + x) * 4;
        data[idx] = c1[0] + (c2[0] - c1[0]) * val;
        data[idx + 1] = c1[1] + (c2[1] - c1[1]) * val;
        data[idx + 2] = c1[2] + (c2[2] - c1[2]) * val;
        data[idx + 3] = 255;
      }
    }

    ctx.putImageData(imgData, 0, 0);
  }, [noiseType, noiseScale, octaves, lacunarity, persistence, colorA, colorB, invert, resolution]);

  useEffect(() => {
    renderNoise();
  }, [renderNoise]);

  const downloadPNG = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `noise-${noiseType}-${resolution}px.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  const currentCode = `// Procedural ${NOISE_LABELS[noiseType]} Noise — ${resolution}×${resolution}px
// Scale: ${noiseScale} | Octaves: ${octaves} | Lacunarity: ${lacunarity} | Persistence: ${persistence}
// Colors: ${colorA} → ${colorB}${invert ? " (inverted)" : ""}

function generateNoise(canvas, width = ${resolution}, height = ${resolution}) {
  const ctx = canvas.getContext("2d");
  canvas.width = width;
  canvas.height = height;

  const imgData = ctx.createImageData(width, height);
  const data = imgData.data;
  const scale = ${noiseScale};

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const nx = x / scale;
      const ny = y / scale;

      // fBm with ${octaves} octaves
      let val = fbm(${noiseType}Noise, nx, ny, ${octaves}, ${lacunarity}, ${persistence});
      val = Math.max(0, Math.min(1, val));

      const i = (y * width + x) * 4;
      // Map value to color range
      data[i]     = lerp(${hexToRgb(colorA)[0]}, ${hexToRgb(colorB)[0]}, val);
      data[i + 1] = lerp(${hexToRgb(colorA)[1]}, ${hexToRgb(colorB)[1]}, val);
      data[i + 2] = lerp(${hexToRgb(colorA)[2]}, ${hexToRgb(colorB)[2]}, val);
      data[i + 3] = 255;
    }
  }
  ctx.putImageData(imgData, 0, 0);
}`;

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(currentCode);
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
            <h2>Noise Texture Lab</h2>
            <p className="playground-desc">
              Procedural noise generation with fBm layering. Perlin, Value, and Worley algorithms with full control over octaves, lacunarity, and persistence.
            </p>
          </div>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button className="export-btn" onClick={downloadPNG}>
              Download PNG
            </button>
            <button className="export-btn" onClick={copyCode}>
              {copied ? "Copied!" : "Copy Source"}
            </button>
          </div>
        </div>

        {/* Noise type selection */}
        <div className="preset-row">
          {(Object.keys(NOISE_LABELS) as NoiseType[]).map((key) => (
            <button
              key={key}
              className="preset-btn"
              style={{
                background: noiseType === key ? "var(--text-primary)" : "",
                color: noiseType === key ? "var(--app-bg)" : "",
              }}
              onClick={() => setNoiseType(key)}
            >
              {NOISE_LABELS[key]}
            </button>
          ))}
          <button
            className="preset-btn"
            style={{
              background: invert ? "var(--text-primary)" : "",
              color: invert ? "var(--app-bg)" : "",
            }}
            onClick={() => setInvert(!invert)}
          >
            Invert
          </button>
        </div>

        {/* Controls */}
        <div className="inline-controls">
          <div className="inline-control-group">
            <span>Scale</span>
            <input type="range" min="5" max="200" step="1" value={noiseScale}
              onChange={(e) => setNoiseScale(Number(e.target.value))}
              style={{ width: "70px", accentColor: "var(--text-primary)" }} />
            <span style={{ fontFamily: "var(--font-geist-mono), monospace", minWidth: "2rem" }}>{noiseScale}</span>
          </div>

          <div className="inline-separator" />

          <div className="inline-control-group">
            <span>Octaves</span>
            <input type="range" min="1" max="8" step="1" value={octaves}
              onChange={(e) => setOctaves(Number(e.target.value))}
              style={{ width: "60px", accentColor: "var(--text-primary)" }} />
            <span style={{ fontFamily: "var(--font-geist-mono), monospace", minWidth: "1rem" }}>{octaves}</span>
          </div>

          <div className="inline-separator" />

          <div className="inline-control-group">
            <span>Lacunarity</span>
            <input type="range" min="1" max="4" step="0.1" value={lacunarity}
              onChange={(e) => setLacunarity(Number(e.target.value))}
              style={{ width: "60px", accentColor: "var(--text-primary)" }} />
            <span style={{ fontFamily: "var(--font-geist-mono), monospace", minWidth: "1.5rem" }}>{lacunarity.toFixed(1)}</span>
          </div>

          <div className="inline-separator" />

          <div className="inline-control-group">
            <span>Gain</span>
            <input type="range" min="0.1" max="1" step="0.05" value={persistence}
              onChange={(e) => setPersistence(Number(e.target.value))}
              style={{ width: "60px", accentColor: "var(--text-primary)" }} />
            <span style={{ fontFamily: "var(--font-geist-mono), monospace", minWidth: "1.5rem" }}>{persistence.toFixed(2)}</span>
          </div>

          <div className="inline-separator" />

          <div className="inline-control-group">
            <span>Dark</span>
            <input type="color" value={colorA} onChange={(e) => setColorA(e.target.value)}
              style={{ width: "24px", height: "24px", border: "1px solid var(--border)", borderRadius: "4px", cursor: "pointer", padding: 0 }} />
          </div>
          <div className="inline-control-group">
            <span>Light</span>
            <input type="color" value={colorB} onChange={(e) => setColorB(e.target.value)}
              style={{ width: "24px", height: "24px", border: "1px solid var(--border)", borderRadius: "4px", cursor: "pointer", padding: 0 }} />
          </div>

          <div className="inline-separator" />

          <div className="inline-control-group">
            <span>Res</span>
            {[256, 512, 1024].map((r) => (
              <button key={r} onClick={() => setResolution(r)}
                style={{
                  padding: "2px 8px", borderRadius: "4px", fontSize: "0.7rem",
                  border: "1px solid var(--border)", cursor: "pointer",
                  background: resolution === r ? "var(--text-primary)" : "transparent",
                  color: resolution === r ? "var(--app-bg)" : "var(--text-secondary)",
                }}
              >{r}</button>
            ))}
          </div>
        </div>

        {/* Preview */}
        <div className="preview-stack">
          <div className="preview-meta">
            <span className="preview-badge">Live Preview</span>
            <span>{NOISE_LABELS[noiseType]} · {resolution}×{resolution}px · {octaves} octaves</span>
          </div>
          <div
            ref={previewRef}
            className="preview"
            style={{ padding: 0, minHeight: "clamp(16rem, 50vw, 28rem)", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bgt-secondary)" }}
          >
            <canvas
              ref={canvasRef}
              style={{ width: "100%", height: "100%", objectFit: "contain" }}
            />
            <FullscreenButton targetRef={previewRef} />
          </div>
        </div>

        {/* Code */}
        <div className="code-wrap">
          <div className="code-head">
            <span>Noise Implementation</span>
            <span>.js</span>
          </div>
          <pre className="code-block">{currentCode}</pre>
        </div>
      </div>
    </div>
  );
}
