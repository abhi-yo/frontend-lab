"use client";

import Link from "next/link";
import { useState, useRef, useCallback, useEffect } from "react";
import ThemeToggle from "../components/theme-toggle";

const CHAR_SETS: Record<string, { label: string; chars: string }> = {
  standard: { label: "Standard", chars: " .:-=+*#%@" },
  blocks: { label: "Blocks", chars: " ░▒▓█" },
  braille: { label: "Braille", chars: " ⠁⠃⠇⠏⠟⠿⡿⣿" },
  dots: { label: "Dots", chars: " ·•●" },
  detailed: {
    label: "Detailed",
    chars:
      " .'`^\",:;Il!i><~+_-?][}{1)(|\\/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$",
  },
  minimal: { label: "Minimal", chars: " .#" },
};

type ColorMode = "mono" | "tinted" | "original";

/** Generate a default sample image via canvas (a geometric gradient scene) */
function generateDefaultImage(size: number = 256): string {
  const c = document.createElement("canvas");
  c.width = size;
  c.height = size;
  const ctx = c.getContext("2d")!;

  // Background gradient
  const bg = ctx.createLinearGradient(0, 0, size, size);
  bg.addColorStop(0, "#1a1a2e");
  bg.addColorStop(1, "#16213e");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, size, size);

  // Sun circle
  const sunGrad = ctx.createRadialGradient(
    size * 0.5,
    size * 0.35,
    size * 0.02,
    size * 0.5,
    size * 0.35,
    size * 0.22
  );
  sunGrad.addColorStop(0, "#fff");
  sunGrad.addColorStop(0.4, "#f0d090");
  sunGrad.addColorStop(1, "transparent");
  ctx.fillStyle = sunGrad;
  ctx.fillRect(0, 0, size, size);

  // Mountain 1
  ctx.beginPath();
  ctx.moveTo(0, size);
  ctx.lineTo(size * 0.25, size * 0.45);
  ctx.lineTo(size * 0.55, size);
  ctx.closePath();
  ctx.fillStyle = "#2a2a4a";
  ctx.fill();

  // Mountain 2
  ctx.beginPath();
  ctx.moveTo(size * 0.35, size);
  ctx.lineTo(size * 0.65, size * 0.38);
  ctx.lineTo(size, size);
  ctx.closePath();
  ctx.fillStyle = "#1f1f3a";
  ctx.fill();

  // Ground
  ctx.fillStyle = "#0f0f25";
  ctx.fillRect(0, size * 0.82, size, size * 0.18);

  return c.toDataURL("image/png");
}

