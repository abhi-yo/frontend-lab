"use client";

import Link from "next/link";
import { useState, useRef, useEffect, useCallback } from "react";
import ThemeToggle from "../components/theme-toggle";
import FullscreenButton from "../components/fullscreen-button";

// ── Bayer matrices ──
const BAYER_4x4 = [
  0, 8, 2, 10,
  12, 4, 14, 6,
  3, 11, 1, 9,
  15, 7, 13, 5,
];

const BAYER_8x8 = [
  0, 48, 12, 60, 3, 51, 15, 63,
  32, 16, 44, 28, 35, 19, 47, 31,
  8, 56, 4, 52, 11, 59, 7, 55,
  40, 24, 36, 20, 43, 27, 39, 23,
  2, 50, 14, 62, 1, 49, 13, 61,
  34, 18, 46, 30, 33, 17, 45, 29,
  10, 58, 6, 54, 9, 57, 5, 53,
  42, 26, 38, 22, 41, 25, 37, 21,
];

/** Generate a sample source image on an offscreen canvas */
function generateSampleImage(): HTMLCanvasElement {
  const w = 640;
  const h = 480;
  const offscreen = document.createElement("canvas");
  offscreen.width = w;
  offscreen.height = h;
  const ctx = offscreen.getContext("2d")!;

  // Rich radial gradient background
  const grad = ctx.createRadialGradient(w * 0.35, h * 0.4, 40, w * 0.5, h * 0.5, w * 0.7);
  grad.addColorStop(0, "#ffffff");
  grad.addColorStop(0.3, "#c8c8c8");
  grad.addColorStop(0.6, "#666666");
  grad.addColorStop(1, "#111111");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  // Overlay circles for visual interest
  const circles = [
    { x: w * 0.25, y: h * 0.3, r: 90, color: "#e0e0e0" },
    { x: w * 0.6, y: h * 0.55, r: 120, color: "#333333" },
    { x: w * 0.75, y: h * 0.25, r: 60, color: "#aaaaaa" },
    { x: w * 0.4, y: h * 0.7, r: 80, color: "#555555" },
    { x: w * 0.15, y: h * 0.65, r: 50, color: "#cccccc" },
  ];

  for (const c of circles) {
    const cg = ctx.createRadialGradient(c.x, c.y, 0, c.x, c.y, c.r);
    cg.addColorStop(0, c.color);
    cg.addColorStop(1, "transparent");
    ctx.fillStyle = cg;
    ctx.beginPath();
    ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2);
    ctx.fill();
  }

  // Some horizontal bands for tonal variety
  for (let i = 0; i < 6; i++) {
    const yPos = h * (0.1 + i * 0.15);
    ctx.fillStyle = `rgba(${i * 40}, ${i * 40}, ${i * 40}, 0.15)`;
    ctx.fillRect(0, yPos, w, 20);
  }

  return offscreen;
}

