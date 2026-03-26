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

/* ── Apple-Grade Smooth Accelerated Thumbnails ──────────────────────────── */
// Utilizing CSS keyframes for 60fps hardware-accelerated transforms and opacity interpolation.

const StyleInjector = () => (
  <style dangerouslySetInnerHTML={{ __html: `
    @keyframes hw-float {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-10px); }
    }
    @keyframes hw-pulse {
      0%, 100% { transform: scale(1); opacity: 0.7; }
      50% { transform: scale(1.1); opacity: 1; }
    }
    @keyframes hw-spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
    @keyframes hw-orbit {
      from { transform: rotate(0deg) translateX(40px); }
      to { transform: rotate(360deg) translateX(40px); }
    }
    @keyframes hw-dash {
      to { stroke-dashoffset: -24; }
    }
    @keyframes hw-spring {
      0%, 100% { transform: scale(1); }
      12% { transform: scale(0.9); }
      24% { transform: scale(1.05); }
      36% { transform: scale(0.98); }
      48% { transform: scale(1); }
    }
    @keyframes hw-morph {
      0%, 100% { rx: 60px; }
      50% { rx: 0px; }
    }
    @keyframes hw-grow {
      0%, 100% { transform: scaleX(1); }
      50% { transform: scaleX(1.2); }
    }
    @keyframes hw-bezier {
      0%, 100% { transform: translate(0, 0); }
      50% { transform: translate(240px, -160px); }
    }
    .smooth-ease {
      animation-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
    }
    .spring-ease {
      animation-timing-function: cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }
    .thumb-svg {
      width: 100%;
      height: 100%;
      display: block;
    }
  `}} />
);

const GradientThumb = () => (
  <svg viewBox="0 0 400 240" fill="none" preserveAspectRatio="xMidYMid slice" className="thumb-svg">
    <defs>
      <radialGradient id="ap-grad1" cx="50%" cy="50%" r="60%">
        <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.8" />
        <stop offset="100%" stopColor="#f43f5e" stopOpacity="0" />
      </radialGradient>
      <radialGradient id="ap-grad2" cx="50%" cy="50%" r="60%">
        <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.8" />
        <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
      </radialGradient>
      <radialGradient id="ap-grad3" cx="50%" cy="50%" r="60%">
        <stop offset="0%" stopColor="#10b981" stopOpacity="0.7" />
        <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
      </radialGradient>
      <filter id="ap-blur">
        <feGaussianBlur stdDeviation="40" />
      </filter>
    </defs>
    <rect width="400" height="240" fill="var(--app-bg)" />
    <g filter="url(#ap-blur)">
      <circle cx="100" cy="60" r="180" fill="url(#ap-grad1)" style={{ transformOrigin: '200px 120px', animation: 'hw-spin 20s infinite linear' }} />
      <g style={{ transformOrigin: '200px 120px', animation: 'hw-spin 15s infinite linear reverse' }}>
        <circle cx="280" cy="180" r="160" fill="url(#ap-grad2)" />
      </g>
      <g style={{ transformOrigin: '150px 100px', animation: 'hw-spin 25s infinite linear' }}>
        <circle cx="150" cy="200" r="150" fill="url(#ap-grad3)" />
      </g>
    </g>
  </svg>
);

const PaletteThumb = () => {
  const colors = ["#f43f5e", "#f97316", "#facc15", "#4ade80", "#3b82f6"];
  return (
    <svg viewBox="0 0 400 240" fill="none" preserveAspectRatio="xMidYMid slice" className="thumb-svg">
      <rect width="400" height="240" fill="var(--bgt-secondary)" />
      <g transform="translate(60, 60)">
        {colors.map((color, i) => (
          <rect
            key={i}
            x={i * 56}
            y="0"
            width="48"
            height="120"
            rx="24"
            fill={color}
            style={{
              transition: "transform 0.4s cubic-bezier(0.4, 0, 0.2, 1), border-radius 0.4s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-12px)";
              e.currentTarget.style.rx = "12px";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.rx = "24px";
            }}
          />
        ))}
      </g>
    </svg>
  );
};

