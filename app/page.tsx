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

const SVG_THUMB_FROM_PATH = "M 0,130 L 15,144.2 L 30,157.7 L 45,169.8 L 60,180 L 75,187.8 L 90,192.9 L 105,194.9 L 120,193.5 L 135,188.9 L 150,181.1 L 165,170.6 L 180,157.8 L 195,143.4 L 210,128 L 225,112.5 L 240,97.5 L 255,84.1 L 270,73 L 285,64.8 L 300,60.1 L 315,59.1 L 330,61.9 L 345,68.4 L 360,78.1 L 375,90.5 L 390,105 L 405,120.8 L 420,137.1 L 435,153.2 L 450,168.2 L 465,181.5 L 480,192.3 L 495,199.9 L 510,203.9 L 525,204 L 540,200.1 L 555,192.4 L 570,181.6 L 585,168.4 L 600,153.8 L 615,138.6 L 630,123.7 L 645,109.8 L 660,97.9 L 675,88.5 L 690,82.3 L 705,79.5 L 720,80.2 L 735,84.5 L 750,92.1 L 765,102.6 L 780,115.4 L 795,130 L 810,145.4 L 825,160.8 L 840,175.4 L 855,188.6 L 870,199.4 L 885,207.1 L 900,211";
const SVG_THUMB_TO_PATH = "M 0,130 L 15,145.2 L 30,159.4 L 45,171.7 L 60,181.3 L 75,187.6 L 90,190.2 L 105,188.9 L 120,183.8 L 135,175.4 L 150,164.2 L 165,151 L 180,136.8 L 195,122.5 L 210,109.2 L 225,97.8 L 240,89 L 255,83.4 L 270,81.3 L 285,83 L 300,88.4 L 315,97.3 L 330,109.3 L 345,123.8 L 360,140 L 375,157 L 390,173.8 L 405,189.3 L 420,202.6 L 435,213 L 450,219.9 L 465,223 L 480,222.1 L 495,217.4 L 510,209.4 L 525,198.8 L 540,186.5 L 555,173.5 L 570,160.7 L 585,149.1 L 600,139.5 L 615,132.6 L 630,129 L 645,129 L 660,132.6 L 675,139.5 L 690,149.1 L 705,160.7 L 720,173.5 L 735,186.5 L 750,198.8 L 765,209.4 L 780,217.4 L 795,222.1 L 810,223 L 825,219.9 L 840,213 L 855,202.6 L 870,189.3 L 885,173.8 L 900,157";
const tools: Tool[] = [
  {
    label: "01",
    title: "Shader Studio",
    desc: "WebGL silk shader with domain warping, fold simulation, and Phong lighting.",
    href: "/shader",
    thumb: (
      <div
        style={{
          width: "100%",
          height: "100%",
          background:
            "radial-gradient(ellipse at 30% 20%, rgba(200,200,200,0.35), transparent 55%), radial-gradient(ellipse at 75% 75%, rgba(180,180,180,0.25), transparent 50%), radial-gradient(ellipse at 50% 50%, #4a4a4a, #1a1a1a)",
          backgroundBlendMode: "screen, screen, normal",
          animation: "pulseField 12s linear infinite",
        }}
      />
    ),
  },
  {
    label: "02",
    title: "SVG Motion Forge",
    desc: "Design looping waveforms with controllable amplitude, frequency, stroke, and duration.",
    href: "/svg",
    thumb: (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "grid",
          placeItems: "center",
          background: "var(--svg-preview-bg)",
        }}
      >
        <svg viewBox="0 0 900 260" fill="none" style={{ width: "100%", height: "80%" }}>
          <defs>
            <linearGradient id="wg-home" x1="0" y1="0" x2="900" y2="0">
              <stop offset="0%" stopColor="#302F2C" />
              <stop offset="50%" stopColor="#868580" />
              <stop offset="100%" stopColor="#EFEDE3" />
            </linearGradient>
          </defs>
          <path
            d={SVG_THUMB_FROM_PATH}
            stroke="url(#wg-home)"
            strokeWidth="4"
            strokeLinecap="round"
            fill="none"
          >
            <animate
              attributeName="d"
              dur="6s"
              repeatCount="indefinite"
              values={`${SVG_THUMB_FROM_PATH};${SVG_THUMB_TO_PATH};${SVG_THUMB_FROM_PATH}`}
            />
          </path>
        </svg>
      </div>
    ),
  },
  {
    label: "03",
    title: "Gradient Architect",
    desc: "Compose layered gradients, tune color stops, and export polished surfaces for production UIs.",
    href: "/gradient",
    thumb: (
      <div
        style={{
          width: "100%",
          height: "100%",
          background:
            "radial-gradient(circle at 10% 20%, rgba(255,255,255,0.34), transparent 42%), radial-gradient(circle at 80% 78%, rgba(0,0,0,0.16), transparent 48%), linear-gradient(135deg, #302F2C 10%, #868580 52%, #EFEDE3 92%)",
        }}
      />
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
        <h1>Shaders, motion, and gradient tools</h1>
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
