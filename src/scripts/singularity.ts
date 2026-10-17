// Green black hole behind the hero, adapted from XorDev's "Singularity"
// (https://www.shadertoy.com/view/3csSWB), licensed CC BY-NC-SA 3.0
// (https://creativecommons.org/licenses/by-nc-sa/3.0/). Falls back to the CSS
// glow when WebGL is unavailable, and freezes on one frame when motion is paused.
const canvas = document.querySelector<HTMLCanvasElement>("#singularity");
const gl = canvas?.getContext("webgl", {
  alpha: true,
  antialias: false,
  premultipliedAlpha: true,
  powerPreference: "low-power",
});

const vertex = `
attribute vec2 position;
void main() { gl_Position = vec4(position, 0.0, 1.0); }
`;

const fragment = `
precision highp float;
uniform vec2 resolution;
uniform float time;
uniform vec2 center;
uniform float unit;

void main() {
  float i = 0.2;
  vec2 p = (gl_FragCoord.xy - center) / unit;
  vec2 d = vec2(-1.0, 1.0);
  vec2 b = p - i * d;
  // Tilt the disc and bend coordinates around the event horizon.
  vec2 c = p * mat2(1.0, 1.0, d / (0.1 + i / dot(b, b)));
  float a = dot(c, c);
  // Logarithmic spiral coordinates for the swirling accretion flow.
  vec2 v = c * mat2(cos(0.5 * log(a) + time * i + vec4(0.0, 33.0, 11.0, 0.0))) / i;
  vec2 w = vec2(0.0);
  for (int n = 0; n < 8; n++) {
    i += 1.0;
    v += 0.7 * sin(v.yx * i + time) / i + 0.5;
    w += 1.0 + sin(v);
  }
  float disc = length(sin(v / 0.3) * 0.4 + c * (3.0 + d));
  // The original red/blue gradient, shifted into the AppKade greens.
  vec3 tint = exp(c.x * 0.4) * vec3(0.22, 1.0, 0.55)
    + exp(-c.x * 0.7) * vec3(0.16, 0.55, 0.48);
  vec3 color = 1.0 - exp(-tint
    / w.xyy
    / (2.0 + disc * disc / 4.0 - disc)
    / (0.5 + 1.0 / a)
    / (0.03 + abs(length(p) - 0.7)));
  float glow = max(max(color.r, color.g), color.b);
  gl_FragColor = vec4(color, glow);
}
`;

function compile(type: number, source: string) {
  const shader = gl!.createShader(type)!;
  gl!.shaderSource(shader, source);
  gl!.compileShader(shader);
  return shader;
}

function setup() {
  if (!canvas || !gl) return;
  const program = gl.createProgram()!;
  gl.attachShader(program, compile(gl.VERTEX_SHADER, vertex));
  gl.attachShader(program, compile(gl.FRAGMENT_SHADER, fragment));
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;
  gl.useProgram(program);

  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([-1, -1, 3, -1, -1, 3]),
    gl.STATIC_DRAW,
  );
  const position = gl.getAttribLocation(program, "position");
  gl.enableVertexAttribArray(position);
  gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

  const uniforms = {
    resolution: gl.getUniformLocation(program, "resolution"),
    time: gl.getUniformLocation(program, "time"),
    center: gl.getUniformLocation(program, "center"),
    unit: gl.getUniformLocation(program, "unit"),
  };
  let frame = 0;
  let previous = 0;
  let elapsed = 0;
  let visible = true;
  let ratio = 1;

  const paused = () => document.documentElement.dataset.motion === "off";

  function draw() {
    gl!.viewport(0, 0, canvas!.width, canvas!.height);
    gl!.uniform2f(uniforms.resolution, canvas!.width, canvas!.height);
    gl!.uniform1f(uniforms.time, elapsed);
    // Size and position come from .hero-singularity in open.css so the
    // shader and its CSS fade mask always agree.
    const style = getComputedStyle(canvas!);
    const radius = parseFloat(style.getPropertyValue("--radius")) * ratio;
    const lift = parseFloat(style.getPropertyValue("--lift")) * ratio;
    gl!.uniform2f(uniforms.center, canvas!.width / 2, lift);
    gl!.uniform1f(uniforms.unit, radius / 0.7);
    gl!.drawArrays(gl!.TRIANGLES, 0, 3);
  }
  function tick(now: number) {
    frame = 0;
    elapsed += previous ? Math.min((now - previous) / 1000, 0.05) : 0;
    previous = now;
    draw();
    frame = requestAnimationFrame(tick);
  }
  function sync() {
    cancelAnimationFrame(frame);
    frame = 0;
    previous = 0;
    draw();
    if (!paused() && visible && !document.hidden)
      frame = requestAnimationFrame(tick);
  }
  function resize() {
    // The shader is soft, so a reduced backing store keeps it cheap on phones.
    ratio = Math.min(devicePixelRatio || 1, 1.5) * 0.75;
    canvas!.width = Math.round(canvas!.clientWidth * ratio);
    canvas!.height = Math.round(canvas!.clientHeight * ratio);
    draw();
  }

  new ResizeObserver(resize).observe(canvas);
  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    sync();
  }).observe(canvas);
  new MutationObserver(sync).observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-motion"],
  });
  document.addEventListener("visibilitychange", sync);
  canvas.dataset.ready = "";
  resize();
  sync();
}

setup();

export {};