const NoiseThumb = () => (
  <svg viewBox="0 0 400 240" fill="none" preserveAspectRatio="xMidYMid slice" className="thumb-svg">
    <defs>
      <filter id="ultra-noise" x="0" y="0" width="100%" height="100%">
        <feTurbulence type="fractalNoise" baseFrequency="0.6" numOctaves="3" stitchTiles="stitch" />
        <feColorMatrix type="matrix" values="1 0 0 0 0, 1 0 0 0 0, 1 0 0 0 0, 0 0 0 0.25 0" />
      </filter>
    </defs>
    <rect width="400" height="240" fill="var(--bgt-secondary)" />
    <rect width="400" height="240" filter="url(#ultra-noise)" opacity="0.8" />
  </svg>
);

const DitherThumb = () => (
  <svg viewBox="0 0 400 240" fill="none" preserveAspectRatio="xMidYMid slice" className="thumb-svg" style={{ imageRendering: 'pixelated' as any }}>
    <rect width="400" height="240" fill="var(--bgt-secondary)" />
    <g transform="translate(150, 70)">
      {Array.from({ length: 10 }, (_, row) =>
        Array.from({ length: 10 }, (_, col) => {
          const isActive = (row * col) % 3 === 0 || (row + col) % 5 === 0;
          return isActive ? (
            <rect
              key={`${row}-${col}`}
              x={col * 10}
              y={row * 10}
              width="6"
              height="6"
              fill="var(--text-primary)"
              style={{
                opacity: 0.2,
                animation: 'hw-pulse 3s infinite alternate',
                animationDelay: `${row * 0.1 + col * 0.1}s`,
                animationTimingFunction: 'ease-in-out'
              }}
            />
          ) : null;
        })
      )}
    </g>
  </svg>
);

const PatternThumb = () => (
  <svg viewBox="0 0 400 240" fill="none" preserveAspectRatio="xMidYMid slice" className="thumb-svg">
    <rect width="400" height="240" fill="var(--bgt-secondary)" />
    <defs>
      <pattern id="premium-dot" x="0" y="0" width="16" height="16" patternUnits="userSpaceOnUse">
        <circle cx="8" cy="8" r="1.5" fill="var(--text-primary)" opacity="0.3" />
      </pattern>
      <pattern id="premium-dash" x="0" y="0" width="16" height="16" patternUnits="userSpaceOnUse">
        <path d="M 8 4 L 8 12 M 4 8 L 12 8" stroke="var(--text-primary)" strokeWidth="1" strokeLinecap="round" opacity="0.3" />
      </pattern>
    </defs>
    
    <g transform="translate(200, 120)">
      <g style={{ animation: 'hw-float 6s infinite smooth-ease alternate' }}>
        <rect x="-110" y="-120" width="160" height="160" rx="12" fill="var(--surface)" stroke="var(--border)" strokeWidth="1" transform="skewY(-15) scale(1, 0.86)" />
        <rect x="-110" y="-120" width="160" height="160" rx="12" fill="url(#premium-dot)" transform="skewY(-15) scale(1, 0.86)" />
      </g>
      <g style={{ animation: 'hw-float 6s infinite smooth-ease alternate-reverse' }}>
        <rect x="-10" y="-40" width="140" height="140" rx="12" fill="var(--surface)" stroke="var(--border)" strokeWidth="1" transform="skewY(-15) scale(1, 0.86)" />
        <rect x="-10" y="-40" width="140" height="140" rx="12" fill="url(#premium-dash)" transform="skewY(-15) scale(1, 0.86)" />
      </g>
    </g>
  </svg>
);

