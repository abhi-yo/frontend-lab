const fs = require('fs');

const fileContent = `
"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import ThemeToggle from "../components/theme-toggle";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(useGSAP);
}

const getSVGPoint = (svg: SVGSVGElement, clientX: number, clientY: number) => {
  const pt = svg.createSVGPoint();
  pt.x = clientX;
  pt.y = clientY;
  const ctm = svg.getScreenCTM();
  if (!ctm) return { x: clientX, y: clientY };
  return pt.matrixTransform(ctm.inverse());
};

// ----------------------------------------
// 1. Organic Gooey (Fluid Metaballs)
// ----------------------------------------
const OrganicGooey = () => {
  const container = useRef<SVGSVGElement>(null);
  const { contextSafe } = useGSAP({ scope: container });
  const numBlobs = 8;
  
  useGSAP(() => {
    gsap.utils.toArray<SVGCircleElement>(".goo-blob").forEach((blob, i) => {
      if (i === 0) return;
      gsap.to(blob, {
        cx: "random(100, 700)",
        cy: "random(100, 400)",
        duration: "random(4, 7)",
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true
      });
    });
  }, { scope: container });

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!container.current) return;
    const { x, y } = getSVGPoint(container.current, e.clientX, e.clientY);
    contextSafe(() => {
      gsap.to(".goo-mouse", { cx: x, cy: y, duration: 0.6, ease: "power2.out" });
    })();
  };

  const handleMouseLeave = () => {
    contextSafe(() => {
      gsap.to(".goo-mouse", { cx: 400, cy: 250, duration: 1.5, ease: "elastic.out(1, 0.4)" });
    })();
  };

  const blobs = [];
  for (let i = 0; i < numBlobs; i++) {
    blobs.push(
      <circle
        key={i}
        className={i === 0 ? "goo-mouse" : "goo-blob"}
        cx={400}
        cy={250}
        r={i === 0 ? 50 : 30 + Math.random() * 40}
        fill="currentColor"
        opacity={i === 0 ? 1 : 0.6}
      />
    );
  }

  return (
    <svg ref={container} viewBox="0 0 800 500" preserveAspectRatio="xMidYMid slice" className="w-full h-full cursor-crosshair" style={{ color: "var(--text-primary)" }} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>
      <defs>
        <filter id="goo" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="25" result="blur" />
          <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 30 -12" result="goo" />
          <feComposite in="SourceGraphic" in2="goo" operator="atop" />
        </filter>
      </defs>
      <g filter="url(#goo)">{blobs}</g>
    </svg>
  );
};

// ----------------------------------------
// 2. Directional Field
// ----------------------------------------
const DirectionalField = () => {
  const container = useRef<SVGSVGElement>(null);
  const { contextSafe } = useGSAP({ scope: container });

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!container.current) return;
    const { x, y } = getSVGPoint(container.current, e.clientX, e.clientY);

    contextSafe(() => {
      gsap.utils.toArray<SVGGElement>(".dir-arrow").forEach((arrow) => {
        const cx = parseFloat(arrow.getAttribute("data-x") || "0");
        const cy = parseFloat(arrow.getAttribute("data-y") || "0");
        const dx = x - cx;
        const dy = y - cy;
        const angle = Math.atan2(dy, dx) * (180 / Math.PI);
        const dist = Math.hypot(dx, dy);
        const scale = Math.max(0.6, 1.8 - dist / 200);
        const alpha = Math.max(0.2, 1 - dist / 300);

        gsap.to(arrow, { rotation: angle, scale: scale, opacity: alpha, duration: 0.3, transformOrigin: "center center", ease: "power2.out" });
      });
    })();
  };

  const handleMouseLeave = () => {
    contextSafe(() => {
      gsap.to(".dir-arrow", { rotation: 0, scale: 1, opacity: 0.3, duration: 1, ease: "power2.out" });
    })();
  };

  const arrows = [];
  const rows = 12;
  const cols = 20;
  const spacingX = 800 / cols;
  const spacingY = 500 / rows;
  
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      const cx = j * spacingX + spacingX / 2;
      const cy = i * spacingY + spacingY / 2;
      arrows.push(
        <g key={\`\${i}-\${j}\`} className="dir-arrow" data-x={cx} data-y={cy} style={{ transformOrigin: \`\${cx}px \${cy}px\` }} opacity={0.3}>
          <path d={\`M \${cx - 8} \${cy} L \${cx + 8} \${cy} M \${cx + 3} \${cy - 5} L \${cx + 8} \${cy} L \${cx + 3} \${cy + 5}\`} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </g>
      );
    }
  }

  return (
    <svg ref={container} viewBox="0 0 800 500" preserveAspectRatio="xMidYMid slice" className="w-full h-full cursor-crosshair" style={{ color: "var(--text-primary)" }} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>
      {arrows}
    </svg>
  );
};

// ----------------------------------------
// 3. Fluid Mesh
// ----------------------------------------
const FluidMesh = () => {
  const container = useRef<SVGSVGElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const { contextSafe } = useGSAP({ scope: container });

  const rows = 8;
  const cols = 12;
  const spacingX = 800 / cols;
  const spacingY = 500 / rows;
  
  const initialPoints = useRef(
    Array.from({ length: rows + 1 }, (_, r) => 
      Array.from({ length: cols + 1 }, (_, c) => ({
        x: c * spacingX, y: r * spacingY, ox: c * spacingX, oy: r * spacingY
      }))
    )
  );

  const generatePath = (points: any[][]) => {
    let d = "";
    for (let r = 0; r <= rows; r++) {
      d += \`M \${points[r][0].x},\${points[r][0].y} \`;
      for (let c = 1; c <= cols; c++) {
        const prev = points[r][c-1];
        const curr = points[r][c];
        const midX = (prev.x + curr.x) / 2;
        d += \`Q \${prev.x},\${prev.y} \${midX},\${(prev.y + curr.y) / 2} T \${curr.x},\${curr.y} \`;
      }
    }
    for (let c = 0; c <= cols; c++) {
      d += \`M \${points[0][c].x},\${points[0][c].y} \`;
      for (let r = 1; r <= rows; r++) {
        const prev = points[r-1][c];
        const curr = points[r][c];
        const midY = (prev.y + curr.y) / 2;
        d += \`Q \${prev.x},\${prev.y} \${(prev.x + curr.x) / 2},\${midY} T \${curr.x},\${curr.y} \`;
      }
    }
    return d;
  };

  const currentPoints = useRef(JSON.parse(JSON.stringify(initialPoints.current)));

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!container.current) return;
    const { x: svgX, y: svgY } = getSVGPoint(container.current, e.clientX, e.clientY);
    
    contextSafe(() => {
      const newPoints = currentPoints.current.map((row: any, r: number) => 
        row.map((pt: any, c: number) => {
          const dx = svgX - pt.ox;
          const dy = svgY - pt.oy;
          const dist = Math.hypot(dx, dy);
          if (dist < 150) {
            const force = (150 - dist) / 100;
            const angle = Math.atan2(dy, dx);
            return {
              x: pt.ox - Math.cos(angle) * force * 50,
              y: pt.oy - Math.sin(angle) * force * 50,
              ox: pt.ox, oy: pt.oy
            };
          }
          return { x: pt.ox, y: pt.oy, ox: pt.ox, oy: pt.oy };
        })
      );

      const proxy = { progress: 0 };
      gsap.to(proxy, {
        progress: 1, duration: 0.5, ease: "power2.out",
        onUpdate: () => {
          const p = proxy.progress;
          for (let r = 0; r <= rows; r++) {
            for (let c = 0; c <= cols; c++) {
              currentPoints.current[r][c].x += (newPoints[r][c].x - currentPoints.current[r][c].x) * p;
              currentPoints.current[r][c].y += (newPoints[r][c].y - currentPoints.current[r][c].y) * p;
            }
          }
          if (pathRef.current) pathRef.current.setAttribute("d", generatePath(currentPoints.current));
        },
        overwrite: "auto"
      });
    })();
  };

  const handleMouseLeave = () => {
    contextSafe(() => {
      const proxy = { progress: 0 };
      gsap.to(proxy, {
        progress: 1, duration: 1.5, ease: "elastic.out(1, 0.3)",
        onUpdate: () => {
          const p = proxy.progress;
          for (let r = 0; r <= rows; r++) {
            for (let c = 0; c <= cols; c++) {
              currentPoints.current[r][c].x += (currentPoints.current[r][c].ox - currentPoints.current[r][c].x) * p;
              currentPoints.current[r][c].y += (currentPoints.current[r][c].oy - currentPoints.current[r][c].y) * p;
            }
          }
          if (pathRef.current) pathRef.current.setAttribute("d", generatePath(currentPoints.current));
        },
        overwrite: "auto"
      });
    })();
  };

  return (
    <svg ref={container} viewBox="0 0 800 500" preserveAspectRatio="xMidYMid slice" className="w-full h-full cursor-crosshair" style={{ color: "var(--text-primary)" }} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>
      <path ref={pathRef} d={generatePath(initialPoints.current)} stroke="currentColor" strokeWidth="1.5" fill="none" opacity={0.4} />
    </svg>
  );
};

// ----------------------------------------
// 4. Magnetic Topography (Advanced GSAP)
// ----------------------------------------
const MagneticTopography = () => {
  const container = useRef<SVGSVGElement>(null);
  const linesRef = useRef<(SVGPathElement | null)[]>([]);
  const { contextSafe } = useGSAP({ scope: container });

  const numLines = 25;
  const segments = 25;
  const targetX = useRef(400);
  const targetY = useRef(250);

  // Animate lines constantly drawing towards smooth target
  useGSAP(() => {
    const proxy = { time: 0 };
    gsap.to(proxy, {
      time: 1000,
      duration: 1000,
      ease: "none",
      repeat: -1,
      onUpdate: () => {
        linesRef.current.forEach((line, i) => {
          if (!line) return;
          const baseY = 30 + i * (440 / numLines);
          let d = \`M 0,\${baseY} \`;
          
          for (let j = 1; j <= segments; j++) {
            const baseX = j * (800 / segments);
            const distToMouse = Math.hypot(baseX - targetX.current, baseY - targetY.current);
            const influence = Math.max(0, 200 - distToMouse) / 200;
            
            // Perlin-like wave offset mixing time and vertex coordinates
            const wave = Math.sin(proxy.time * 2 + j * 0.5 + i * 0.2) * 10;
            
            // Magnet pull logic: pulls Y upwards/downwards creating 3D hill effect
            const pullY = baseY - (Math.sin(influence * Math.PI) * 50) + wave;
            
            if (j === 1) d += \`L \${baseX},\${pullY} \`;
            else {
              const prevX = (j - 1) * (800 / segments);
              const prevDist = Math.hypot(prevX - targetX.current, baseY - targetY.current);
              const prevInfl = Math.max(0, 200 - prevDist) / 200;
              const prevWave = Math.sin(proxy.time * 2 + (j - 1) * 0.5 + i * 0.2) * 10;
              const prevY = baseY - (Math.sin(prevInfl * Math.PI) * 50) + prevWave;
              
              const midX = (prevX + baseX) / 2;
              d += \`Q \${prevX},\${prevY} \${midX},\${(prevY + pullY) / 2} T \${baseX},\${pullY} \`;
            }
          }
          line.setAttribute("d", d);
        });
      }
    });
  }, { scope: container });

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!container.current) return;
    const { x, y } = getSVGPoint(container.current, e.clientX, e.clientY);
    contextSafe(() => {
      gsap.to(targetX, { current: x, duration: 0.8, ease: "power2.out" });
      gsap.to(targetY, { current: y, duration: 0.8, ease: "power2.out" });
    })();
  };

  return (
    <svg ref={container} viewBox="0 0 800 500" preserveAspectRatio="xMidYMid slice" className="w-full h-full cursor-crosshair" style={{ color: "var(--text-primary)" }} onMouseMove={handleMouseMove}>
      <g opacity={0.5}>
        {Array.from({ length: numLines }).map((_, i) => (
          <path key={i} ref={el => { linesRef.current[i] = el; }} d="" fill="none" stroke="currentColor" strokeWidth="1" />
        ))}
      </g>
    </svg>
  );
};

// ----------------------------------------
// 5. Quantum Constellation 
// ----------------------------------------
const QuantumConstellation = () => {
  const container = useRef<SVGSVGElement>(null);
  const nodesRef = useRef<(SVGCircleElement | null)[]>([]);
  const linesGroupRef = useRef<SVGGElement>(null);
  const { contextSafe } = useGSAP({ scope: container });
  
  const numNodes = 40;
  const nodes = useRef(
    Array.from({ length: numNodes }, () => ({
      x: Math.random() * 800,
      y: Math.random() * 500,
      vx: (Math.random() - 0.5) * 1.5,
      vy: (Math.random() - 0.5) * 1.5,
      radius: Math.random() * 3 + 1
    }))
  );
  
  const mouse = useRef({ x: 400, y: 250, active: false });

  useGSAP(() => {
    const proxy = { tick: 0 };
    gsap.to(proxy, {
      tick: 1,
      duration: 1,
      repeat: -1,
      ease: "none",
      onUpdate: () => {
        let linesHTML = "";
        const m = mouse.current;

        // Update Physics
        nodes.current.forEach((n, i) => {
          n.x += n.vx;
          n.y += n.vy;
          
          if (n.x <= 0 || n.x >= 800) n.vx *= -1;
          if (n.y <= 0 || n.y >= 500) n.vy *= -1;

          // Mouse Repulsion
          if (m.active) {
            const dx = n.x - m.x;
            const dy = n.y - m.y;
            const dist = Math.hypot(dx, dy);
            if (dist < 120) {
              const force = (120 - dist) / 120;
              n.x += (dx / dist) * force * 5;
              n.y += (dy / dist) * force * 5;
            }
          }

          if (nodesRef.current[i]) {
            nodesRef.current[i]!.setAttribute("cx", String(n.x));
            nodesRef.current[i]!.setAttribute("cy", String(n.y));
          }

          // Generate connect lines
          for (let j = i + 1; j < numNodes; j++) {
            const n2 = nodes.current[j];
            const d = Math.hypot(n.x - n2.x, n.y - n2.y);
            if (d < 100) {
              const op = (100 - d) / 100 * 0.5;
              linesHTML += \`<line x1="\${n.x}" y1="\${n.y}" x2="\${n2.x}" y2="\${n2.y}" stroke="currentColor" stroke-width="1" opacity="\${op}" />\`;
            }
          }
          
          // Draw line to mouse
          if (m.active) {
            const dr = Math.hypot(n.x - m.x, n.y - m.y);
            if (dr < 150) {
              const op = (150 - dr) / 150 * 0.8;
              linesHTML += \`<line x1="\${n.x}" y1="\${n.y}" x2="\${m.x}" y2="\${m.y}" stroke="currentColor" stroke-width="2" stroke-dasharray="4" opacity="\${op}" />\`;
            }
          }
        });

        if (linesGroupRef.current) {
          linesGroupRef.current.innerHTML = linesHTML;
        }
      }
    });
  }, { scope: container });

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!container.current) return;
    const { x, y } = getSVGPoint(container.current, e.clientX, e.clientY);
    mouse.current = { x, y, active: true };
  };

  const handleMouseLeave = () => {
    mouse.current.active = false;
  };

  return (
    <svg ref={container} viewBox="0 0 800 500" preserveAspectRatio="xMidYMid slice" className="w-full h-full cursor-crosshair" style={{ color: "var(--text-primary)" }} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>
      <g ref={linesGroupRef}></g>
      {nodes.current.map((n, i) => (
        <circle key={i} ref={el => { nodesRef.current[i] = el; }} cx={n.x} cy={n.y} r={n.radius} fill="currentColor" opacity={0.6} />
      ))}
    </svg>
  );
};


// ----------------------------------------
// Code string generators for the UI
// ----------------------------------------
const genericStub = \`
// Download full source dynamically or inspect Next.js tree!
// Components natively integrate contextSafe and getScreenCTM utilities.
\`;

type AnimType = "gooey" | "directional" | "fluid" | "topography" | "quantum";

export default function SvgPage() {
  const [copied, setCopied] = useState(false);
  const [activeAnim, setActiveAnim] = useState<AnimType>("gooey");

  let CurrentComponent = OrganicGooey;
  if (activeAnim === "directional") CurrentComponent = DirectionalField;
  if (activeAnim === "fluid") CurrentComponent = FluidMesh;
  if (activeAnim === "topography") CurrentComponent = MagneticTopography;
  if (activeAnim === "quantum") CurrentComponent = QuantumConstellation;

  async function copyCode() {
    try {
      await navigator.clipboard.writeText("Code explicitly available in repository structure.");
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {}
  }

  return (
    <div className="page-wrap h-screen flex flex-col">
      <div className="grain" />

      <div className="playground flex flex-col flex-1 pb-12 w-full max-w-[1400px] mx-auto px-6">
        <div className="nav-row py-6 flex justify-between items-center z-10 relative">
          <Link href="/" className="back-link flex items-center gap-2 hover:opacity-70 transition-opacity">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Back
          </Link>
          <ThemeToggle />
        </div>

        <div className="playground-header mb-8 z-10 relative">
          <div>
            <h2 className="text-3xl font-bold mb-2">GSAP SVG Interactive Mechanics</h2>
            <p className="playground-desc opacity-70 max-w-2xl">
              Advanced scalable SVG backgrounds capturing precise pointer tracking matrix transformations across any frame size. Seamlessly blends into light and dark themes.
            </p>
          </div>
        </div>

        <div className="preset-row flex flex-wrap gap-3 mb-6 z-10 relative">
          {[
            { id: "gooey", label: "Fluid Metaballs" },
            { id: "directional", label: "Directional Field" },
            { id: "fluid", label: "Fluid Mesh Warp" },
            { id: "topography", label: "Magnetic Topography" },
            { id: "quantum", label: "Quantum Constellation" }
          ].map(btn => (
            <button
              key={btn.id}
              className="preset-btn px-4 py-2 rounded-md transition-colors border border-current text-sm"
              style={{
                background: activeAnim === btn.id ? "var(--text-primary)" : "transparent",
                color: activeAnim === btn.id ? "var(--app-bg)" : "var(--text-primary)",
              }}
              onClick={() => setActiveAnim(btn.id as AnimType)}
            >
              {btn.label}
            </button>
          ))}
        </div>

        <div className="preview-stack flex-1 flex flex-col min-h-0 z-10 relative">
          <div className="preview-meta flex justify-between uppercase text-xs tracking-wider opacity-60 mb-2">
            <span className="preview-badge flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              Live Interactive View (Full Bleed)
            </span>
            <span>React + GSAP Engine</span>
          </div>
          
          <div className="preview svg-preview relative flex-1 rounded-xl overflow-hidden border border-[var(--border)] shadow-2xl bg-[var(--bgt-secondary)]">
            <div className="absolute inset-0 w-full h-full">
              <CurrentComponent />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
`

fs.writeFileSync('/Users/akshatsingh/Desktop/modular_lab/app/svg/page.tsx', fileContent);
