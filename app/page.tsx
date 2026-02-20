"use client";

import Link from "next/link";
import { ReactNode } from "react";
import ThemeToggle from "./components/theme-toggle";

type Tool = {
  label: string;
  title: string;
  desc: string;
  href: string;
  thumb: ReactNode;
};

const tools: Tool[] = [
  // ── Color ──────────────────────────────────────────
  {
    label: "01",
    title: "Gradient Architect",
    desc: "Compose layered gradients, tune color stops, and export polished surfaces for production UIs.",
    href: "/gradient",
    thumb: (
      <div
        style={{
          width: "100%",
          height: "100%",
          position: "relative",
          overflow: "hidden",
          background: "var(--bgt-secondary)",
        }}
      >
        <div
          style={{
            position: "absolute",
            width: "150%",
            height: "150%",
            top: "-25%",
            left: "-25%",
            background: "linear-gradient(135deg, transparent 20%, var(--text-primary) 40%, var(--text-primary) 60%, transparent 80%)",
            opacity: 0.08,
            filter: "blur(30px)",
            transform: "rotate(-15deg)",
          }}
        />
        <div
          style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            background: "linear-gradient(to bottom, transparent 0%, var(--bgt-secondary) 100%)",
          }}
        />
      </div>
    ),
  },
  {
    label: "02",
    title: "Color Palette Lab",
    desc: "Generate harmonious palettes from color theory. Complementary, triadic, analogous, and more with CSS export.",
    href: "/palette",
    thumb: (
      <div
        style={{
          width: "100%",
          height: "100%",
          position: "relative",
          overflow: "hidden",
          display: "flex",
        }}
      >
        {["#6366f1", "#a855f7", "#ec4899", "#f43f5e", "#f97316"].map((c) => (
          <div key={c} style={{ flex: 1, background: c, opacity: 0.7, transition: "opacity 0.3s" }} />
        ))}
      </div>
    ),
  },
  // ── Texture & Pattern ──────────────────────────────
  {
    label: "03",
    title: "Noise Texture Lab",
    desc: "Procedural noise generation with Perlin, Value, and Worley algorithms. fBm layering with PNG export.",
    href: "/noise",
    thumb: (
      <div
        style={{
          width: "100%",
          height: "100%",
          position: "relative",
          overflow: "hidden",
          background: "var(--bgt-secondary)",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.04' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
            opacity: 0.12,
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "radial-gradient(circle at 60% 40%, var(--text-primary) 0%, transparent 60%)",
            opacity: 0.06,
          }}
        />
      </div>
    ),
  },
  {
    label: "04",
    title: "Dither Studio",
    desc: "1-bit ordered dithering aesthetic using 4x4 and 8x8 Bayer matrices linked to CSS themes.",
    href: "/dither",
    thumb: (
      <div
        style={{
          width: "100%",
          height: "100%",
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
          background: "var(--bgt-secondary)",
          imageRendering: "pixelated",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: "-20%",
            opacity: 0.15,
            backgroundSize: "8px 8px",
            backgroundImage: "radial-gradient(var(--text-primary) 3px, transparent 0), radial-gradient(var(--text-primary) 3px, transparent 0)",
            backgroundPosition: "0 0, 4px 4px",
            filter: "contrast(200%) grayscale(100%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(to right, var(--bgt-secondary) 10%, transparent 50%, var(--bgt-secondary) 90%)",
          }}
        />
      </div>
    ),
  },
  {
    label: "05",
    title: "Grid Pattern Studio",
    desc: "Generate repeating SVG-based patterns — dots, lines, crosses, diagonals, isometric — as pure CSS backgrounds.",
    href: "/patterns",
    thumb: (
      <div
        style={{
          width: "100%",
          height: "100%",
          position: "relative",
          overflow: "hidden",
          background: "var(--bgt-secondary)",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: "radial-gradient(var(--text-primary) 1px, transparent 0)",
            backgroundSize: "16px 16px",
            opacity: 0.15,
          }}
        />
      </div>
    ),
  },
  // ── CSS Properties ─────────────────────────────────
  {
    label: "06",
    title: "Box Shadow Architect",
    desc: "Design multi-layered CSS box shadows visually. 10 curated presets with per-layer control.",
    href: "/shadows",
    thumb: (
      <div
        style={{
          width: "100%",
          height: "100%",
          position: "relative",
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--bgt-secondary)",
        }}
      >
        <div
          style={{
            width: "50%",
            height: "50%",
            borderRadius: "12px",
            background: "var(--app-bg)",
            boxShadow: "0 8px 30px rgba(0,0,0,0.12), 0 4px 12px rgba(0,0,0,0.08)",
          }}
        />
      </div>
    ),
  },
  {
    label: "07",
    title: "Border Radius Guide",
    desc: "Learn when to use which border-radius. Visual guide comparing 4px to pill with real UI context.",
    href: "/radius",
    thumb: (
      <div
        style={{
          width: "100%",
          height: "100%",
          position: "relative",
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "8px",
          padding: "1.5rem",
          background: "var(--bgt-secondary)",
        }}
      >
        {[4, 12, 24, 999].map((r) => (
          <div
            key={r}
            style={{
              width: "28px",
              height: "28px",
              background: "var(--text-primary)",
              opacity: 0.14,
              borderRadius: `${r}px`,
            }}
          />
        ))}
      </div>
    ),
  },
  {
    label: "08",
    title: "Typography Scale",
    desc: "Generate modular type scales from classic ratios — Minor Third to Golden Ratio — with CSS custom properties.",
    href: "/typescale",
    thumb: (
      <div
        style={{
          width: "100%",
          height: "100%",
          position: "relative",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "1rem 1.5rem",
          gap: "0.2rem",
          background: "var(--bgt-secondary)",
        }}
      >
        {[32, 24, 18, 14, 11, 9].map((s) => (
          <div
            key={s}
            style={{
              height: `${Math.max(s * 0.3, 2)}px`,
              width: `${Math.min(s * 3, 90)}%`,
              background: "var(--text-primary)",
              opacity: 0.12 + (s / 32) * 0.12,
              borderRadius: "1px",
            }}
          />
        ))}
      </div>
    ),
  },
  // ── Animation & Motion ─────────────────────────────
  {
    label: "09",
    title: "SVG Motion Forge",
    desc: "Design looping waveforms with controllable amplitude, frequency, stroke, and duration.",
    href: "/svg",
    thumb: (
      <div
        style={{
          width: "100%",
          height: "100%",
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
          background: "var(--bgt-secondary)",
        }}
      >
        <svg width="100%" height="100%" viewBox="0 0 200 100" fill="none" style={{ opacity: 0.4 }}>
          <path d="M -20,50 Q 30,10 80,50 T 180,50" stroke="var(--text-primary)" strokeWidth="1" />
          <path d="M 20,50 Q 70,90 120,50 T 220,50" stroke="var(--text-primary)" strokeWidth="0.5" strokeDasharray="2 4" />
          <circle cx="80" cy="50" r="3" fill="var(--text-primary)" />
          <circle cx="120" cy="50" r="2" fill="var(--text-primary)" opacity="0.6" />
        </svg>
      </div>
    ),
  },
  {
    label: "10",
    title: "Easing Curve Studio",
    desc: "Design cubic-bezier easing curves by dragging control points. 10 presets with live animation previews.",
    href: "/easing",
    thumb: (
      <div
        style={{
          width: "100%",
          height: "100%",
          position: "relative",
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--bgt-secondary)",
        }}
      >
        <svg viewBox="0 0 100 100" width="60%" height="60%" fill="none">
          <path
            d="M 10 90 C 50 90, 20 10, 90 10"
            stroke="var(--text-primary)"
            strokeWidth="2.5"
            opacity="0.2"
          />
          <circle cx="10" cy="90" r="3" fill="var(--text-primary)" opacity="0.15" />
          <circle cx="90" cy="10" r="3" fill="var(--text-primary)" opacity="0.15" />
        </svg>
      </div>
    ),
  },
  {
    label: "11",
    title: "Spring Physics Lab",
    desc: "Generate bouncy, natural physics animations. Tuning mass, stiffness, and damping outputs pure CSS keyframes.",
    href: "/spring",
    thumb: (
      <div
        style={{
          width: "100%",
          height: "100%",
          position: "relative",
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--bgt-secondary)",
        }}
      >
        <div
          style={{
            width: "36px",
            height: "36px",
            borderRadius: "8px",
            background: "var(--text-primary)",
            opacity: 0.12,
            transform: "scale(1.2)",
          }}
        />
        <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} viewBox="0 0 100 100" fill="none">
          <path d="M 0 50 Q 20 10, 40 60 T 70 45 T 90 50 T 100 50" stroke="var(--text-primary)" strokeWidth="1.5" opacity="0.3" strokeLinecap="round" />
        </svg>
      </div>
    ),
  },
  // ── Visual Effects ─────────────────────────────────
  {
    label: "12",
    title: "ASCII Art Studio",
    desc: "Convert images to ASCII art with 6 character sets, adjustable contrast, color mode, and instant export.",
    href: "/ascii",
    thumb: (
      <div
        style={{
          width: "100%",
          height: "100%",
          position: "relative",
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--bgt-secondary)",
          fontFamily: "'Courier New', monospace",
          fontSize: "0.5rem",
          lineHeight: 1,
          letterSpacing: "0.08em",
          color: "var(--text-primary)",
          opacity: 0.35,
          whiteSpace: "pre",
        }}
      >
        {`  ░▒▓█▓▒░  \n ░▒▓████▓▒░\n▒▓██    ██▓\n▒▓█  ●  █▓\n▒▓██    ██▓\n ░▒▓████▓▒░\n  ░▒▓█▓▒░  `}
      </div>
    ),
  },
  {
    label: "13",
    title: "Shader Studio",
    desc: "WebGL silk shader with domain warping, fold simulation, and Phong lighting.",
    href: "/shader",
    thumb: (
      <div
        style={{
          width: "100%",
          height: "100%",
          position: "relative",
          overflow: "hidden",
          background: "var(--bgt-secondary)",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "radial-gradient(circle at 50% 120%, var(--text-primary) 0%, transparent 70%)",
            opacity: 0.12,
            filter: "blur(20px)",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
            opacity: 0.04,
            mixBlendMode: "overlay",
          }}
        />
      </div>
    ),
  },
];

export default function Page() {
  return (
    <div className="page-wrap">
      <div className="grain" />

      <header className="app-header">
        <div className="header-row">
          <p className="kicker">Modular Frontend Lab</p>
          <ThemeToggle />
        </div>
        <h1>Shaders, motion, and design tools</h1>
        <p className="lede">
          Visual tooling with one-click export for production-ready code.
        </p>
      </header>

      <main className="lab-grid">
        {tools.map((tool) => (
          <Link key={tool.href} href={tool.href} className="tool-card">
            <div className="card-info">
              <span className="card-label">{tool.label}</span>
              <span className="card-title">{tool.title}</span>
              <p className="card-desc">{tool.desc}</p>
              <span className="card-arrow">
                Open playground
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </span>
            </div>
            <div className="card-thumb">
              {tool.thumb}
            </div>
          </Link>
        ))}
      </main>

      <footer className="app-footer">
        <p>Modular Frontend Lab</p>
      </footer>
    </div>
  );
}
