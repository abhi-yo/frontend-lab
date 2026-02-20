"use client";

import Link from "next/link";
import { useState, useMemo } from "react";
import ThemeToggle from "../components/theme-toggle";

// ── Standard radius values with educational context ──
const RADIUS_GUIDE = [
  {
    value: 0,
    name: "None",
    token: "--radius-none",
    use: "Tables, data grids, code blocks",
    desc: "Sharp corners feel technical and structured. Use for content that benefits from clear boundaries.",
  },
  {
    value: 4,
    name: "Subtle",
    token: "--radius-sm",
    use: "Inputs, small badges, tooltips",
    desc: "Just enough softness to feel refined without compromising density. The most common micro-radius.",
  },
  {
    value: 8,
    name: "Small",
    token: "--radius-md",
    use: "Buttons, chips, dropdowns, alerts",
    desc: "The workhorse radius. Works on almost everything interactive. Most design systems default here.",
  },
  {
    value: 12,
    name: "Medium",
    token: "--radius-lg",
    use: "Cards, panels, dialogs, modals",
    desc: "Friendly and approachable. Creates a clear but soft container. Great for content cards.",
  },
  {
    value: 16,
    name: "Large",
    token: "--radius-xl",
    use: "Feature cards, hero sections, media",
    desc: "Bold and modern. Signals importance. Use sparingly — it draws visual attention.",
  },
  {
    value: 24,
    name: "XL",
    token: "--radius-2xl",
    use: "Floating panels, search bars, CTAs",
    desc: "Feels premium and playful. Apple-style rounded containers. Best at larger element sizes.",
  },
  {
    value: 9999,
    name: "Full / Pill",
    token: "--radius-full",
    use: "Avatars, tags, pill buttons, dots",
    desc: "Creates circles (square elements) or pills (wide elements). The universal choice for avatars.",
  },
];

