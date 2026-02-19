"use client";

import Link from "next/link";
import { CSSProperties, ReactNode, useMemo, useState } from "react";
import ThemeToggle from "../components/theme-toggle";

function wavePath(amplitude: number, frequency: number) {
  const width = 900;
  const baseY = 130;
  const steps = 60;
  const pts: string[] = [];

  for (let i = 0; i <= steps; i += 1) {
    const x = (i / steps) * width;
    const y = baseY + Math.sin((i / steps) * Math.PI * 2 * frequency) * amplitude;
    pts.push(`${x.toFixed(2)},${y.toFixed(2)}`);
  }

  return `M ${pts.join(" L ")}`;
}

function sliderStyle(value: number, min: number, max: number): CSSProperties {
  const progress = ((value - min) / (max - min)) * 100;
  return { "--range-progress": `${progress}%` } as CSSProperties;
}

function Control({ label, value, children }: { label: string; value: string | number; children: ReactNode }) {
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

export default function SvgPage() {
  const [copied, setCopied] = useState(false);
  const [amplitude, setAmplitude] = useState(46);
  const [frequency, setFrequency] = useState(3);
  const [duration, setDuration] = useState(6);
  const [stroke, setStroke] = useState(4);

  const fromPath = useMemo(() => wavePath(amplitude, frequency), [amplitude, frequency]);
  const toPath = useMemo(
    () => wavePath(Math.max(8, amplitude - 14), frequency + 1),
    [amplitude, frequency],
  );

  const svgCode = `<svg viewBox="0 0 900 260" xmlns="http://www.w3.org/2000/svg" fill="none">\n  <defs>\n    <linearGradient id="wave-gradient" x1="0" y1="0" x2="900" y2="0" gradientUnits="userSpaceOnUse">\n      <stop offset="0%" stop-color="#302F2C"/>\n      <stop offset="50%" stop-color="#868580"/>\n      <stop offset="100%" stop-color="#EFEDE3"/>\n    </linearGradient>\n  </defs>\n  <path d="${fromPath}" stroke="url(#wave-gradient)" stroke-width="${stroke}" stroke-linecap="round">\n    <animate attributeName="d" dur="${duration}s" repeatCount="indefinite" values="${fromPath};${toPath};${fromPath}" />\n  </path>\n</svg>`;

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(svgCode);
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
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Back
          </Link>
          <ThemeToggle />
        </div>

        <div className="playground-header">
          <div>
            <h2>SVG Motion Forge</h2>
            <p className="playground-desc">
              Design looping waveforms with controllable amplitude, frequency, stroke, and duration.
            </p>
          </div>
          <button className="export-btn" onClick={copyCode}>
            {copied ? "Copied" : "Export SVG"}
          </button>
        </div>

        <div className="preview-stack">
          <div className="preview-meta">
            <span className="preview-badge">Live Preview</span>
            <span>{duration}s morph</span>
          </div>
          <div className="preview svg-preview">
            <svg viewBox="0 0 900 260" role="img" aria-label="Animated waveform">
              <defs>
                <linearGradient id="wave-gradient-preview" x1="0" y1="0" x2="900" y2="0">
                  <stop offset="0%" stopColor="#302F2C" />
                  <stop offset="50%" stopColor="#868580" />
                  <stop offset="100%" stopColor="#EFEDE3" />
                </linearGradient>
              </defs>
              <path
                d={fromPath}
                stroke="url(#wave-gradient-preview)"
                strokeWidth={stroke}
                strokeLinecap="round"
                fill="none"
              >
                <animate
                  attributeName="d"
                  dur={`${duration}s`}
                  repeatCount="indefinite"
                  values={`${fromPath};${toPath};${fromPath}`}
                />
              </path>
            </svg>
          </div>
        </div>

        <div className="controls">
          <Control label="Amplitude" value={amplitude}>
            <input
              className="range-input"
              style={sliderStyle(amplitude, 12, 90)}
              type="range"
              min={12}
              max={90}
              value={amplitude}
              onChange={(e) => setAmplitude(Number(e.target.value))}
            />
          </Control>
          <Control label="Frequency" value={frequency}>
            <input
              className="range-input"
              style={sliderStyle(frequency, 1, 7)}
              type="range"
              min={1}
              max={7}
              value={frequency}
              onChange={(e) => setFrequency(Number(e.target.value))}
            />
          </Control>
          <Control label="Duration" value={`${duration}s`}>
            <input
              className="range-input"
              style={sliderStyle(duration, 2, 12)}
              type="range"
              min={2}
              max={12}
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
            />
          </Control>
          <Control label="Stroke" value={stroke}>
            <input
              className="range-input"
              style={sliderStyle(stroke, 1, 10)}
              type="range"
              min={1}
              max={10}
              value={stroke}
              onChange={(e) => setStroke(Number(e.target.value))}
            />
          </Control>
        </div>

        <div className="code-wrap">
          <div className="code-head">
            <span>SVG Markup</span>
            <span>.svg</span>
          </div>
          <pre className="code-block">{svgCode}</pre>
        </div>
      </div>
    </div>
  );
}
