"use client";

import { useEffect, useRef, useCallback } from "react";

const VERTEX_SHADER = `
attribute vec2 a_position;
void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

const SILK_FRAGMENT = `
precision highp float;

uniform vec2 u_resolution;
uniform float u_time;
uniform float u_speed;
uniform float u_distortion;
uniform float u_swirl;
uniform float u_grainMixer;
uniform float u_grainOverlay;
uniform float u_scale;
uniform float u_rotation;
uniform int u_colorsCount;
uniform vec3 u_colors[8];

#define PI 3.14159265359

vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec2 mod289v2(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec3 permute(vec3 x) { return mod289(((x * 34.0) + 1.0) * x); }

float snoise(vec2 v) {
  const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                      -0.577350269189626, 0.024390243902439);
  vec2 i = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod289v2(i);
  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
  vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
  m = m * m;
  m = m * m;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
  vec3 g;
  g.x = a0.x * x0.x + h.x * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

float hash(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

vec2 rotate2d(vec2 v, float a) {
  float s = sin(a);
  float c = cos(a);
  return vec2(c * v.x - s * v.y, s * v.x + c * v.y);
}

vec3 samplePalette(float t, int count) {
  t = clamp(t, 0.0, 1.0);
  if (count <= 1) return u_colors[0];

  float seg = t * float(count - 1);
  int idx = int(floor(seg));
  float frac_t = fract(seg);
  frac_t = frac_t * frac_t * (3.0 - 2.0 * frac_t);

  vec3 c0 = u_colors[0];
  vec3 c1 = u_colors[0];
  for (int i = 0; i < 8; i++) {
    if (i == idx) c0 = u_colors[i];
    if (i == idx + 1) c1 = u_colors[i];
  }
  return mix(c0, c1, frac_t);
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution;
  uv.y = 1.0 - uv.y;

  float aspect = u_resolution.x / u_resolution.y;
  vec2 p = uv - 0.5;

  float rotRad = u_rotation * PI / 180.0;
  p = rotate2d(p, rotRad);
  p /= max(u_scale, 0.01);
  p.x *= aspect;

  float t = u_time * u_speed * 0.15;

  float n1 = snoise(p * 0.35 + vec2(0.0, t * 0.06));
  float n2 = snoise(p * 0.3 + vec2(4.7, -t * 0.05));

  vec2 warp = vec2(n1, n2) * (0.4 + 0.8 * u_distortion);
  vec2 wp = p + warp;

  float swirlAngle = snoise(wp * 0.25 + t * 0.03) * u_swirl * PI * 0.5;
  wp = rotate2d(wp, swirlAngle);

  float field = snoise(wp * 0.4 + vec2(t * 0.04, -t * 0.03));
  float field2 = snoise(wp * 0.28 + vec2(-t * 0.035, t * 0.025) + vec2(10.0));
  float combined = field * 0.6 + field2 * 0.4;

  float h = combined * 0.5 + 0.5;

  float eps = 0.005;
  float hxA = snoise((wp + vec2(eps, 0.0)) * 0.4 + vec2(t * 0.04, -t * 0.03));
  float hxB = snoise((wp + vec2(eps, 0.0)) * 0.28 + vec2(-t * 0.035, t * 0.025) + vec2(10.0));
  float hyA = snoise((wp + vec2(0.0, eps)) * 0.4 + vec2(t * 0.04, -t * 0.03));
  float hyB = snoise((wp + vec2(0.0, eps)) * 0.28 + vec2(-t * 0.035, t * 0.025) + vec2(10.0));

  float hx = (hxA * 0.6 + hxB * 0.4) - (field * 0.6 + field2 * 0.4);
  float hy = (hyA * 0.6 + hyB * 0.4) - (field * 0.6 + field2 * 0.4);

  vec3 normal = normalize(vec3(-hx * 4.0, -hy * 4.0, eps));

  vec3 lightDir = normalize(vec3(0.3, -0.4, 0.8));
  vec3 viewDir = vec3(0.0, 0.0, 1.0);
  vec3 halfDir = normalize(lightDir + viewDir);

  float diff = max(dot(normal, lightDir), 0.0);
  float spec = pow(max(dot(normal, halfDir), 0.0), 40.0);
  float fresnel = pow(1.0 - max(dot(normal, viewDir), 0.0), 4.0) * 0.12;

  vec3 baseColor = samplePalette(h, u_colorsCount);

  vec3 lit = baseColor * (0.55 + diff * 0.45);
  lit += spec * 0.12;
  lit += fresnel * 0.5;

  float grainNoise = hash(gl_FragCoord.xy + fract(u_time) * 160.0);
  lit = mix(lit, vec3(grainNoise), u_grainMixer * 0.15);
  lit += (grainNoise - 0.5) * u_grainOverlay * 0.06;

  lit = clamp(lit, 0.0, 1.0);
  gl_FragColor = vec4(lit, 1.0);
}
`;

export type ShaderUniforms = {
  speed: number;
  distortion: number;
  swirl: number;
  grainMixer: number;
  grainOverlay: number;
  scale: number;
  rotation: number;
  colors: string[];
};

type UniformLocations = {
  resolution: WebGLUniformLocation | null;
  time: WebGLUniformLocation | null;
  speed: WebGLUniformLocation | null;
  distortion: WebGLUniformLocation | null;
  swirl: WebGLUniformLocation | null;
  grainMixer: WebGLUniformLocation | null;
  grainOverlay: WebGLUniformLocation | null;
  scale: WebGLUniformLocation | null;
  rotation: WebGLUniformLocation | null;
  colorsCount: WebGLUniformLocation | null;
  colors: WebGLUniformLocation | null;
};

type GLResources = {
  buffer: WebGLBuffer;
  program: WebGLProgram;
  uniforms: UniformLocations;
};

function hexToVec3(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  return [
    parseInt(h.substring(0, 2), 16) / 255,
    parseInt(h.substring(2, 4), 16) / 255,
    parseInt(h.substring(4, 6), 16) / 255,
  ];
}

function createShader(gl: WebGLRenderingContext, type: number, source: string): WebGLShader | null {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error(gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

function createProgram(gl: WebGLRenderingContext, vs: WebGLShader, fs: WebGLShader): WebGLProgram | null {
  const program = gl.createProgram();
  if (!program) return null;
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error(gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
    return null;
  }
  return program;
}

export default function ShaderCanvas({
  uniforms,
  className,
  style,
}: {
  uniforms: ShaderUniforms;
  className?: string;
  style?: React.CSSProperties;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const glRef = useRef<WebGLRenderingContext | null>(null);
  const resourcesRef = useRef<GLResources | null>(null);
  const rafRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);
  const uniformsRef = useRef(uniforms);
  uniformsRef.current = uniforms;

  const initGL = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl", { antialias: true, alpha: false });
    if (!gl) return;
    glRef.current = gl;

    const vs = createShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER);
    const fs = createShader(gl, gl.FRAGMENT_SHADER, SILK_FRAGMENT);
    if (!vs || !fs) {
      if (vs) gl.deleteShader(vs);
      if (fs) gl.deleteShader(fs);
      return;
    }

    const program = createProgram(gl, vs, fs);
    gl.deleteShader(vs);
    gl.deleteShader(fs);
    if (!program) return;

    const buffer = gl.createBuffer();
    if (!buffer) {
      gl.deleteProgram(program);
      return;
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);

    const posLoc = gl.getAttribLocation(program, "a_position");
    gl.useProgram(program);
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);
    gl.disable(gl.DEPTH_TEST);

    resourcesRef.current = {
      buffer,
      program,
      uniforms: {
        resolution: gl.getUniformLocation(program, "u_resolution"),
        time: gl.getUniformLocation(program, "u_time"),
        speed: gl.getUniformLocation(program, "u_speed"),
        distortion: gl.getUniformLocation(program, "u_distortion"),
        swirl: gl.getUniformLocation(program, "u_swirl"),
        grainMixer: gl.getUniformLocation(program, "u_grainMixer"),
        grainOverlay: gl.getUniformLocation(program, "u_grainOverlay"),
        scale: gl.getUniformLocation(program, "u_scale"),
        rotation: gl.getUniformLocation(program, "u_rotation"),
        colorsCount: gl.getUniformLocation(program, "u_colorsCount"),
        colors: gl.getUniformLocation(program, "u_colors"),
      },
    };

    startTimeRef.current = performance.now();
  }, []);

  const cleanupGL = useCallback(() => {
    const gl = glRef.current;
    const resources = resourcesRef.current;
    if (!gl || !resources) return;

    gl.deleteBuffer(resources.buffer);
    gl.deleteProgram(resources.program);
    resourcesRef.current = null;
    glRef.current = null;
  }, []);

  const render = useCallback(() => {
    const gl = glRef.current;
    const resources = resourcesRef.current;
    const canvas = canvasRef.current;
    if (!gl || !resources || !canvas) return;

    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const w = Math.max(1, Math.round(rect.width * dpr));
    const h = Math.max(1, Math.round(rect.height * dpr));

    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }

    gl.viewport(0, 0, w, h);
    gl.useProgram(resources.program);

    const u = uniformsRef.current;
    const time = (performance.now() - startTimeRef.current) / 1000;
    const count = Math.min(8, u.colors.length);

    if (resources.uniforms.resolution) gl.uniform2f(resources.uniforms.resolution, w, h);
    if (resources.uniforms.time) gl.uniform1f(resources.uniforms.time, time);
    if (resources.uniforms.speed) gl.uniform1f(resources.uniforms.speed, u.speed);
    if (resources.uniforms.distortion) gl.uniform1f(resources.uniforms.distortion, u.distortion);
    if (resources.uniforms.swirl) gl.uniform1f(resources.uniforms.swirl, u.swirl);
    if (resources.uniforms.grainMixer) gl.uniform1f(resources.uniforms.grainMixer, u.grainMixer);
    if (resources.uniforms.grainOverlay) gl.uniform1f(resources.uniforms.grainOverlay, u.grainOverlay);
    if (resources.uniforms.scale) gl.uniform1f(resources.uniforms.scale, u.scale);
    if (resources.uniforms.rotation) gl.uniform1f(resources.uniforms.rotation, u.rotation);
    if (resources.uniforms.colorsCount) gl.uniform1i(resources.uniforms.colorsCount, count);

    const colorData = new Float32Array(24);
    u.colors.forEach((hex, i) => {
      if (i >= 8) return;
      const [r, g, b] = hexToVec3(hex);
      colorData[i * 3] = r;
      colorData[i * 3 + 1] = g;
      colorData[i * 3 + 2] = b;
    });
    if (resources.uniforms.colors) gl.uniform3fv(resources.uniforms.colors, colorData);

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    rafRef.current = requestAnimationFrame(render);
  }, []);

  useEffect(() => {
    initGL();
    rafRef.current = requestAnimationFrame(render);
    return () => {
      cancelAnimationFrame(rafRef.current);
      cleanupGL();
    };
  }, [cleanupGL, initGL, render]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ width: "100%", height: "100%", display: "block", ...style }}
    />
  );
}
