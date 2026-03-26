"use client";

import Link from "next/link";
import { useState, useRef } from "react";
import ThemeToggle from "../components/theme-toggle";
import FullscreenButton from "../components/fullscreen-button";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(useGSAP);
}

// ── Shared utility ──
const getSVGPoint = (svg: SVGSVGElement, clientX: number, clientY: number) => {
  const pt = svg.createSVGPoint();
  pt.x = clientX;
  pt.y = clientY;
  const ctm = svg.getScreenCTM();
  if (!ctm) return { x: clientX, y: clientY };
  return pt.matrixTransform(ctm.inverse());
};

// ── Control types ──
interface SVGControls {
  color: string;
  strokeWidth: number;
  opacity: number;
}

// ────────────────────────────────────────
// 1. Organic Gooey (Fluid Metaballs)
// ────────────────────────────────────────
const OrganicGooey = ({ controls }: { controls: SVGControls }) => {
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
        yoyo: true,
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
        fill={controls.color}
        opacity={i === 0 ? controls.opacity : controls.opacity * 0.6}
      />
    );
  }

  return (
    <svg ref={container} viewBox="0 0 800 500" preserveAspectRatio="xMidYMid slice" className="w-full h-full cursor-crosshair" onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>
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

// ────────────────────────────────────────
// 2. Directional Field
// ────────────────────────────────────────
const DirectionalField = ({ controls }: { controls: SVGControls }) => {
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
        const alpha = Math.max(0.15, controls.opacity - dist / 300);

        gsap.to(arrow, { rotation: angle, scale, opacity: alpha, duration: 0.3, transformOrigin: "center center", ease: "power2.out" });
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
        <g key={`${i}-${j}`} className="dir-arrow" data-x={cx} data-y={cy} style={{ transformOrigin: `${cx}px ${cy}px` }} opacity={0.3}>
          <path d={`M ${cx - 8} ${cy} L ${cx + 8} ${cy} M ${cx + 3} ${cy - 5} L ${cx + 8} ${cy} L ${cx + 3} ${cy + 5}`} stroke={controls.color} strokeWidth={controls.strokeWidth} strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </g>
      );
    }
  }

  return (
    <svg ref={container} viewBox="0 0 800 500" preserveAspectRatio="xMidYMid slice" className="w-full h-full cursor-crosshair" onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>
      {arrows}
    </svg>
  );
};

// ────────────────────────────────────────
// 3. Fluid Mesh Warp
// ────────────────────────────────────────
const FluidMesh = ({ controls }: { controls: SVGControls }) => {
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
        x: c * spacingX, y: r * spacingY, ox: c * spacingX, oy: r * spacingY,
      }))
    )
  );

  const generatePath = (points: any[][]) => {
    let d = "";
    for (let r = 0; r <= rows; r++) {
      d += `M ${points[r][0].x},${points[r][0].y} `;
      for (let c = 1; c <= cols; c++) {
        const prev = points[r][c - 1];
        const curr = points[r][c];
        const midX = (prev.x + curr.x) / 2;
        d += `Q ${prev.x},${prev.y} ${midX},${(prev.y + curr.y) / 2} T ${curr.x},${curr.y} `;
      }
    }
    for (let c = 0; c <= cols; c++) {
      d += `M ${points[0][c].x},${points[0][c].y} `;
      for (let r = 1; r <= rows; r++) {
        const prev = points[r - 1][c];
        const curr = points[r][c];
        const midY = (prev.y + curr.y) / 2;
        d += `Q ${prev.x},${prev.y} ${(prev.x + curr.x) / 2},${midY} T ${curr.x},${curr.y} `;
      }
    }
    return d;
  };

  const currentPoints = useRef(JSON.parse(JSON.stringify(initialPoints.current)));

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!container.current) return;
    const { x: svgX, y: svgY } = getSVGPoint(container.current, e.clientX, e.clientY);

    contextSafe(() => {
      const newPoints = currentPoints.current.map((row: any) =>
        row.map((pt: any) => {
          const dx = svgX - pt.ox;
          const dy = svgY - pt.oy;
          const dist = Math.hypot(dx, dy);
          if (dist < 150) {
            const force = (150 - dist) / 100;
            const angle = Math.atan2(dy, dx);
            return { x: pt.ox - Math.cos(angle) * force * 50, y: pt.oy - Math.sin(angle) * force * 50, ox: pt.ox, oy: pt.oy };
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
        overwrite: "auto",
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
        overwrite: "auto",
      });
    })();
  };

  return (
    <svg ref={container} viewBox="0 0 800 500" preserveAspectRatio="xMidYMid slice" className="w-full h-full cursor-crosshair" onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>
      <path ref={pathRef} d={generatePath(initialPoints.current)} stroke={controls.color} strokeWidth={controls.strokeWidth} fill="none" opacity={controls.opacity} />
    </svg>
  );
};