const ShadowThumb = () => (
  <svg viewBox="0 0 400 240" fill="none" preserveAspectRatio="xMidYMid slice" className="thumb-svg">
    <rect width="400" height="240" fill="var(--bgt-secondary)" />
    <defs>
      <filter id="sh-light" x="-40%" y="-40%" width="180%" height="180%">
        <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="var(--text-primary)" floodOpacity="0.06" />
      </filter>
      <filter id="sh-medium" x="-40%" y="-40%" width="180%" height="180%">
        <feDropShadow dx="0" dy="6" stdDeviation="10" floodColor="var(--text-primary)" floodOpacity="0.08" />
        <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="var(--text-primary)" floodOpacity="0.05" />
      </filter>
      <filter id="sh-heavy" x="-40%" y="-40%" width="180%" height="180%">
        <feDropShadow dx="0" dy="16" stdDeviation="24" floodColor="var(--text-primary)" floodOpacity="0.12" />
        <feDropShadow dx="0" dy="6" stdDeviation="8" floodColor="var(--text-primary)" floodOpacity="0.08" />
        <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="var(--text-primary)" floodOpacity="0.04" />
      </filter>
    </defs>
    <g transform="translate(200, 120)">
      {/* Stacked cards showing progressive shadow depth */}
      <g style={{ animation: 'hw-float 8s infinite smooth-ease alternate' }}>
        <rect x="-100" y="-70" width="130" height="90" rx="12" fill="var(--surface)" filter="url(#sh-light)" />
        <rect x="-92" y="-62" width="40" height="4" rx="2" fill="var(--text-primary)" opacity="0.15" />
        <rect x="-92" y="-52" width="60" height="3" rx="1.5" fill="var(--text-primary)" opacity="0.08" />
      </g>
      <g style={{ animation: 'hw-float 6s infinite smooth-ease alternate-reverse' }}>
        <rect x="-25" y="-50" width="130" height="90" rx="12" fill="var(--surface)" filter="url(#sh-medium)" />
        <rect x="-17" y="-42" width="40" height="4" rx="2" fill="var(--text-primary)" opacity="0.15" />
        <rect x="-17" y="-32" width="60" height="3" rx="1.5" fill="var(--text-primary)" opacity="0.08" />
        <rect x="-17" y="-22" width="30" height="3" rx="1.5" fill="var(--text-primary)" opacity="0.06" />
      </g>
      <g style={{ animation: 'hw-float 7s infinite smooth-ease alternate' }}>
        <rect x="-10" y="-20" width="130" height="100" rx="16" fill="var(--surface)" filter="url(#sh-heavy)" />
        <rect x="-2" y="-12" width="50" height="5" rx="2.5" fill="var(--text-primary)" opacity="0.15" />
        <rect x="-2" y="0" width="80" height="3" rx="1.5" fill="var(--text-primary)" opacity="0.08" />
        <rect x="-2" y="8" width="60" height="3" rx="1.5" fill="var(--text-primary)" opacity="0.06" />
        <circle cx="110" cy="70" r="3" fill="#8b5cf6" opacity="0.6" />
      </g>
    </g>
  </svg>
);

