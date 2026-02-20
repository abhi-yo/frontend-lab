const fs = require('fs');
const file = './app/svg/page.tsx';
let content = fs.readFileSync(file, 'utf8');

const replacementComponent = `// ----------------------------------------
// 1. Organic Metaballs (Gooey Fluid)
// ----------------------------------------
const OrganicGooey = () => {
  const container = useRef<SVGSVGElement>(null);
  const { contextSafe } = useGSAP({ scope: container });

  const numBlobs = 6;
  
  useGSAP(() => {
    gsap.utils.toArray<SVGCircleElement>(".goo-blob").forEach((blob, i) => {
      if (i === 0) return;
      gsap.to(blob, {
        cx: "random(60, 240)",
        cy: "random(60, 240)",
        duration: "random(3, 5)",
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true
      });
    });
  }, { scope: container });

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!container.current) return;
    const rect = container.current.getBoundingClientRect();
    const svgX = (e.clientX - rect.left) * (300 / rect.width);
    const svgY = (e.clientY - rect.top) * (300 / rect.height);
    
    contextSafe(() => {
      gsap.to(".goo-mouse", {
        cx: svgX,
        cy: svgY,
        duration: 0.6,
        ease: "power2.out"
      });
    })();
  };

  const handleMouseLeave = () => {
    contextSafe(() => {
      gsap.to(".goo-mouse", {
        cx: 150,
        cy: 150,
        duration: 1.5,
        ease: "elastic.out(1, 0.4)"
      });
    })();
  };

  const blobs = [];
  for (let i = 0; i < numBlobs; i++) {
    blobs.push(
      <circle
        key={i}
        className={i === 0 ? "goo-mouse" : "goo-blob"}
        cx={150}
        cy={150}
        r={i === 0 ? 35 : 25 + Math.random() * 20}
        fill="currentColor"
        opacity={i === 0 ? 1 : 0.4}
      />
    );
  }

  return (
    <svg
      ref={container}
      viewBox="0 0 300 300"
      className="w-full h-full cursor-crosshair"
      style={{ color: "var(--text-primary)" }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <defs>
        <filter id="goo" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="15" result="blur" />
          <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 25 -10" result="goo" />
          <feComposite in="SourceGraphic" in2="goo" operator="atop" />
        </filter>
      </defs>
      <rect width="300" height="300" fill="transparent" />
      <g filter="url(#goo)">
        {blobs}
      </g>
    </svg>
  );
};

const organicGooeyCode = \`import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(useGSAP);
}

export default function OrganicGooey() {
  const container = useRef<SVGSVGElement>(null);
  const { contextSafe } = useGSAP({ scope: container });

  const numBlobs = 6;
  
  useGSAP(() => {
    gsap.utils.toArray<SVGCircleElement>(".goo-blob").forEach((blob, i) => {
      if (i === 0) return;
      gsap.to(blob, {
        cx: "random(60, 240)", cy: "random(60, 240)",
        duration: "random(3, 5)", ease: "sine.inOut",
        repeat: -1, yoyo: true
      });
    });
  }, { scope: container });

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!container.current) return;
    const rect = container.current.getBoundingClientRect();
    const svgX = (e.clientX - rect.left) * (300 / rect.width);
    const svgY = (e.clientY - rect.top) * (300 / rect.height);
    
    contextSafe(() => {
      gsap.to(".goo-mouse", { cx: svgX, cy: svgY, duration: 0.6, ease: "power2.out" });
    })();
  };

  const handleMouseLeave = () => {
    contextSafe(() => {
      gsap.to(".goo-mouse", { cx: 150, cy: 150, duration: 1.5, ease: "elastic.out(1, 0.4)" });
    })();
  };

  const blobs = [];
  for (let i = 0; i < numBlobs; i++) {
    blobs.push(
      <circle key={i} className={i === 0 ? "goo-mouse" : "goo-blob"} cx={150} cy={150} r={i === 0 ? 35 : 25 + Math.random() * 20} fill="currentColor" opacity={i === 0 ? 1 : 0.4} />
    );
  }

  return (
    <svg ref={container} viewBox="0 0 300 300" className="w-full h-full cursor-crosshair" style={{ color: "var(--text-primary)" }} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>
      <defs>
        <filter id="goo" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="15" result="blur" />
          <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 25 -10" result="goo" />
          <feComposite in="SourceGraphic" in2="goo" operator="atop" />
        </filter>
      </defs>
      <rect width="300" height="300" fill="transparent" />
      <g filter="url(#goo)">{blobs}</g>
    </svg>
  );
}\`;`;

// Regex replacement to swap GeometricTrace with OrganicGooey
const blockRegex = /\/\/ ----------------------------------------\n\/\/ 1\. Geometric Trace \(Interactive Nodes\)\n\/\/ ----------------------------------------\nconst GeometricTrace = \(\) => {[\s\S]*?const geometricTraceCode\s*=\s*`[\s\S]*?`;/m;
content = content.replace(blockRegex, replacementComponent);

content = content.replace(/type AnimType = "geometric" \| "directional" \| "fluid";/, 'type AnimType = "gooey" | "directional" | "fluid";');
content = content.replace(/const \[activeAnim, setActiveAnim\] = useState<AnimType>\("geometric"\);/, 'const [activeAnim, setActiveAnim] = useState<AnimType>("gooey");');
content = content.replace(/let CurrentComponent = GeometricTrace;/, 'let CurrentComponent = OrganicGooey;');
content = content.replace(/let currentCode = geometricTraceCode;/, 'let currentCode = organicGooeyCode;');

content = content.replace(/activeAnim === "geometric"/g, 'activeAnim === "gooey"');
content = content.replace(/setActiveAnim\("geometric"\)/, 'setActiveAnim("gooey")');
content = content.replace(/>\s*Geometric Trace\s*<\/button>/, '> Fluid Metaballs </button>');

fs.writeFileSync(file, content);
console.log("Replaced successfully");
