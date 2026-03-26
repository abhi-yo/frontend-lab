"use client";

import Link from "next/link";
import { CSSProperties, ReactNode, useState, useRef } from "react";
import ThemeToggle from "../components/theme-toggle";
import FullscreenButton from "../components/fullscreen-button";

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
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

export default function GradientPage() {
  const previewRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const [angle, setAngle] = useState(135);
  const [colorA, setColorA] = useState("#f43f5e");
  const [colorB, setColorB] = useState("#8b5cf6");
  const [colorC, setColorC] = useState("#3b82f6");
  const [stopA, setStopA] = useState(10);
  const [stopB, setStopB] = useState(52);
  const [stopC, setStopC] = useState(92);

  const normalizedB = clamp(Math.max(stopB, stopA + 5), 0, 95);
  const normalizedC = clamp(Math.max(stopC, normalizedB + 5), 5, 100);

  const gradientLayer1 = `linear-gradient(${angle}deg, ${colorA} ${stopA}%, ${colorB} ${normalizedB}%, ${colorC} ${normalizedC}%)`;
  const gradientLayer2 = "radial-gradient(circle at 10% 20%, rgba(255,255,255,0.34), transparent 42%)";
  const gradientLayer3 = "radial-gradient(circle at 80% 78%, rgba(255,255,255,0.15), transparent 48%)";

  const gradientCode = `.surface-gradient {\n  background: ${gradientLayer2},\n              ${gradientLayer3},\n              ${gradientLayer1};\n}`;

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(gradientCode);
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
            <h2>Gradient Architect</h2>
            <p className="playground-desc">
              Compose layered gradients, tune color stops, and export polished surfaces for production UIs.
            </p>
          </div>
          <button className="export-btn" onClick={copyCode}>
            {copied ? "Copied" : "Export CSS"}
          </button>
        </div>

        <div className="preview-stack">
          <div className="preview-meta">
            <span className="preview-badge">Live Preview</span>
            <span>{angle}deg blend</span>
          </div>
          <div
            ref={previewRef}
            className="preview gradient-preview"
            style={{
              background: `${gradientLayer2}, ${gradientLayer3}, ${gradientLayer1}`,
              minHeight: "clamp(16rem, 50vw, 28rem)",
            }}
          >
            <FullscreenButton targetRef={previewRef} />
          </div>
        </div>

        <div className="controls">
          <Control label="Angle" value={`${angle}deg`}>
            <input
              className="range-input"
              style={sliderStyle(angle, 0, 360)}
              type="range"
              min={0}
              max={360}
              value={angle}
              onChange={(e) => setAngle(Number(e.target.value))}
            />
          </Control>
          <Control label="Color A" value={colorA.toUpperCase()}>
            <input type="color" value={colorA} onChange={(e) => setColorA(e.target.value)} />
          </Control>
          <Control label="Stop A" value={`${stopA}%`}>
            <input
              className="range-input"
              style={sliderStyle(stopA, 0, 100)}
              type="range"
              min={0}
              max={100}
              value={stopA}
              onChange={(e) => setStopA(Number(e.target.value))}
            />
          </Control>
          <Control label="Color B" value={colorB.toUpperCase()}>
            <input type="color" value={colorB} onChange={(e) => setColorB(e.target.value)} />
          </Control>
          <Control label="Stop B" value={`${normalizedB}%`}>
            <input
              className="range-input"
              style={sliderStyle(normalizedB, 0, 100)}
              type="range"
              min={0}
              max={100}
              value={normalizedB}
              onChange={(e) => setStopB(Number(e.target.value))}
            />
          </Control>
          <Control label="Color C" value={colorC.toUpperCase()}>
            <input type="color" value={colorC} onChange={(e) => setColorC(e.target.value)} />
          </Control>
          <Control label="Stop C" value={`${normalizedC}%`}>
            <input
              className="range-input"
              style={sliderStyle(normalizedC, 0, 100)}
              type="range"
              min={0}
              max={100}
              value={normalizedC}
              onChange={(e) => setStopC(Number(e.target.value))}
            />
          </Control>
        </div>

        <div className="code-wrap">
          <div className="code-head">
            <span>Gradient CSS</span>
            <span>.css</span>
          </div>
          <pre className="code-block">{gradientCode}</pre>
        </div>
      </div>
    </div>
  );
}