export default function RadiusPage() {
  const [copied, setCopied] = useState(false);
  const [activeRadius, setActiveRadius] = useState(8);
  const [previewSize, setPreviewSize] = useState<"sm" | "md" | "lg">("md");

  const sizes = { sm: { w: 80, h: 40 }, md: { w: 160, h: 100 }, lg: { w: 280, h: 180 } };
  const current = sizes[previewSize];

  const cssCode = useMemo(() => {
    let code = `:root {\n`;
    RADIUS_GUIDE.forEach((r) => {
      code += `  ${r.token}: ${r.value === 9999 ? "9999px" : r.value + "px"};  /* ${r.name} — ${r.use.split(",")[0]} */\n`;
    });
    code += `}\n\n/* Usage example: */\n.card  { border-radius: var(--radius-lg); }   /* 12px */\n.btn   { border-radius: var(--radius-md); }   /* 8px  */\n.badge { border-radius: var(--radius-full); } /* pill */`;
    return code;
  }, []);

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
            <h2>Border Radius Guide</h2>
            <p className="playground-desc">
              Learn when to use which border-radius. Each standard value has a purpose — pick the right one for your use case.
            </p>
          </div>
          <button className="export-btn" onClick={copyCode}>
            {copied ? "Copied!" : "Export Scale"}
          </button>
        </div>

        {/* Size toggle */}
        <div className="preset-row">
          <span style={{ fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-secondary)", marginRight: "0.25rem" }}>Preview size</span>
          {(["sm", "md", "lg"] as const).map((s) => (
            <button
              key={s}
              className="preset-btn"
              style={{
                background: previewSize === s ? "var(--text-primary)" : "",
                color: previewSize === s ? "var(--app-bg)" : "",
              }}
              onClick={() => setPreviewSize(s)}
            >
              {s.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Guide cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {RADIUS_GUIDE.map((item) => {
            const isActive = activeRadius === item.value;
            const displayRadius = Math.min(item.value, Math.floor(Math.min(current.w, current.h) / 2));

            return (
              <button
                key={item.value}
                onClick={() => setActiveRadius(item.value)}
                style={{
                  display: "grid",
                  gridTemplateColumns: `${current.w + 48}px 1fr`,
                  gap: "1.5rem",
                  alignItems: "center",
                  padding: "1.25rem 1.5rem",
                  borderRadius: "0.75rem",
                  border: isActive ? "1.5px solid var(--text-primary)" : "1px solid var(--border)",
                  background: isActive ? "var(--bgt-secondary)" : "transparent",
                  cursor: "pointer",
                  textAlign: "left",
                  color: "var(--text-primary)",
                  transition: "all 0.2s ease",
                  width: "100%",
                }}
              >
                {/* Shape preview */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <div
                    style={{
                      width: `${current.w}px`,
                      height: `${current.h}px`,
                      borderRadius: `${displayRadius}px`,
                      background: isActive ? "var(--text-primary)" : "var(--text-primary)",
                      opacity: isActive ? 0.15 : 0.07,
                      transition: "all 0.3s ease",
                      border: `1.5px solid var(--text-primary)`,
                      borderColor: isActive ? "var(--text-primary)" : "transparent",
                    }}
                  />
                </div>

                {/* Text info */}
                <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
                  <div style={{ display: "flex", alignItems: "baseline", gap: "0.75rem" }}>
                    <span style={{ fontWeight: 600, fontSize: "0.95rem" }}>
                      {item.name}
                    </span>
                    <span style={{
                      fontFamily: "var(--font-geist-mono), monospace",
                      fontSize: "0.7rem",
                      padding: "2px 8px",
                      borderRadius: "4px",
                      background: "var(--bgt-secondary)",
                      border: "1px solid var(--border)",
                      color: "var(--text-secondary)",
                    }}>
                      {item.value === 9999 ? "9999px" : `${item.value}px`}
                    </span>
                  </div>
                  <div style={{
                    fontSize: "0.72rem",
                    color: "var(--text-secondary)",
                    lineHeight: 1.5,
                  }}>
                    {item.desc}
                  </div>
                  <div style={{
                    fontSize: "0.65rem",
                    color: "var(--text-secondary)",
                    opacity: 0.7,
                    fontFamily: "var(--font-geist-mono), monospace",
                    textTransform: "uppercase",
                    letterSpacing: "0.04em",
                    marginTop: "0.15rem",
                  }}>
                    → {item.use}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Comparison strip */}
        <div className="preview-stack" style={{ marginTop: "1.5rem" }}>
          <div className="preview-meta">
            <span className="preview-badge">Comparison</span>
            <span>All radii at {current.w}×{current.h}px</span>
          </div>
          <div
            className="preview"
            style={{
              padding: "2rem",
              minHeight: "auto",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "1.5rem",
              flexWrap: "wrap",
            }}
          >
            {RADIUS_GUIDE.map((item) => {
              const displayRadius = Math.min(item.value, 40);
              const isActive = activeRadius === item.value;
              return (
                <div
                  key={item.value}
                  style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}
                  onClick={() => setActiveRadius(item.value)}
                >
                  <div
                    style={{
                      width: "56px",
                      height: "56px",
                      borderRadius: `${displayRadius}px`,
                      background: isActive ? "var(--text-primary)" : "var(--text-primary)",
                      opacity: isActive ? 0.2 : 0.08,
                      border: `1.5px solid ${isActive ? "var(--text-primary)" : "transparent"}`,
                      transition: "all 0.2s",
                    }}
                  />
                  <span style={{
                    fontFamily: "var(--font-geist-mono), monospace",
                    fontSize: "0.6rem",
                    color: isActive ? "var(--text-primary)" : "var(--text-secondary)",
                    fontWeight: isActive ? 600 : 400,
                  }}>
                    {item.value === 9999 ? "full" : `${item.value}px`}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Code */}
        <div className="code-wrap">
          <div className="code-head">
            <span>Radius Scale CSS</span>
            <span>.css</span>
          </div>
          <pre className="code-block">{cssCode}</pre>
        </div>
      </div>
    </div>
  );
}