export default function AsciiPage() {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [ascii, setAscii] = useState<string>("");
  const [coloredHtml, setColoredHtml] = useState<string>("");
  const [charSet, setCharSet] = useState<string>("standard");
  const [width, setWidth] = useState(100);
  const [contrast, setContrast] = useState(1.0);
  const [brightness, setBrightness] = useState(0);
  const [invert, setInvert] = useState(false);
  const [colorMode, setColorMode] = useState<ColorMode>("mono");
  const [tintColor, setTintColor] = useState("#c8f06a");
  const [copied, setCopied] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [fileName, setFileName] = useState<string>("default scene");

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load default image on mount
  useEffect(() => {
    const src = generateDefaultImage(300);
    setImageSrc(src);
  }, []);

  const processImage = useCallback(() => {
    if (!imageSrc) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const cols = width;
      const aspectRatio = img.height / img.width;
      const charAspect = 0.5;
      const rows = Math.round(cols * aspectRatio * charAspect);

      canvas.width = cols;
      canvas.height = rows;

      ctx.filter = `brightness(${1 + brightness}) contrast(${contrast})`;
      ctx.drawImage(img, 0, 0, cols, rows);
      ctx.filter = "none";

      const imageData = ctx.getImageData(0, 0, cols, rows);
      const pixels = imageData.data;

      const chars = CHAR_SETS[charSet].chars;
      const charLen = chars.length;

      let result = "";
      let htmlResult = "";

      for (let y = 0; y < rows; y++) {
        let line = "";
        let htmlLine = "";
        for (let x = 0; x < cols; x++) {
          const idx = (y * cols + x) * 4;
          const r = pixels[idx];
          const g = pixels[idx + 1];
          const b = pixels[idx + 2];

          let lum = 0.299 * r + 0.587 * g + 0.114 * b;
          if (invert) lum = 255 - lum;

          const charIdx = Math.min(
            Math.floor((lum / 255) * charLen),
            charLen - 1
          );
          const ch = chars[charIdx] || " ";
          line += ch;

          if (colorMode === "original") {
            const displayChar = ch === " " ? "\u00A0" : ch;
            htmlLine += `<span style="color:rgb(${r},${g},${b})">${displayChar}</span>`;
          }
        }
        result += line + "\n";
        if (colorMode === "original") {
          htmlResult += htmlLine + "\n";
        }
      }

      setAscii(result);
      setColoredHtml(htmlResult);
    };
    img.src = imageSrc;
  }, [imageSrc, width, contrast, brightness, invert, charSet, colorMode]);

  useEffect(() => {
    processImage();
  }, [processImage]);

  function handleFile(file: File) {
    if (!file.type.startsWith("image/")) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      setImageSrc(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  async function copyOutput() {
    try {
      await navigator.clipboard.writeText(ascii);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      /* noop */
    }
  }

  const labelRow: React.CSSProperties = {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "0.7rem",
    textTransform: "uppercase",
    letterSpacing: "0.04em",
    color: "var(--text-secondary)",
  };

  const monoVal: React.CSSProperties = {
    fontFamily: "var(--font-geist-mono), monospace",
  };

  // Decide text color for preview
  const previewColor =
    colorMode === "tinted" ? tintColor : "var(--text-primary)";

  // Font size to fit nicely
  const fontSize = Math.max(3, Math.min(10, 700 / width));

  return (
    <div className="page-wrap">
      <div className="grain" />
      <div className="playground">
        <div className="nav-row">
          <Link href="/" className="back-link">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Back
          </Link>
          <ThemeToggle />
        </div>

        <div className="playground-header">
          <div>
            <h2>ASCII Art Studio</h2>
            <p className="playground-desc">
              Convert any image to ASCII art. Choose character sets, tweak
              contrast, pick a tint color, and export.
            </p>
          </div>
          <button
            className="export-btn"
            onClick={copyOutput}
            disabled={!ascii}
          >
            {copied ? "Copied!" : "Export ASCII"}
          </button>
        </div>

        <canvas ref={canvasRef} style={{ display: "none" }} />

        {/* Upload zone — compact inline */}
        <div
          onDrop={handleDrop}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onClick={() => fileInputRef.current?.click()}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            border: `1px dashed ${dragging ? "var(--text-primary)" : "var(--border)"}`,
            borderRadius: "0.5rem",
            padding: "0.75rem 1rem",
            cursor: "pointer",
            background: dragging
              ? "rgba(255,255,255,0.03)"
              : "var(--bgt-secondary)",
            transition: "all 0.2s ease",
            marginBottom: "1rem",
          }}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
            }}
          />
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--text-secondary)"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ flexShrink: 0, opacity: 0.5 }}
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
          <span
            style={{
              fontSize: "0.75rem",
              textTransform: "uppercase",
              letterSpacing: "0.04em",
              color: "var(--text-secondary)",
            }}
          >
            {fileName || "Drop image or click to upload"}
          </span>
        </div>

        {/* Controls panel */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
            gap: "1rem",
            padding: "1rem",
            borderRadius: "0.5rem",
            border: "1px solid var(--border)",
            background: "var(--bgt-secondary)",
            marginBottom: "1rem",
          }}
        >
          {/* Character set */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
            <div style={labelRow}>
              <span>Charset</span>
            </div>
            <select
              value={charSet}
              onChange={(e) => setCharSet(e.target.value)}
              style={{
                width: "100%",
                padding: "6px 8px",
                borderRadius: "4px",
                border: "1px solid var(--border)",
                background: "var(--app-bg)",
                color: "var(--text-primary)",
                fontSize: "0.7rem",
                cursor: "pointer",
                outline: "none",
              }}
            >
              {Object.entries(CHAR_SETS).map(([key, val]) => (
                <option key={key} value={key}>
                  {val.label}
                </option>
              ))}
            </select>
          </div>

          {/* Width */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
            <div style={labelRow}>
              <span>Width</span>
              <span style={monoVal}>{width}</span>
            </div>
            <input
              type="range"
              min="30"
              max="200"
              step="5"
              value={width}
              onChange={(e) => setWidth(Number(e.target.value))}
              style={{ width: "100%", accentColor: "var(--text-primary)" }}
            />
          </div>

          {/* Contrast */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
            <div style={labelRow}>
              <span>Contrast</span>
              <span style={monoVal}>{contrast.toFixed(1)}</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="3"
              step="0.1"
              value={contrast}
              onChange={(e) => setContrast(Number(e.target.value))}
              style={{ width: "100%", accentColor: "var(--text-primary)" }}
            />
          </div>

          {/* Brightness */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
            <div style={labelRow}>
              <span>Brightness</span>
              <span style={monoVal}>
                {brightness > 0 ? "+" : ""}
                {brightness.toFixed(1)}
              </span>
            </div>
            <input
              type="range"
              min="-0.5"
              max="0.5"
              step="0.05"
              value={brightness}
              onChange={(e) => setBrightness(Number(e.target.value))}
              style={{ width: "100%", accentColor: "var(--text-primary)" }}
            />
          </div>

          {/* Color mode */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
            <div style={labelRow}>
              <span>Color</span>
            </div>
            <div style={{ display: "flex", gap: "0.35rem" }}>
              {(["mono", "tinted", "original"] as ColorMode[]).map((m) => (
                <button
                  key={m}
                  onClick={() => setColorMode(m)}
                  style={{
                    flex: 1,
                    padding: "6px 2px",
                    borderRadius: "4px",
                    background:
                      colorMode === m
                        ? "var(--text-primary)"
                        : "transparent",
                    color:
                      colorMode === m
                        ? "var(--app-bg)"
                        : "var(--text-primary)",
                    border: "1px solid var(--border)",
                    cursor: "pointer",
                    textTransform: "uppercase",
                    fontSize: "0.55rem",
                    letterSpacing: "0.03em",
                  }}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* Tint Color Picker — visible when tinted mode */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
            <div style={labelRow}>
              <span>Tint</span>
              <span style={{ ...monoVal, fontSize: "0.6rem" }}>
                {tintColor}
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <input
                type="color"
                value={tintColor}
                onChange={(e) => {
                  setTintColor(e.target.value);
                  if (colorMode !== "tinted") setColorMode("tinted");
                }}
                style={{
                  width: "32px",
                  height: "28px",
                  padding: 0,
                  border: "1px solid var(--border)",
                  borderRadius: "4px",
                  cursor: "pointer",
                  background: "transparent",
                }}
              />
              <button
                onClick={() => setInvert(!invert)}
                style={{
                  flex: 1,
                  padding: "6px",
                  borderRadius: "4px",
                  background: invert
                    ? "var(--text-primary)"
                    : "transparent",
                  color: invert
                    ? "var(--app-bg)"
                    : "var(--text-primary)",
                  border: "1px solid var(--border)",
                  cursor: "pointer",
                  textTransform: "uppercase",
                  fontSize: "0.6rem",
                }}
              >
                Invert
              </button>
            </div>
          </div>
        </div>

        {/* Preview */}
        <div className="preview-stack">
          <div className="preview-meta">
            <span className="preview-badge">Live Preview</span>
            <span
              style={{
                fontSize: "0.65rem",
                textTransform: "uppercase",
                color: "var(--text-secondary)",
                letterSpacing: "0.04em",
              }}
            >
              {width} cols · {CHAR_SETS[charSet].label}
            </span>
          </div>
          <div
            className="preview"
            style={{
              padding: "1rem",
              minHeight: "24rem",
              overflow: "auto",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {ascii && colorMode !== "original" && (
              <pre
                style={{
                  fontFamily:
                    "var(--font-geist-mono), 'Courier New', monospace",
                  fontSize: `${fontSize}px`,
                  lineHeight: 1.15,
                  letterSpacing: "0px",
                  color: previewColor,
                  margin: 0,
                  whiteSpace: "pre",
                  userSelect: "all",
                  tabSize: 1,
                }}
              >
                {ascii}
              </pre>
            )}
            {ascii && colorMode === "original" && (
              <pre
                dangerouslySetInnerHTML={{ __html: coloredHtml }}
                style={{
                  fontFamily:
                    "var(--font-geist-mono), 'Courier New', monospace",
                  fontSize: `${fontSize}px`,
                  lineHeight: 1.15,
                  letterSpacing: "0px",
                  margin: 0,
                  whiteSpace: "pre",
                  userSelect: "all",
                  tabSize: 1,
                }}
              />
            )}
          </div>
        </div>

        {/* Code block */}
        {ascii && (
          <div className="code-wrap" style={{ marginTop: "1rem" }}>
            <div className="code-head">
              <span>ASCII Output</span>
              <span>.txt</span>
            </div>
            <pre
              className="code-block"
              style={{
                maxHeight: "200px",
                overflowY: "auto",
                fontSize: "0.55rem",
              }}
            >
              {ascii}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