const RadiusThumb = () => (
  <svg viewBox="0 0 400 240" fill="none" preserveAspectRatio="xMidYMid slice" className="thumb-svg">
    <rect width="400" height="240" fill="var(--bgt-secondary)" />
    <g transform="translate(200, 120)">
      {/* Guide lines */}
      <path d="M -120 -80 L 120 -80 M -120 80 L 120 80" stroke="var(--text-primary)" strokeWidth="0.5" strokeDasharray="2 4" opacity="0.1" />
      {/* 4px sharp */}
      <rect x="-120" y="-60" width="50" height="50" rx="4" fill="var(--surface)" stroke="var(--border)" strokeWidth="1">
        <animate attributeName="rx" values="4; 4; 4; 4; 4" dur="6s" repeatCount="indefinite" />
      </rect>
      <text x="-95" y="12" fill="var(--text-primary)" fontSize="9" fontFamily="var(--font-geist-mono), monospace" textAnchor="middle" opacity="0.35">4px</text>
      {/* 12px medium */}
      <rect x="-50" y="-60" width="50" height="50" rx="12" fill="var(--surface)" stroke="var(--border)" strokeWidth="1">
        <animate attributeName="rx" values="12; 12; 12; 12; 12" dur="6s" repeatCount="indefinite" />
      </rect>
      <text x="-25" y="12" fill="var(--text-primary)" fontSize="9" fontFamily="var(--font-geist-mono), monospace" textAnchor="middle" opacity="0.35">12px</text>
      {/* Morphing shape */}
      <rect x="20" y="-60" width="50" height="50" rx="4" fill="var(--surface)" stroke="#10b981" strokeWidth="2" strokeOpacity="0.6">
        <animate attributeName="rx" values="4; 12; 25; 12; 4" dur="4s" repeatCount="indefinite" />
      </rect>
      <text x="45" y="12" fill="#10b981" fontSize="9" fontFamily="var(--font-geist-mono), monospace" textAnchor="middle" opacity="0.6">
        <animate attributeName="textContent" values="4px;12px;pill;12px;4px" dur="4s" repeatCount="indefinite" />
      </text>
      {/* Pill */}
      <rect x="90" y="-60" width="50" height="50" rx="25" fill="var(--surface)" stroke="var(--border)" strokeWidth="1" />
      <text x="115" y="12" fill="var(--text-primary)" fontSize="9" fontFamily="var(--font-geist-mono), monospace" textAnchor="middle" opacity="0.35">pill</text>
      {/* Button examples below */}
      <rect x="-100" y="30" width="80" height="28" rx="4" fill="var(--text-primary)" opacity="0.12" />
      <rect x="-5" y="30" width="80" height="28" rx="14" fill="var(--text-primary)" opacity="0.12" />
    </g>
  </svg>
);

const TypeScaleThumb = () => (
  <svg viewBox="0 0 400 240" fill="none" preserveAspectRatio="xMidYMid slice" className="thumb-svg">
    <rect width="400" height="240" fill="var(--bgt-secondary)" />
    <g transform="translate(60, 40)">
      {/* Baseline guides */}
      {[0, 52, 92, 122, 146].map((y, i) => (
        <line key={i} x1="-20" y1={y} x2="340" y2={y} stroke="var(--text-primary)" strokeWidth="0.5" strokeDasharray="1 3" opacity="0.12" />
      ))}
      {/* Scale accent bar */}
      <line x1="-15" y1="-8" x2="-15" y2="165" stroke="var(--text-primary)" strokeWidth="1" strokeDasharray="3 3" opacity="0.15" />
      {/* Type hierarchy */}
      <text x="0" y="46" fill="var(--text-primary)" fontSize="48" fontFamily="var(--font-geist-sans), system-ui, sans-serif" fontWeight="700" letterSpacing="-0.04em">Display</text>
      <text x="0" y="88" fill="var(--text-primary)" fontSize="32" fontFamily="var(--font-geist-sans), system-ui, sans-serif" fontWeight="600" letterSpacing="-0.02em" opacity="0.75">Heading</text>
      <text x="0" y="118" fill="var(--text-primary)" fontSize="20" fontFamily="var(--font-geist-sans), system-ui, sans-serif" fontWeight="500" opacity="0.55">Subheading</text>
      <text x="0" y="143" fill="var(--text-primary)" fontSize="14" fontFamily="var(--font-geist-sans), system-ui, sans-serif" fontWeight="400" opacity="0.4">Body text specimen</text>
      {/* Ratio badge */}
      <rect x="210" y="148" width="80" height="18" rx="9" fill="var(--text-primary)" opacity="0.08" />
      <text x="250" y="160" fill="var(--text-primary)" fontSize="9" fontFamily="var(--font-geist-mono), monospace" textAnchor="middle" opacity="0.35">1.618 ratio</text>
    </g>
  </svg>
);