// ────────────────────────────────────────
// 4. Magnetic Topography
// ────────────────────────────────────────
const MagneticTopography = ({ controls }: { controls: SVGControls }) => {
  const container = useRef<SVGSVGElement>(null);
  const linesRef = useRef<(SVGPathElement | null)[]>([]);
  const { contextSafe } = useGSAP({ scope: container });

  const numLines = 25;
  const segments = 25;
  const targetX = useRef(400);
  const targetY = useRef(250);

  useGSAP(() => {
    const proxy = { time: 0 };
    gsap.to(proxy, {
      time: 1000, duration: 1000, ease: "none", repeat: -1,
      onUpdate: () => {
        linesRef.current.forEach((line, i) => {
          if (!line) return;
          const baseY = 30 + i * (440 / numLines);
          let d = `M 0,${baseY} `;

          for (let j = 1; j <= segments; j++) {
            const baseX = j * (800 / segments);
            const distToMouse = Math.hypot(baseX - targetX.current, baseY - targetY.current);
            const influence = Math.max(0, 200 - distToMouse) / 200;
            const wave = Math.sin(proxy.time * 2 + j * 0.5 + i * 0.2) * 10;
            const pullY = baseY - (Math.sin(influence * Math.PI) * 50) + wave;

            if (j === 1) d += `L ${baseX},${pullY} `;
            else {
              const prevX = (j - 1) * (800 / segments);
              const prevDist = Math.hypot(prevX - targetX.current, baseY - targetY.current);
              const prevInfl = Math.max(0, 200 - prevDist) / 200;
              const prevWave = Math.sin(proxy.time * 2 + (j - 1) * 0.5 + i * 0.2) * 10;
              const prevY = baseY - (Math.sin(prevInfl * Math.PI) * 50) + prevWave;
              const midX = (prevX + baseX) / 2;
              d += `Q ${prevX},${prevY} ${midX},${(prevY + pullY) / 2} T ${baseX},${pullY} `;
            }
          }
          line.setAttribute("d", d);
        });
      },
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
    <svg ref={container} viewBox="0 0 800 500" preserveAspectRatio="xMidYMid slice" className="w-full h-full cursor-crosshair" onMouseMove={handleMouseMove}>
      <g opacity={controls.opacity}>
        {Array.from({ length: numLines }).map((_, i) => (
          <path key={i} ref={(el) => { linesRef.current[i] = el; }} d="" fill="none" stroke={controls.color} strokeWidth={controls.strokeWidth} />
        ))}
      </g>
    </svg>
  );
};

// ────────────────────────────────────────
// 5. Quantum Constellation
// ────────────────────────────────────────
const QuantumConstellation = ({ controls }: { controls: SVGControls }) => {
  const container = useRef<SVGSVGElement>(null);
  const nodesRef = useRef<(SVGCircleElement | null)[]>([]);
  const linesGroupRef = useRef<SVGGElement>(null);

  const numNodes = 40;
  const nodes = useRef(
    Array.from({ length: numNodes }, () => ({
      x: Math.random() * 800,
      y: Math.random() * 500,
      vx: (Math.random() - 0.5) * 1.5,
      vy: (Math.random() - 0.5) * 1.5,
      radius: Math.random() * 3 + 1,
    }))
  );

  const mouse = useRef({ x: 400, y: 250, active: false });

  useGSAP(() => {
    const proxy = { tick: 0 };
    gsap.to(proxy, {
      tick: 1, duration: 1, repeat: -1, ease: "none",
      onUpdate: () => {
        let linesHTML = "";
        const m = mouse.current;

        nodes.current.forEach((n, i) => {
          n.x += n.vx;
          n.y += n.vy;
          if (n.x <= 0 || n.x >= 800) n.vx *= -1;
          if (n.y <= 0 || n.y >= 500) n.vy *= -1;

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

          for (let j = i + 1; j < numNodes; j++) {
            const n2 = nodes.current[j];
            const d = Math.hypot(n.x - n2.x, n.y - n2.y);
            if (d < 100) {
              const op = ((100 - d) / 100) * 0.5;
              linesHTML += `<line x1="${n.x}" y1="${n.y}" x2="${n2.x}" y2="${n2.y}" stroke="${controls.color}" stroke-width="${controls.strokeWidth}" opacity="${op}" />`;
            }
          }

          if (m.active) {
            const dr = Math.hypot(n.x - m.x, n.y - m.y);
            if (dr < 150) {
              const op = ((150 - dr) / 150) * 0.8;
              linesHTML += `<line x1="${n.x}" y1="${n.y}" x2="${m.x}" y2="${m.y}" stroke="${controls.color}" stroke-width="${controls.strokeWidth + 0.5}" stroke-dasharray="4" opacity="${op}" />`;
            }
          }
        });

        if (linesGroupRef.current) linesGroupRef.current.innerHTML = linesHTML;
      },
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
    <svg ref={container} viewBox="0 0 800 500" preserveAspectRatio="xMidYMid slice" className="w-full h-full cursor-crosshair" onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>
      <g ref={linesGroupRef} />
      {nodes.current.map((n, i) => (
        <circle key={i} ref={(el) => { nodesRef.current[i] = el; }} cx={n.x} cy={n.y} r={n.radius} fill={controls.color} opacity={controls.opacity} />
      ))}
    </svg>
  );
};

// ────────────────────────────────────────
// Dynamic code generation
// ────────────────────────────────────────
function generateCode(anim: string, c: SVGControls): string {
  const col = c.color;
  const sw = c.strokeWidth;
  const op = c.opacity;

  switch (anim) {
    case "gooey":
      return `import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") gsap.registerPlugin(useGSAP);

const getSVGPoint = (svg, clientX, clientY) => {
  const pt = svg.createSVGPoint();
  pt.x = clientX; pt.y = clientY;
  return pt.matrixTransform(svg.getScreenCTM().inverse());
};

export default function OrganicGooey() {
  const container = useRef(null);
  const { contextSafe } = useGSAP({ scope: container });
  const numBlobs = 8;

  useGSAP(() => {
    gsap.utils.toArray(".goo-blob").forEach((blob, i) => {
      if (i === 0) return;
      gsap.to(blob, {
        cx: "random(100, 700)", cy: "random(100, 400)",
        duration: "random(4, 7)", ease: "sine.inOut",
        repeat: -1, yoyo: true,
      });
    });
  }, { scope: container });

  const handleMouseMove = (e) => {
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
      <circle key={i} className={i === 0 ? "goo-mouse" : "goo-blob"}
        cx={400} cy={250} r={i === 0 ? 50 : 30 + Math.random() * 40}
        fill="${col}" opacity={i === 0 ? ${op} : ${(op * 0.6).toFixed(2)}} />
    );
  }

  return (
    <svg ref={container} viewBox="0 0 800 500" preserveAspectRatio="xMidYMid slice"
      onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>
      <defs>
        <filter id="goo" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="25" result="blur" />
          <feColorMatrix in="blur" mode="matrix"
            values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 30 -12" result="goo" />
          <feComposite in="SourceGraphic" in2="goo" operator="atop" />
        </filter>
      </defs>
      <g filter="url(#goo)">{blobs}</g>
    </svg>
  );
}`;

    case "directional":
      return `import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") gsap.registerPlugin(useGSAP);

const getSVGPoint = (svg, clientX, clientY) => {
  const pt = svg.createSVGPoint();
  pt.x = clientX; pt.y = clientY;
  return pt.matrixTransform(svg.getScreenCTM().inverse());
};

export default function DirectionalField() {
  const container = useRef(null);
  const { contextSafe } = useGSAP({ scope: container });

  const handleMouseMove = (e) => {
    if (!container.current) return;
    const { x, y } = getSVGPoint(container.current, e.clientX, e.clientY);
    contextSafe(() => {
      gsap.utils.toArray(".dir-arrow").forEach((arrow) => {
        const cx = parseFloat(arrow.getAttribute("data-x") || "0");
        const cy = parseFloat(arrow.getAttribute("data-y") || "0");
        const dx = x - cx, dy = y - cy;
        const angle = Math.atan2(dy, dx) * (180 / Math.PI);
        const dist = Math.hypot(dx, dy);
        const scale = Math.max(0.6, 1.8 - dist / 200);
        const alpha = Math.max(0.15, ${op} - dist / 300);

        gsap.to(arrow, {
          rotation: angle, scale, opacity: alpha,
          duration: 0.3, transformOrigin: "center center",
          ease: "power2.out",
        });
      });
    })();
  };

  const handleMouseLeave = () => {
    contextSafe(() => {
      gsap.to(".dir-arrow", { rotation: 0, scale: 1, opacity: 0.3, duration: 1, ease: "power2.out" });
    })();
  };

  const arrows = [];
  const rows = 12, cols = 20;
  const spacingX = 800 / cols, spacingY = 500 / rows;

  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      const cx = j * spacingX + spacingX / 2;
      const cy = i * spacingY + spacingY / 2;
      arrows.push(
        <g key={\`\${i}-\${j}\`} className="dir-arrow" data-x={cx} data-y={cy}
          style={{ transformOrigin: \`\${cx}px \${cy}px\` }} opacity={0.3}>
          <path d={\`M \${cx-8} \${cy} L \${cx+8} \${cy} M \${cx+3} \${cy-5} L \${cx+8} \${cy} L \${cx+3} \${cy+5}\`}
            stroke="${col}" strokeWidth={${sw}} strokeLinecap="round" fill="none" />
        </g>
      );
    }
  }

  return (
    <svg ref={container} viewBox="0 0 800 500" preserveAspectRatio="xMidYMid slice"
      onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>
      {arrows}
    </svg>
  );
}`;

    case "fluid":
      return `import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") gsap.registerPlugin(useGSAP);

const getSVGPoint = (svg, clientX, clientY) => {
  const pt = svg.createSVGPoint();
  pt.x = clientX; pt.y = clientY;
  return pt.matrixTransform(svg.getScreenCTM().inverse());
};

export default function FluidMesh() {
  const container = useRef(null);
  const pathRef = useRef(null);
  const { contextSafe } = useGSAP({ scope: container });

  const rows = 8, cols = 12;
  const spacingX = 800 / cols, spacingY = 500 / rows;

  const initialPoints = useRef(
    Array.from({ length: rows + 1 }, (_, r) =>
      Array.from({ length: cols + 1 }, (_, c) => ({
        x: c * spacingX, y: r * spacingY,
        ox: c * spacingX, oy: r * spacingY,
      }))
    )
  );

  const generatePath = (points) => {
    let d = "";
    for (let r = 0; r <= rows; r++) {
      d += \`M \${points[r][0].x},\${points[r][0].y} \`;
      for (let c = 1; c <= cols; c++) {
        const prev = points[r][c - 1], curr = points[r][c];
        const midX = (prev.x + curr.x) / 2;
        d += \`Q \${prev.x},\${prev.y} \${midX},\${(prev.y+curr.y)/2} T \${curr.x},\${curr.y} \`;
      }
    }
    for (let c = 0; c <= cols; c++) {
      d += \`M \${points[0][c].x},\${points[0][c].y} \`;
      for (let r = 1; r <= rows; r++) {
        const prev = points[r-1][c], curr = points[r][c];
        const midY = (prev.y + curr.y) / 2;
        d += \`Q \${prev.x},\${prev.y} \${(prev.x+curr.x)/2},\${midY} T \${curr.x},\${curr.y} \`;
      }
    }
    return d;
  };

  const currentPoints = useRef(JSON.parse(JSON.stringify(initialPoints.current)));

  const handleMouseMove = (e) => {
    if (!container.current) return;
    const { x: svgX, y: svgY } = getSVGPoint(container.current, e.clientX, e.clientY);

    contextSafe(() => {
      const newPoints = currentPoints.current.map((row) =>
        row.map((pt) => {
          const dx = svgX - pt.ox, dy = svgY - pt.oy;
          const dist = Math.hypot(dx, dy);
          if (dist < 150) {
            const force = (150 - dist) / 100;
            const angle = Math.atan2(dy, dx);
            return { x: pt.ox - Math.cos(angle) * force * 50, y: pt.oy - Math.sin(angle) * force * 50, ox: pt.ox, oy: pt.oy };
          }
          return { x: pt.ox, y: pt.oy, ox: pt.ox, oy: pt.oy };
        })
      );

      const proxy = { progress: 0 };
      gsap.to(proxy, {
        progress: 1, duration: 0.5, ease: "power2.out",
        onUpdate: () => {
          const p = proxy.progress;
          for (let r = 0; r <= rows; r++)
            for (let c = 0; c <= cols; c++) {
              currentPoints.current[r][c].x += (newPoints[r][c].x - currentPoints.current[r][c].x) * p;
              currentPoints.current[r][c].y += (newPoints[r][c].y - currentPoints.current[r][c].y) * p;
            }
          if (pathRef.current) pathRef.current.setAttribute("d", generatePath(currentPoints.current));
        },
        overwrite: "auto",
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
          for (let r = 0; r <= rows; r++)
            for (let c = 0; c <= cols; c++) {
              currentPoints.current[r][c].x += (currentPoints.current[r][c].ox - currentPoints.current[r][c].x) * p;
              currentPoints.current[r][c].y += (currentPoints.current[r][c].oy - currentPoints.current[r][c].y) * p;
            }
          if (pathRef.current) pathRef.current.setAttribute("d", generatePath(currentPoints.current));
        },
        overwrite: "auto",
      });
    })();
  };

  return (
    <svg ref={container} viewBox="0 0 800 500" preserveAspectRatio="xMidYMid slice"
      onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>
      <path ref={pathRef} d={generatePath(initialPoints.current)}
        stroke="${col}" strokeWidth={${sw}} fill="none" opacity={${op}} />
    </svg>
  );
}`;

    case "topography":
      return `import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") gsap.registerPlugin(useGSAP);

const getSVGPoint = (svg, clientX, clientY) => {
  const pt = svg.createSVGPoint();
  pt.x = clientX; pt.y = clientY;
  return pt.matrixTransform(svg.getScreenCTM().inverse());
};

export default function MagneticTopography() {
  const container = useRef(null);
  const linesRef = useRef([]);
  const { contextSafe } = useGSAP({ scope: container });

  const numLines = 25, segments = 25;
  const targetX = useRef(400);
  const targetY = useRef(250);

  useGSAP(() => {
    const proxy = { time: 0 };
    gsap.to(proxy, {
      time: 1000, duration: 1000, ease: "none", repeat: -1,
      onUpdate: () => {
        linesRef.current.forEach((line, i) => {
          if (!line) return;
          const baseY = 30 + i * (440 / numLines);
          let d = \`M 0,\${baseY} \`;

          for (let j = 1; j <= segments; j++) {
            const baseX = j * (800 / segments);
            const distToMouse = Math.hypot(baseX - targetX.current, baseY - targetY.current);
            const influence = Math.max(0, 200 - distToMouse) / 200;
            const wave = Math.sin(proxy.time * 2 + j * 0.5 + i * 0.2) * 10;
            const pullY = baseY - (Math.sin(influence * Math.PI) * 50) + wave;

            if (j === 1) d += \`L \${baseX},\${pullY} \`;
            else {
              const prevX = (j - 1) * (800 / segments);
              const prevDist = Math.hypot(prevX - targetX.current, baseY - targetY.current);
              const prevInfl = Math.max(0, 200 - prevDist) / 200;
              const prevWave = Math.sin(proxy.time * 2 + (j-1) * 0.5 + i * 0.2) * 10;
              const prevY = baseY - (Math.sin(prevInfl * Math.PI) * 50) + prevWave;
              const midX = (prevX + baseX) / 2;
              d += \`Q \${prevX},\${prevY} \${midX},\${(prevY+pullY)/2} T \${baseX},\${pullY} \`;
            }
          }
          line.setAttribute("d", d);
        });
      },
    });
  }, { scope: container });

  const handleMouseMove = (e) => {
    if (!container.current) return;
    const { x, y } = getSVGPoint(container.current, e.clientX, e.clientY);
    contextSafe(() => {
      gsap.to(targetX, { current: x, duration: 0.8, ease: "power2.out" });
      gsap.to(targetY, { current: y, duration: 0.8, ease: "power2.out" });
    })();
  };

  return (
    <svg ref={container} viewBox="0 0 800 500" preserveAspectRatio="xMidYMid slice"
      onMouseMove={handleMouseMove}>
      <g opacity={${op}}>
        {Array.from({ length: numLines }).map((_, i) => (
          <path key={i} ref={(el) => { linesRef.current[i] = el; }}
            d="" fill="none" stroke="${col}" strokeWidth={${sw}} />
        ))}
      </g>
    </svg>
  );
}`;

    case "quantum":
      return `import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") gsap.registerPlugin(useGSAP);

const getSVGPoint = (svg, clientX, clientY) => {
  const pt = svg.createSVGPoint();
  pt.x = clientX; pt.y = clientY;
  return pt.matrixTransform(svg.getScreenCTM().inverse());
};

export default function QuantumConstellation() {
  const container = useRef(null);
  const nodesRef = useRef([]);
  const linesGroupRef = useRef(null);

  const numNodes = 40;
  const nodes = useRef(
    Array.from({ length: numNodes }, () => ({
      x: Math.random() * 800, y: Math.random() * 500,
      vx: (Math.random() - 0.5) * 1.5, vy: (Math.random() - 0.5) * 1.5,
      radius: Math.random() * 3 + 1,
    }))
  );

  const mouse = useRef({ x: 400, y: 250, active: false });

  useGSAP(() => {
    const proxy = { tick: 0 };
    gsap.to(proxy, {
      tick: 1, duration: 1, repeat: -1, ease: "none",
      onUpdate: () => {
        let linesHTML = "";
        const m = mouse.current;

        nodes.current.forEach((n, i) => {
          n.x += n.vx; n.y += n.vy;
          if (n.x <= 0 || n.x >= 800) n.vx *= -1;
          if (n.y <= 0 || n.y >= 500) n.vy *= -1;

          if (m.active) {
            const dx = n.x - m.x, dy = n.y - m.y;
            const dist = Math.hypot(dx, dy);
            if (dist < 120) {
              const force = (120 - dist) / 120;
              n.x += (dx / dist) * force * 5;
              n.y += (dy / dist) * force * 5;
            }
          }

          if (nodesRef.current[i]) {
            nodesRef.current[i].setAttribute("cx", String(n.x));
            nodesRef.current[i].setAttribute("cy", String(n.y));
          }

          for (let j = i + 1; j < numNodes; j++) {
            const n2 = nodes.current[j];
            const d = Math.hypot(n.x - n2.x, n.y - n2.y);
            if (d < 100) {
              const op = ((100 - d) / 100) * 0.5;
              linesHTML += \`<line x1="\${n.x}" y1="\${n.y}" x2="\${n2.x}" y2="\${n2.y}" stroke="${col}" stroke-width="${sw}" opacity="\${op}" />\`;
            }
          }

          if (m.active) {
            const dr = Math.hypot(n.x - m.x, n.y - m.y);
            if (dr < 150) {
              const op = ((150 - dr) / 150) * 0.8;
              linesHTML += \`<line x1="\${n.x}" y1="\${n.y}" x2="\${m.x}" y2="\${m.y}" stroke="${col}" stroke-width="${sw + 0.5}" stroke-dasharray="4" opacity="\${op}" />\`;
            }
          }
        });

        if (linesGroupRef.current) linesGroupRef.current.innerHTML = linesHTML;
      },
    });
  }, { scope: container });

  const handleMouseMove = (e) => {
    if (!container.current) return;
    const { x, y } = getSVGPoint(container.current, e.clientX, e.clientY);
    mouse.current = { x, y, active: true };
  };

  const handleMouseLeave = () => { mouse.current.active = false; };

  return (
    <svg ref={container} viewBox="0 0 800 500" preserveAspectRatio="xMidYMid slice"
      onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>
      <g ref={linesGroupRef} />
      {nodes.current.map((n, i) => (
        <circle key={i} ref={(el) => { nodesRef.current[i] = el; }}
          cx={n.x} cy={n.y} r={n.radius} fill="${col}" opacity={${op}} />
      ))}
    </svg>
  );
}`;

    default:
      return "";
  }
}

// ────────────────────────────────────────
// Main Page Component
// ────────────────────────────────────────
type AnimType = "gooey" | "directional" | "fluid" | "topography" | "quantum";

const PRESETS = [
  { id: "gooey" as const, label: "Fluid Metaballs" },
  { id: "directional" as const, label: "Directional Field" },
  { id: "fluid" as const, label: "Fluid Mesh Warp" },
  { id: "topography" as const, label: "Magnetic Topography" },
  { id: "quantum" as const, label: "Quantum Constellation" },
];

export default function SvgPage() {
  const previewRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const [activeAnim, setActiveAnim] = useState<AnimType>("gooey");
  const [controls, setControls] = useState<SVGControls>({
    color: "currentColor",
    strokeWidth: 1.5,
    opacity: 0.7,
  });

  const componentMap: Record<AnimType, React.FC<{ controls: SVGControls }>> = {
    gooey: OrganicGooey,
    directional: DirectionalField,
    fluid: FluidMesh,
    topography: MagneticTopography,
    quantum: QuantumConstellation,
  };

  const CurrentComponent = componentMap[activeAnim];
  const currentCode = generateCode(activeAnim, controls);

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(currentCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {}
  }

  const updateControl = <K extends keyof SVGControls>(key: K, value: SVGControls[K]) => {
    setControls((prev) => ({ ...prev, [key]: value }));
  };

  const colorOptions = [
    { value: "currentColor", label: "Theme" },
    { value: "#6366f1", label: "Indigo" },
    { value: "#f43f5e", label: "Rose" },
    { value: "#10b981", label: "Emerald" },
    { value: "#f59e0b", label: "Amber" },
    { value: "#8b5cf6", label: "Violet" },
    { value: "#06b6d4", label: "Cyan" },
  ];

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
            <h2>GSAP SVG Interactive Mechanics</h2>
            <p className="playground-desc">
              Advanced interactive SVG backgrounds with resolution-independent pointer tracking.
              Seamlessly blends into both light and dark themes using CSS variable bindings.
            </p>
          </div>
          <button className="export-btn" onClick={copyCode}>
            {copied ? "Copied!" : "Copy Source"}
          </button>
        </div>

        <div className="preset-row">
          {PRESETS.map((btn) => (
            <button
              key={btn.id}
              className="preset-btn"
              style={{
                background: activeAnim === btn.id ? "var(--text-primary)" : "",
                color: activeAnim === btn.id ? "var(--app-bg)" : "",
              }}
              onClick={() => setActiveAnim(btn.id)}
            >
              {btn.label}
            </button>
          ))}
        </div>

        {/* ── Controls Panel ── */}
        <div
          style={{
            display: "flex",
            gap: "1.5rem",
            alignItems: "center",
            flexWrap: "wrap",
            padding: "0.75rem 1rem",
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
          {/* Color */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span>Color</span>
            <div style={{ display: "flex", gap: "0.25rem" }}>
              {colorOptions.map((opt) => (
                <button
                  key={opt.value}
                  title={opt.label}
                  onClick={() => updateControl("color", opt.value)}
                  style={{
                    width: "20px",
                    height: "20px",
                    borderRadius: "50%",
                    border: controls.color === opt.value ? "2px solid var(--text-primary)" : "1px solid var(--border)",
                    background: opt.value === "currentColor" ? "var(--text-primary)" : opt.value,
                    cursor: "pointer",
                    transition: "transform 0.15s",
                    transform: controls.color === opt.value ? "scale(1.2)" : "scale(1)",
                  }}
                />
              ))}
            </div>
          </div>

          {/* Divider */}
          <div className="inline-separator" />

          {/* Stroke Width */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span>Weight</span>
            <input
              type="range"
              min="0.5"
              max="4"
              step="0.5"
              value={controls.strokeWidth}
              onChange={(e) => updateControl("strokeWidth", parseFloat(e.target.value))}
              style={{ width: "80px", accentColor: "var(--text-primary)" }}
            />
            <span style={{ fontFamily: "var(--font-geist-mono), monospace", minWidth: "1.5rem" }}>{controls.strokeWidth}</span>
          </div>

          {/* Divider */}
          <div className="inline-separator" />

          {/* Opacity */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span>Opacity</span>
            <input
              type="range"
              min="0.1"
              max="1"
              step="0.1"
              value={controls.opacity}
              onChange={(e) => updateControl("opacity", parseFloat(e.target.value))}
              style={{ width: "80px", accentColor: "var(--text-primary)" }}
            />
            <span style={{ fontFamily: "var(--font-geist-mono), monospace", minWidth: "1.5rem" }}>{controls.opacity}</span>
          </div>
        </div>

        <div className="preview-stack">
          <div className="preview-meta">
            <span className="preview-badge">Live Interactive View</span>
            <span>React + GSAP Pointer Tracking</span>
          </div>
          <div ref={previewRef} className="preview svg-preview" style={{ padding: 0, minHeight: "clamp(16rem, 50vw, 28rem)", color: controls.color === "currentColor" ? "var(--text-primary)" : undefined }}>
            <div style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
              <CurrentComponent controls={controls} />
            </div>
            <FullscreenButton targetRef={previewRef} />
          </div>
        </div>

        <div className="code-wrap">
          <div className="code-head">
            <span>React Component Source</span>
            <span>.tsx</span>
          </div>
          <pre className="code-block">{currentCode}</pre>
        </div>
      </div>
    </div>
  );
}