export default function DitherPage() {
  const previewRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const sourceRef = useRef<HTMLCanvasElement | HTMLImageElement | null>(null);

  const [copied, setCopied] = useState(false);
  const [bayerSize, setBayerSize] = useState<4 | 8>(8);
  const [scale, setScale] = useState(2);
  const [brightness, setBrightness] = useState(1.0);
  const [contrast, setContrast] = useState(1.0);
  const [hasCustomImage, setHasCustomImage] = useState(false);

  // ── Core dither rendering ──
  const renderDither = useCallback(() => {
    const canvas = canvasRef.current;
    const source = sourceRef.current;
    if (!canvas || !source) return;

    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    // Use intrinsic dimensions of source
    const srcW = source instanceof HTMLCanvasElement ? source.width : source.naturalWidth;
    const srcH = source instanceof HTMLCanvasElement ? source.height : source.naturalHeight;
    if (srcW === 0 || srcH === 0) return;

    // Scale down for pixelated look
    const maxDim = 800;
    let cW = Math.floor(srcW / scale);
    let cH = Math.floor(srcH / scale);

    // Cap to prevent performance issues
    if (cW > maxDim || cH > maxDim) {
      const ratio = Math.min(maxDim / cW, maxDim / cH);
      cW = Math.floor(cW * ratio);
      cH = Math.floor(cH * ratio);
    }

    cW = Math.max(cW, 1);
    cH = Math.max(cH, 1);

    canvas.width = cW;
    canvas.height = cH;

    // Draw source
    ctx.drawImage(source, 0, 0, cW, cH);

    // Get pixel data
    const imgData = ctx.getImageData(0, 0, cW, cH);
    const data = imgData.data;

    // Select bayer matrix
    const matrix = bayerSize === 4 ? BAYER_4x4 : BAYER_8x8;
    const matrixMax = bayerSize === 4 ? 16 : 64;
    const n = bayerSize;

    // Determine output colors from current theme
    const computedStyle = getComputedStyle(document.documentElement);
    const bgRaw = computedStyle.getPropertyValue("--app-bg").trim();
    const fgRaw = computedStyle.getPropertyValue("--text-primary").trim();

    const parseHexToRGB = (hex: string): [number, number, number] => {
      let h = hex.replace("#", "");
      if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
      return [
        parseInt(h.substring(0, 2), 16),
        parseInt(h.substring(2, 4), 16),
        parseInt(h.substring(4, 6), 16),
      ];
    };

    // Fallback colors
    let bgColor: [number, number, number] = [235, 233, 225]; // light mode bg
    let fgColor: [number, number, number] = [44, 44, 42]; // light mode text

    try { bgColor = parseHexToRGB(bgRaw); } catch { /* keep fallback */ }
    try { fgColor = parseHexToRGB(fgRaw); } catch { /* keep fallback */ }

    // Apply ordered dithering
    for (let y = 0; y < cH; y++) {
      for (let x = 0; x < cW; x++) {
        const idx = (y * cW + x) * 4;

        let r = data[idx];
        let g = data[idx + 1];
        let b = data[idx + 2];

        // Brightness & contrast adjustment
        r = ((r / 255 - 0.5) * contrast + 0.5 + (brightness - 1)) * 255;
        g = ((g / 255 - 0.5) * contrast + 0.5 + (brightness - 1)) * 255;
        b = ((b / 255 - 0.5) * contrast + 0.5 + (brightness - 1)) * 255;

        // Clamp
        r = Math.max(0, Math.min(255, r));
        g = Math.max(0, Math.min(255, g));
        b = Math.max(0, Math.min(255, b));

        // Luminance
        const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

        // Bayer threshold: normalize matrix value to [0, 1)
        const threshold = matrix[(y % n) * n + (x % n)] / matrixMax;

        // Compare: if luminance > threshold → light pixel, else dark pixel
        const isLight = lum > threshold;
        const color = isLight ? bgColor : fgColor;

        data[idx] = color[0];
        data[idx + 1] = color[1];
        data[idx + 2] = color[2];
        data[idx + 3] = 255;
      }
    }

    ctx.putImageData(imgData, 0, 0);
  }, [bayerSize, scale, brightness, contrast]);

  // ── Initialize with generated sample image ──
  useEffect(() => {
    sourceRef.current = generateSampleImage();
    renderDither();
  }, []);

  // ── Re-render on param change ──
  useEffect(() => {
    renderDither();
  }, [renderDither]);

  // ── Watch for theme changes and resizes ──
  useEffect(() => {
    const onResize = () => renderDither();
    window.addEventListener("resize", onResize);

    const observer = new MutationObserver(() => renderDither());
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });

    return () => {
      window.removeEventListener("resize", onResize);
      observer.disconnect();
    };
  }, [renderDither]);

  // ── File upload handler ──
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      if (!event.target?.result) return;
      const img = new Image();
      img.onload = () => {
        sourceRef.current = img;
        setHasCustomImage(true);
        renderDither();
      };
      img.src = event.target.result as string;
    };
    reader.readAsDataURL(file);
  };

  const resetToSample = () => {
    sourceRef.current = generateSampleImage();
    setHasCustomImage(false);
    renderDither();
  };

  // ── Code string ──
  const currentCode = `// Ordered Dither — Bayer ${bayerSize}×${bayerSize} Matrix
// Scale: ${scale}x | Brightness: ${brightness} | Contrast: ${contrast}

function applyDither(canvas, sourceImage) {
  const ctx = canvas.getContext("2d", { willReadFrequently: true });

  const cW = Math.floor(sourceImage.width / ${scale});
  const cH = Math.floor(sourceImage.height / ${scale});
  canvas.width = cW;
  canvas.height = cH;
  canvas.style.imageRendering = "pixelated";

  ctx.drawImage(sourceImage, 0, 0, cW, cH);

  const imgData = ctx.getImageData(0, 0, cW, cH);
  const data = imgData.data;

  // Bayer ${bayerSize}×${bayerSize} threshold matrix (normalized to 0..1)
  const bayer = [${(bayerSize === 4 ? BAYER_4x4 : BAYER_8x8).join(", ")}];
  const n = ${bayerSize};
  const max = ${bayerSize === 4 ? 16 : 64};

  for (let y = 0; y < cH; y++) {
    for (let x = 0; x < cW; x++) {
      const i = (y * cW + x) * 4;

      // Brightness/contrast adjustment
      let r = ((data[i]/255 - 0.5) * ${contrast} + 0.5 + ${(brightness - 1).toFixed(1)}) * 255;
      let g = ((data[i+1]/255 - 0.5) * ${contrast} + 0.5 + ${(brightness - 1).toFixed(1)}) * 255;
      let b = ((data[i+2]/255 - 0.5) * ${contrast} + 0.5 + ${(brightness - 1).toFixed(1)}) * 255;

      r = Math.max(0, Math.min(255, r));
      g = Math.max(0, Math.min(255, g));
      b = Math.max(0, Math.min(255, b));

      const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
      const threshold = bayer[(y % n) * n + (x % n)] / max;

      const val = lum > threshold ? 255 : 0;
      data[i] = data[i+1] = data[i+2] = val;
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
            <h2>Dither Studio</h2>
            <p className="playground-desc">
              1-bit ordered dithering with Bayer matrices. Output auto-maps to your CSS theme colors.
            </p>
          </div>
          <button className="export-btn" onClick={copyCode}>
            {copied ? "Copied!" : "Copy Source"}
          </button>
        </div>

        {/* Preset row */}
        <div className="preset-row">
          <button
            className="preset-btn"
            style={{
              background: bayerSize === 4 ? "var(--text-primary)" : "",
              color: bayerSize === 4 ? "var(--app-bg)" : "",
            }}
            onClick={() => setBayerSize(4)}
          >
            Bayer 4×4
          </button>
          <button
            className="preset-btn"
            style={{
              background: bayerSize === 8 ? "var(--text-primary)" : "",
              color: bayerSize === 8 ? "var(--app-bg)" : "",
            }}
            onClick={() => setBayerSize(8)}
          >
            Bayer 8×8
          </button>
          <button
            className="preset-btn"
            style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem" }}
            onClick={() => fileInputRef.current?.click()}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" />
            </svg>
            Upload Image
          </button>
          {hasCustomImage && (
            <button className="preset-btn" onClick={resetToSample}>
              Reset Sample
            </button>
          )}
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleFileChange}
            style={{ display: "none" }}
          />
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
            <span>Pixel Scale</span>
            <input
              type="range"
              min="1" max="8" step="1"
              value={scale}
              onChange={(e) => setScale(Number(e.target.value))}
              style={{ width: "80px", accentColor: "var(--text-primary)" }}
            />
            <span style={{ fontFamily: "var(--font-geist-mono), monospace", minWidth: "1.5rem" }}>{scale}×</span>
          </div>

          <div style={{ width: "1px", height: "20px", background: "var(--border)" }} />

          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span>Brightness</span>
            <input
              type="range"
              min="0.5" max="2" step="0.1"
              value={brightness}
              onChange={(e) => setBrightness(Number(e.target.value))}
              style={{ width: "80px", accentColor: "var(--text-primary)" }}
            />
            <span style={{ fontFamily: "var(--font-geist-mono), monospace", minWidth: "1.5rem" }}>{brightness.toFixed(1)}</span>
          </div>

          <div style={{ width: "1px", height: "20px", background: "var(--border)" }} />

          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span>Contrast</span>
            <input
              type="range"
              min="0.5" max="3" step="0.1"
              value={contrast}
              onChange={(e) => setContrast(Number(e.target.value))}
              style={{ width: "80px", accentColor: "var(--text-primary)" }}
            />
            <span style={{ fontFamily: "var(--font-geist-mono), monospace", minWidth: "1.5rem" }}>{contrast.toFixed(1)}</span>
          </div>
        </div>

        {/* Preview */}
        <div className="preview-stack">
          <div className="preview-meta">
            <span className="preview-badge">Live Preview</span>
            <span>Canvas · 1-Bit · Bayer {bayerSize}×{bayerSize}</span>
          </div>
          <div
            ref={previewRef}
            className="preview"
            style={{
              padding: 0,
              minHeight: "28rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "var(--app-bg)",
            }}
          >
            <canvas
              ref={canvasRef}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
                imageRendering: "pixelated",
              }}
            />
            <FullscreenButton targetRef={previewRef} />
          </div>
        </div>

        {/* Code */}
        <div className="code-wrap">
          <div className="code-head">
            <span>Dither Implementation</span>
            <span>.js</span>
          </div>
          <pre className="code-block">{currentCode}</pre>
        </div>
      </div>
    </div>
  );
}