const SVGMotionThumb = () => (
  <svg viewBox="0 0 400 240" fill="none" preserveAspectRatio="xMidYMid slice" className="thumb-svg">
    <rect width="400" height="240" fill="var(--bgt-secondary)" />
    <defs>
      <linearGradient id="motion-grad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="var(--text-primary)" stopOpacity="0.05" />
        <stop offset="50%" stopColor="var(--text-primary)" stopOpacity="0.8" />
        <stop offset="100%" stopColor="var(--text-primary)" stopOpacity="0.05" />
      </linearGradient>
    </defs>
    <g transform="translate(0, 120)">
      {/* Grid baseline */}
      <path d="M 0 0 L 400 0" stroke="var(--text-primary)" strokeWidth="1" strokeDasharray="4 4" opacity="0.1" />
      
      <g stroke="url(#motion-grad)" fill="none" strokeLinecap="round">
        {/* Deep background wave */}
        <path strokeWidth="1" opacity="0.3">
          <animate attributeName="d" dur="10s" repeatCount="indefinite" values="M -50 0 C 50 -40 150 40 250 0 S 450 -40 500 0; M -50 0 C 50 40 150 -40 250 0 S 450 40 500 0; M -50 0 C 50 -40 150 40 250 0 S 450 -40 500 0" calcMode="spline" keySplines="0.4 0 0.2 1; 0.4 0 0.2 1" />
        </path>
        {/* Mid wave */}
        <path strokeWidth="1.5" opacity="0.6">
          <animate attributeName="d" dur="7s" repeatCount="indefinite" values="M -50 0 C 50 60 150 -60 250 0 S 450 60 500 0; M -50 0 C 50 -60 150 60 250 0 S 450 -60 500 0; M -50 0 C 50 60 150 -60 250 0 S 450 60 500 0" calcMode="spline" keySplines="0.4 0 0.2 1; 0.4 0 0.2 1" />
        </path>
        {/* Primary foreground wave */}
        <path strokeWidth="2.5" opacity="1">
          <animate attributeName="d" dur="5s" repeatCount="indefinite" values="M -50 0 C 50 -90 150 90 250 0 S 450 -90 500 0; M -50 0 C 50 90 150 -90 250 0 S 450 90 500 0; M -50 0 C 50 -90 150 90 250 0 S 450 -90 500 0" calcMode="spline" keySplines="0.4 0 0.2 1; 0.4 0 0.2 1" />
        </path>
      </g>
    </g>
  </svg>
);

const EasingThumb = () => (
  <svg viewBox="0 0 400 240" fill="none" preserveAspectRatio="xMidYMid slice" className="thumb-svg">
    <rect width="400" height="240" fill="var(--bgt-secondary)" />
    <g transform="translate(100, 30)">
      {/* Graph area */}
      <rect x="0" y="0" width="200" height="180" fill="var(--surface)" stroke="var(--border)" strokeWidth="1" rx="8" />
      {/* Grid */}
      <path d="M 50 0 L 50 180 M 100 0 L 100 180 M 150 0 L 150 180" stroke="var(--border)" strokeWidth="1" strokeDasharray="2 4" opacity="0.4" />
      <path d="M 0 45 L 200 45 M 0 90 L 200 90 M 0 135 L 200 135" stroke="var(--border)" strokeWidth="1" strokeDasharray="2 4" opacity="0.4" />
      {/* Handle lines */}
      <line x1="0" y1="180" x2="60" y2="20" stroke="#8b5cf6" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.6" />
      <line x1="200" y1="0" x2="140" y2="160" stroke="#ec4899" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.6" />
      {/* Bezier curve */}
      <path d="M 0,180 C 60,20 140,160 200,0" stroke="var(--text-primary)" strokeWidth="3" fill="none" strokeLinecap="round" />
      {/* Control points */}
      <circle cx="60" cy="20" r="5" fill="#8b5cf6" stroke="var(--surface)" strokeWidth="2" style={{ animation: 'hw-float 6s infinite smooth-ease alternate' }} />
      <circle cx="140" cy="160" r="5" fill="#ec4899" stroke="var(--surface)" strokeWidth="2" style={{ animation: 'hw-float 6s infinite smooth-ease alternate-reverse' }} />
      {/* Ball following curve */}
      <circle r="6" fill="#10b981" style={{ filter: 'drop-shadow(0 0 4px rgba(16, 185, 129, 0.4))' }}>
        <animateMotion dur="4s" repeatCount="indefinite" path="M 0,180 C 60,20 140,160 200,0" calcMode="spline" keySplines="0.25 0.1 0.25 1" keyTimes="0; 1" />
      </circle>
    </g>
  </svg>
);

