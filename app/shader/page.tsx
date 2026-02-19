"use client";

import Link from "next/link";
import { CSSProperties, ReactNode, useMemo, useState } from "react";
import ThemeToggle from "../components/theme-toggle";
import ShaderCanvas, { type ShaderUniforms } from "../components/shader-canvas";

function sliderStyle(value: number, min: number, max: number): CSSProperties {
  const progress = ((value - min) / (max - min)) * 100;
  return { "--range-progress": `${progress}%` } as CSSProperties;
}

function Control({
  label,
  value,
  children,
}: {
  label: string;
  value: string | number;
  children: ReactNode;
}) {
  return (
    <label className="control">
      <span className="control-row">
        <span>{label}</span>
        <span className="control-value">{value}</span>
      </span>
      {children}
    </label>
  );
}

export default function ShaderPage() {
  const [copied, setCopied] = useState(false);

  const [speed, setSpeed] = useState(0.8);
  const [distortion, setDistortion] = useState(0.7);
  const [swirl, setSwirl] = useState(0.3);
  const [grainMixer, setGrainMixer] = useState(0);
  const [grainOverlay, setGrainOverlay] = useState(0);
  const [rotation, setRotation] = useState(0);
  const [colors, setColors] = useState(["#1a1a1a", "#4a4a4a", "#8c8c8c", "#d4d4d4"]);

  function setColor(index: number, value: string) {
    setColors((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  }

  function addColor() {
    if (colors.length < 8) {
      setColors((prev) => [...prev, "#666666"]);
    }
  }

  function removeColor() {
    if (colors.length > 2) {
      setColors((prev) => prev.slice(0, -1));
    }
  }

  const uniforms: ShaderUniforms = useMemo(
    () => ({
      speed,
      distortion,
      swirl,
      grainMixer,
      grainOverlay,
      scale: 1,
      rotation,
      colors,
    }),
    [speed, distortion, swirl, grainMixer, grainOverlay, rotation, colors],
  );

  const shaderCode = useMemo(() => {
    const colorsStr = colors.map((c) => `"${c}"`).join(", ");
    return `// Silk Shader — WebGL Fragment Shader
// Colors: [${colorsStr}]
// Speed: ${speed} | Distortion: ${distortion} | Swirl: ${swirl}
// Rotation: ${rotation}deg
// Grain Mixer: ${grainMixer} | Grain Overlay: ${grainOverlay}
//
// Domain-warped simplex noise with fold simulation
// and dual-light Phong shading for silk-like appearance.
//
// To use: copy the ShaderCanvas component and pass these
// uniforms to recreate this exact shader.`;
  }, [colors, speed, distortion, swirl, grainMixer, grainOverlay, rotation]);

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(shaderCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {}
  }

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
            <h2>Shader Studio</h2>
            <p className="playground-desc">
              WebGL silk shader with domain warping, fold simulation, and Phong lighting.
            </p>
          </div>
          <button className="export-btn" onClick={copyCode}>
            {copied ? "Copied" : "Copy Config"}
          </button>
        </div>

        <div className="preview-stack">
          <div className="preview-meta">
            <span className="preview-badge">Live Preview</span>
            <span>{colors.length} colors</span>
          </div>
          <div className="preview-viewport">
            <ShaderCanvas uniforms={uniforms} />
          </div>
        </div>

        <div className="controls">
          {colors.map((c, i) => (
            <Control key={i} label={`Color ${i + 1}`} value={c.toUpperCase()}>
              <input
                type="color"
                value={c}
                onChange={(e) => setColor(i, e.target.value)}
              />
            </Control>
          ))}
          <div className="control color-count-control">
            <span className="control-row">
              <span>Colors</span>
              <span className="control-value">{colors.length}</span>
            </span>
            <span className="color-count-btns">
              <button onClick={removeColor} disabled={colors.length <= 2}>
                −
              </button>
              <button onClick={addColor} disabled={colors.length >= 8}>
                +
              </button>
            </span>
          </div>

          <Control label="Speed" value={speed.toFixed(1)}>
            <input
              className="range-input"
              style={sliderStyle(speed, 0, 3)}
              type="range"
              min={0}
              max={3}
              step={0.1}
              value={speed}
              onChange={(e) => setSpeed(Number(e.target.value))}
            />
          </Control>
          <Control label="Distortion" value={distortion.toFixed(1)}>
            <input
              className="range-input"
              style={sliderStyle(distortion, 0, 2)}
              type="range"
              min={0}
              max={2}
              step={0.1}
              value={distortion}
              onChange={(e) => setDistortion(Number(e.target.value))}
            />
          </Control>
          <Control label="Swirl" value={swirl.toFixed(1)}>
            <input
              className="range-input"
              style={sliderStyle(swirl, 0, 2)}
              type="range"
              min={0}
              max={2}
              step={0.1}
              value={swirl}
              onChange={(e) => setSwirl(Number(e.target.value))}
            />
          </Control>
          <Control label="Rotation" value={`${rotation}°`}>
            <input
              className="range-input"
              style={sliderStyle(rotation, 0, 360)}
              type="range"
              min={0}
              max={360}
              value={rotation}
              onChange={(e) => setRotation(Number(e.target.value))}
            />
          </Control>
          <Control label="Grain Mixer" value={grainMixer.toFixed(1)}>
            <input
              className="range-input"
              style={sliderStyle(grainMixer, 0, 1)}
              type="range"
              min={0}
              max={1}
              step={0.1}
              value={grainMixer}
              onChange={(e) => setGrainMixer(Number(e.target.value))}
            />
          </Control>
          <Control label="Grain Overlay" value={grainOverlay.toFixed(1)}>
            <input
              className="range-input"
              style={sliderStyle(grainOverlay, 0, 1)}
              type="range"
              min={0}
              max={1}
              step={0.1}
              value={grainOverlay}
              onChange={(e) => setGrainOverlay(Number(e.target.value))}
            />
          </Control>
        </div>

        <div className="code-wrap">
          <div className="code-head">
            <span>Shader Config</span>
            <span>.glsl</span>
          </div>
          <pre className="code-block">{shaderCode}</pre>
        </div>
      </div>
    </div>
  );
}
