"use client";

import Link from "next/link";
import { useState, useMemo, useRef, useEffect } from "react";
import ThemeToggle from "../components/theme-toggle";

// Spring math
function calculateSpringKeyframes(
  mass: number,
  stiffness: number,
  damping: number,
  frames: number = 100
): number[] {
  const m = mass;
  const k = stiffness;
  const c = damping;
  
  // Damping ratio and angular frequency
  const gamma = c / (2 * Math.sqrt(k * m));
  const omega0 = Math.sqrt(k / m);
  const omegaD = omega0 * Math.sqrt(1 - gamma * gamma);

  const duration = 2; // Fixed simulated 2s to allow settling
  const vals: number[] = [];

  for (let i = 0; i <= frames; i++) {
    const t = (i / frames) * duration;
    
    let position = 1;
    if (gamma < 1) {
      // Underdamped
      const envelope = Math.exp(-gamma * omega0 * t);
      const osc = Math.cos(omegaD * t) + (gamma * omega0 / omegaD) * Math.sin(omegaD * t);
      position = 1 - envelope * osc;
    } else {
      // Critically or overdamped (simplified to exponential approach)
      position = 1 - Math.exp(-omega0 * t) * (1 + omega0 * t);
    }
    
    // clamp to avoid extreme overflow just in case
    vals.push(Math.max(-5, Math.min(5, position)));
  }

  return vals;
}

export default function SpringPage() {
  const [copied, setCopied] = useState(false);
  const playRef = useRef(0);
  
  // Spring params
  const [mass, setMass] = useState(1);
  const [stiffness, setStiffness] = useState(100);
  const [damping, setDamping] = useState(10);
  const [animType, setAnimType] = useState<"scale" | "translate">("scale");

  const springValues = useMemo(() => {
    return calculateSpringKeyframes(mass, stiffness, damping, 60);
  }, [mass, stiffness, damping]);

  const keyframesStr = useMemo(() => {
    let rows = "";
    springValues.forEach((val, index) => {
      const pct = ((index / (springValues.length - 1)) * 100).toFixed(1);
      
      let transform = "";
      if (animType === "scale") {
        transform = `scale(${val.toFixed(3)})`;
      } else {
        const dist = (val - 1) * -200; // translate from 200px to 0
        transform = `translateY(${dist.toFixed(1)}px)`;
      }

      rows += `  ${pct}% { transform: ${transform}; }\n`;
    });
    return `@keyframes spring-anim {\n${rows}}`;
  }, [springValues, animType]);

  const cssCode = `${keyframesStr}\n\n.spring-box {\n  animation: spring-anim 1.5s linear both;\n}`;

  // Reset animation to replay it
  const playAnim = () => {
    playRef.current++;
    const box = document.getElementById("spring-box");
    if (box) {
      box.style.animation = "none";
      void box.offsetWidth; // trigger reflow
      box.style.animation = `spring-anim 1.5s linear both`;
    }
  };

  useEffect(() => {
    playAnim();
  }, [keyframesStr]);

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
            <h2>Spring Physics Lab</h2>
            <p className="playground-desc">
              Generate bouncy, natural physics animations. Tuning mass, stiffness, and damping outputs pure CSS keyframes.
            </p>
          </div>
          <button className="export-btn" onClick={copyCode}>
            {copied ? "Copied!" : "Export Keyframes"}
          </button>
        </div>

        <style>{cssCode}</style>

        {/* Controls */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
            gap: "1rem",
            padding: "1rem",
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
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>Mass</span>
              <span style={{ fontFamily: "var(--font-geist-mono), monospace" }}>{mass}</span>
            </div>
            <input type="range" min="0.1" max="5" step="0.1" value={mass}
              onChange={(e) => setMass(Number(e.target.value))}
              style={{ width: "100%", accentColor: "var(--text-primary)" }} />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>Stiffness</span>
              <span style={{ fontFamily: "var(--font-geist-mono), monospace" }}>{stiffness}</span>
            </div>
            <input type="range" min="10" max="300" step="5" value={stiffness}
              onChange={(e) => setStiffness(Number(e.target.value))}
              style={{ width: "100%", accentColor: "var(--text-primary)" }} />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>Damping</span>
              <span style={{ fontFamily: "var(--font-geist-mono), monospace" }}>{damping}</span>
            </div>
            <input type="range" min="2" max="40" step="1" value={damping}
              onChange={(e) => setDamping(Number(e.target.value))}
              style={{ width: "100%", accentColor: "var(--text-primary)" }} />
          </div>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", justifyContent: "center" }}>
             <div style={{ display: "flex", gap: "0.5rem" }}>
                <button
                  onClick={() => setAnimType("scale")}
                  style={{
                    flex: 1, padding: "8px", borderRadius: "4px",
                    background: animType === "scale" ? "var(--text-primary)" : "transparent",
                    color: animType === "scale" ? "var(--app-bg)" : "var(--text-primary)",
                    border: "1px solid var(--border)", cursor: "pointer",
                    textTransform: "uppercase", fontSize: "0.65rem"
                  }}
                >
                  Scale
                </button>
                <button
                  onClick={() => setAnimType("translate")}
                  style={{
                    flex: 1, padding: "8px", borderRadius: "4px",
                    background: animType === "translate" ? "var(--text-primary)" : "transparent",
                    color: animType === "translate" ? "var(--app-bg)" : "var(--text-primary)",
                    border: "1px solid var(--border)", cursor: "pointer",
                    textTransform: "uppercase", fontSize: "0.65rem"
                  }}
                >
                  Move
                </button>
             </div>
          </div>
        </div>

        {/* Preview */}
        <div className="preview-stack">
          <div className="preview-meta">
            <span className="preview-badge">Live Preview</span>
            <button
              onClick={playAnim}
              style={{
                background: "transparent",
                border: "none",
                color: "var(--text-primary)",
                cursor: "pointer",
                textDecoration: "underline",
                fontSize: "0.7rem",
                textTransform: "uppercase"
              }}
            >
              Replay Animation
            </button>
          </div>
          <div
            className="preview"
            style={{
              padding: "4rem",
              minHeight: "22rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden"
            }}
          >
            <div
              id="spring-box"
              style={{
                width: "80px",
                height: "80px",
                borderRadius: "16px",
                background: "var(--text-primary)",
                opacity: 0.3,
                boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
              }}
            />
          </div>
        </div>

        {/* Code */}
        <div className="code-wrap">
          <div className="code-head">
            <span>Generated @Keyframes</span>
            <span>.css</span>
          </div>
          <pre className="code-block" style={{ maxHeight: "300px", overflowY: "auto" }}>{cssCode}</pre>
        </div>
      </div>
    </div>
  );
}