const SpringThumb = () => (
  <svg viewBox="0 0 400 240" fill="none" preserveAspectRatio="xMidYMid slice" className="thumb-svg">
    <rect width="400" height="240" fill="var(--bgt-secondary)" />
    {/* Left side: spring + weight */}
    <g transform="translate(130, 20)">
      {/* Anchor bar */}
      <rect x="-35" y="0" width="70" height="8" rx="4" fill="var(--text-primary)" opacity="0.25" />
      {/* Coil */}
      <path d="M 0,8 L 20,22 L -20,36 L 20,50 L -20,64 L 20,78 L -20,92 L 0,106" stroke="var(--text-primary)" strokeWidth="2.5" opacity="0.35" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <animate attributeName="d" dur="3s" repeatCount="indefinite" values="M 0,8 L 20,22 L -20,36 L 20,50 L -20,64 L 20,78 L -20,92 L 0,106; M 0,8 L 20,32 L -20,56 L 20,80 L -20,104 L 20,128 L -20,152 L 0,170; M 0,8 L 20,22 L -20,36 L 20,50 L -20,64 L 20,78 L -20,92 L 0,106" keyTimes="0; 0.25; 1" keySplines="0.175 0.885 0.32 1.275; 0.4 0 0.2 1" calcMode="spline" />
      </path>
      {/* Weight */}
      <rect x="-22" y="106" width="44" height="44" rx="10" fill="var(--surface)" stroke="var(--text-primary)" strokeWidth="2" strokeOpacity="0.5">
        <animate attributeName="y" dur="3s" repeatCount="indefinite" values="106; 170; 106" keyTimes="0; 0.25; 1" keySplines="0.175 0.885 0.32 1.275; 0.4 0 0.2 1" calcMode="spline" />
      </rect>
    </g>
    {/* Right side: damping oscillation graph */}
    <g transform="translate(220, 80)">
      <line x1="0" y1="60" x2="150" y2="60" stroke="var(--border)" strokeWidth="1" opacity="0.4" />
      <line x1="0" y1="0" x2="0" y2="120" stroke="var(--border)" strokeWidth="1" opacity="0.4" />
      {/* Damped oscillation curve */}
      <path d="M 0,60 Q 18,10 36,60 Q 50,90 64,60 Q 74,40 84,60 Q 90,70 96,60 Q 100,55 105,60 Q 108,63 112,60" stroke="#f43f5e" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      {/* Start dot */}
      <circle cx="0" cy="60" r="4" fill="#f43f5e" />
      {/* Labels */}
      <text x="75" y="135" fill="var(--text-primary)" fontSize="8" fontFamily="var(--font-geist-mono), monospace" textAnchor="middle" opacity="0.25">time →</text>
    </g>
  </svg>
);

const ASCIIThumb = () => {
  const asciiArt = [
    "+==-::..........::-==+**#%%@@@@@@@@@%%##**+==-::..",
    "=--::.........::--=++*##%%@@@@@@@@@%%##*++=--::...",
    "--::.........::--=++*##%%@@@@@@@@@%%#**+==--::....",
    "::..........::-==+**#%%@@@@@@@@@%%##**+==-::......",
    ":.........::--=++*##%%@@@@@@@@@%%##*++=--::.......",
    ".........::--=++*##%%@@@@@@@@@%%#**+==--::........",
    "........::-==+**#%%@@@@@@@@@%%##**+==-::.........:",
    "......::--=++*##%%@@@@@@@@@%%##*++=--::.........::",
    ".....::--=++*##%%@@@@@@@@@%%#**+==--::.........::-",
    "....::-==+**#%%@@@@@@@@@%%##**+==-::.........::--=",
    "..::--=++*##%%@@@@@@@@@%%##*++=--::.........::--=+",
    ".::--=++*##%%@@@@@@@@@%%#**+==--::.........::-==+*",
    "::-==+**#%%@@@@@@@@@%%##**+==-::.........::--==+**",
    "--=++*##%%@@@@@@@@@%%##*++=--::.........::--=++*##",
    "-=++*##%%@@@@@@@@@%%#**+==--::.........::-==+**##%",
    "=+**#%%@@@@@@@@@%%##**+==-::.........::--==+**#%%@"
  ];
  
  return (
    <svg viewBox="0 0 400 240" fill="none" preserveAspectRatio="xMidYMid slice" className="thumb-svg">
      <rect width="400" height="240" fill="var(--bgt-secondary)" />
      <g 
        transform="translate(20, 30)" 
        fontFamily="var(--font-geist-mono), monospace" 
        fontSize="12" 
        fill="var(--text-primary)"
        style={{ cursor: 'default' }}
      >
        {asciiArt.map((line, i) => (
          <text 
            key={i} 
            x="0" 
            y={i * 12} 
            opacity="0.3"
            style={{ transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)' }}
            onMouseEnter={(e) => {
              (e.currentTarget as any).style.opacity = "0.9";
              (e.currentTarget as any).style.fill = "#10b981";
              (e.currentTarget as any).style.letterSpacing = "0.5px";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as any).style.opacity = "0.3";
              (e.currentTarget as any).style.fill = "var(--text-primary)";
              (e.currentTarget as any).style.letterSpacing = "0px";
            }}
          >
            {line}
          </text>
        ))}
      </g>
      <rect width="400" height="240" fill="url(#asc-grad)" pointerEvents="none" />
      <defs>
        <linearGradient id="asc-grad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="var(--bgt-secondary)" stopOpacity="0.9" />
          <stop offset="20%" stopColor="var(--bgt-secondary)" stopOpacity="0" />
          <stop offset="80%" stopColor="var(--bgt-secondary)" stopOpacity="0" />
          <stop offset="100%" stopColor="var(--bgt-secondary)" stopOpacity="0.9" />
        </linearGradient>
      </defs>
    </svg>
  );
};

const ShaderThumb = () => {
  const lines = Array.from({ length: 30 }).map((_, i) => {
    const y = (i - 15) * 6;
    const s1 = Math.sin(i * 0.3) * 60;
    const c1 = Math.cos(i * 0.3) * 60;
    const s2 = Math.sin(i * 0.2) * 40;
    const c2 = Math.cos(i * 0.2) * 40;

    const v1 = `M -250 ${y} C -100 ${y + s1 - 40} 100 ${y + s2 + 40} 250 ${y}`;
    const v2 = `M -250 ${y} C -100 ${y - c1 + 40} 100 ${y - c2 - 40} 250 ${y}`;
    const v3 = `M -250 ${y} C -100 ${y + s1 - 40} 100 ${y + s2 + 40} 250 ${y}`;

    return (
      <path
        key={i}
        stroke="url(#shader-fade)"
        strokeWidth="0.75"
        fill="none"
      >
        <animate 
          attributeName="d" 
          dur="12s" 
          repeatCount="indefinite" 
          values={`${v1}; ${v2}; ${v3}`} 
          calcMode="spline"
          keySplines="0.4 0 0.2 1; 0.4 0 0.2 1"
        />
      </path>
    );
  });

  return (
    <svg viewBox="0 0 400 240" fill="none" preserveAspectRatio="xMidYMid slice" className="thumb-svg">
      <rect width="400" height="240" fill="var(--bgt-secondary)" />
      <defs>
        <linearGradient id="shader-fade" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="var(--text-primary)" stopOpacity="0" />
          <stop offset="50%" stopColor="var(--text-primary)" stopOpacity="0.4" />
          <stop offset="100%" stopColor="var(--text-primary)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <g transform="translate(200, 120)">
        {lines}
      </g>
    </svg>
  );
};

const tools: Tool[] = [
  {
    label: "01",
    title: "Gradient Architect",
    desc: "Compose layered gradients, tune color stops, and export polished surfaces for production UIs.",
    href: "/gradient",
    thumb: <GradientThumb />,
  },
  {
    label: "02",
    title: "Color Palette Lab",
    desc: "Generate harmonious palettes from color theory. Complementary, triadic, analogous, and more with CSS export.",
    href: "/palette",
    thumb: <PaletteThumb />,
  },
  {
    label: "03",
    title: "Noise Texture Lab",
    desc: "Procedural noise generation with Perlin, Value, and Worley algorithms. fBm layering with PNG export.",
    href: "/noise",
    thumb: <NoiseThumb />,
  },
  {
    label: "04",
    title: "Dither Studio",
    desc: "1-bit ordered dithering aesthetic using 4x4 and 8x8 Bayer matrices linked to CSS themes.",
    href: "/dither",
    thumb: <DitherThumb />,
  },
  {
    label: "05",
    title: "Grid Pattern Studio",
    desc: "Generate repeating SVG-based patterns — dots, lines, crosses, diagonals, isometric — as pure CSS backgrounds.",
    href: "/patterns",
    thumb: <PatternThumb />,
  },
  {
    label: "06",
    title: "Box Shadow Architect",
    desc: "Design multi-layered CSS box shadows visually. 10 curated presets with per-layer control.",
    href: "/shadows",
    thumb: <ShadowThumb />,
  },
  {
    label: "07",
    title: "Border Radius Guide",
    desc: "Learn when to use which border-radius. Visual guide comparing 4px to pill with real UI context.",
    href: "/radius",
    thumb: <RadiusThumb />,
  },
  {
    label: "08",
    title: "Typography Scale",
    desc: "Generate modular type scales from classic ratios — Minor Third to Golden Ratio — with CSS custom properties.",
    href: "/typescale",
    thumb: <TypeScaleThumb />,
  },
  {
    label: "09",
    title: "SVG Motion Forge",
    desc: "Design looping waveforms with controllable amplitude, frequency, stroke, and duration.",
    href: "/svg",
    thumb: <SVGMotionThumb />,
  },
  {
    label: "10",
    title: "Easing Curve Studio",
    desc: "Design cubic-bezier easing curves by dragging control points. 10 presets with live animation previews.",
    href: "/easing",
    thumb: <EasingThumb />,
  },
  {
    label: "11",
    title: "Spring Physics Lab",
    desc: "Generate bouncy, natural physics animations. Tuning mass, stiffness, and damping outputs pure CSS keyframes.",
    href: "/spring",
    thumb: <SpringThumb />,
  },
  {
    label: "12",
    title: "ASCII Art Studio",
    desc: "Convert images to ASCII art with 6 character sets, adjustable contrast, color mode, and instant export.",
    href: "/ascii",
    thumb: <ASCIIThumb />,
  },
  {
    label: "13",
    title: "Shader Studio",
    desc: "WebGL silk shader with domain warping, fold simulation, and Phong lighting.",
    href: "/shader",
    thumb: <ShaderThumb />,
  },
];

export default function Page() {
  return (
    <div className="page-wrap">
      <StyleInjector />
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
