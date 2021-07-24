// https://observablehq.com/@vezwork/webgl2-shader@434
export default function define(runtime, observer) {
  const main = runtime.module();
  main.variable(observer()).define(["md"], function(md){return(
md`# WebGL2 Shader

This notebook provides a little helper for fragment shaders. 

It is a fork of [@mbostock's \`shader\` function](https://observablehq.com/@mbostock/shader). It adds WebGL2 and \`iMouse\` functionality! It is heavily inspired by Inigo Quilez’s [Shadertoy](https://www.shadertoy.com). I referenced the [WebGL2 Fundamentals Shadertoy Tutorial](https://webgl2fundamentals.org/webgl/lessons/webgl-shadertoy.html) while making this. 

To import into your notebook:
~~~js
import {shader} from "@vezwork/webgl2-shader"
~~~

## Examples`
)});
  main.variable(observer()).define(["shader"], function(shader){return(
shader({ width: 640, height: 200 })`
  void mainImage( out vec4 fragColor, in vec2 fragCoord ) {
      // Normalized pixel coordinates (from 0 to 1)
      vec2 uv = fragCoord/iResolution.xy;
  
      // varying pixel color
      vec3 col = 0.5 + 0.5*cos(uv.xyx+vec3(0,2,4));
  
      // Output to screen
      fragColor = vec4(col,1.0);
  }
`
)});
  main.variable(observer()).define(["shader"], function(shader){return(
shader({width: 640, height: 100})`
const float size = 25.0;

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 p = fragCoord.xy;
  float k = float(mod(p.x, size * 2.0) < size == mod(p.y, size * 2.0) < size);
  fragColor = vec4(vec3(k), 1.0);
}`
)});
  main.variable(observer()).define(["md"], function(md){return(
md`If *width* is not specified, it defaults to 640. If *height* is not specified, it defaults to 480. A *devicePixelRatio* option may also be specified; it defaults to the native value. Shaders can reference the const vec3 iResolution for the canvas dimensions; *z* stores the devicePixelRatio.`
)});
  main.variable(observer()).define(["md"], function(md){return(
md`The *iTime* option enables time-dependent shaders with the same behavior as on Shadertoy: it defines a uniform float iTime whose value is in seconds. If you also pass in the *visibility* option using Observable’s built-in [visibility function](/@observablehq/awaiting-visibility), Shader will only render when the canvas is visible.`
)});
  main.variable(observer()).define(["shader","visibility"], function(shader,visibility){return(
shader({ width: 640, height: 100, iTime: true, visibility })`
  void mainImage( out vec4 fragColor, in vec2 fragCoord ) {
      // Normalized pixel coordinates (from 0 to 1)
      vec2 uv = fragCoord/iResolution.xy;
  
      // Time varying pixel color
      vec3 col = 0.5 + 0.5*cos(iTime+uv.xyx+vec3(0,2,4));
  
      // Output to screen
      fragColor = vec4(col,1.0);
  }
`
)});
  main.variable(observer()).define(["md"], function(md){return(
md`The *iMouse* option enables mouse-dependent shaders with the same behavior as on Shadertoy: it defines a \`uniform vec4 iMouse\` whose value is \`vec4(mouseX, mouseY, isLeftMouseDown, isRightMouseDown)\`.`
)});
  main.variable(observer()).define(["shader"], function(shader){return(
shader({ height: 100, iMouse: true })`
  void mainImage( out vec4 fragColor, in vec2 fragCoord ) {
      if (distance(fragCoord, iMouse.xy) < 50.) {
        fragColor = vec4(1.,0.,0.,1.);

        // Left Click
      } else if (iMouse.z == 1.) { 
        fragColor = vec4(1.,1.,.2,1.);

        // Right Click
      } else if (iMouse.w == 1.) {
        fragColor = vec4(1.,.2,1.,1.);

      } else {
        fragColor = vec4(0.1,0.1,0.1,1.);
      }
  }
`
)});
  main.variable(observer()).define(["md"], function(md){return(
md`More generally, the *uniforms* option allows you to declare uniforms. These can then by updated programmatically by calling *canvas*.update. Currently only float uniforms are supported.`
)});
  main.variable(observer("canvas")).define("canvas", ["shader"], function(shader){return(
shader({height: 100, uniforms: {angle: "float"}})`
const float size = 25.0;

mat2 rotate2d(float a) {
  return mat2(cos(a), -sin(a), sin(a), cos(a));
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 p = (fragCoord.xy - iResolution.xy / 2.0) * rotate2d(angle);
  float k = float(mod(p.x, size * 2.0) < size == mod(p.y, size * 2.0) < size);
  fragColor = vec4(vec3(k), 1.0);
}`
)});
  main.variable(observer()).define(["canvas","now"], function(canvas,now){return(
canvas.update({angle: now / 10000.0 % (2 * Math.PI)})
)});
  main.variable(observer()).define(["md"], function(md){return(
md`If you pass an *inputs* object, the shader can reference uniforms whose value corresponds to the input’s value. If a corresponding uniform is not declared, it is assumed to be a float.`
)});
  main.variable(observer("viewof angle")).define("viewof angle", ["Inputs"], function(Inputs){return(
Inputs.range([-Math.PI, Math.PI], {label: "angle"})
)});
  main.variable(observer("angle")).define("angle", ["Generators", "viewof angle"], (G, _) => G.input(_));
  main.variable(observer("viewof size")).define("viewof size", ["Inputs"], function(Inputs){return(
Inputs.range([10, 100], {value: 25, transform: Math.log, label: "size"})
)});
  main.variable(observer("size")).define("size", ["Generators", "viewof size"], (G, _) => G.input(_));
  main.variable(observer()).define(["shader","viewof angle","viewof size"], function(shader,$0,$1){return(
shader({height: 100, inputs: {angle: $0, size: $1}})`

mat2 rotate2d(float a) {
  return mat2(cos(a), -sin(a), sin(a), cos(a));
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 p = (fragCoord.xy - iResolution.xy / 2.0) * rotate2d(angle);
  float k = float(mod(p.x, size * 2.0) < size == mod(p.y, size * 2.0) < size);
  fragColor = vec4(vec3(k), 1.0);
}`
)});
  main.variable(observer()).define(["md"], function(md){return(
md`---

## Implementation`
)});
  main.variable(observer("shader")).define("shader", ["DOM","createShader","createProgram","invalidation","Inputs"], function(DOM,createShader,createProgram,invalidation,Inputs){return(
function shader({
  width = 640,
  height = 480,
  devicePixelRatio = window.devicePixelRatio,
  preserveDrawingBuffer = false,
  visibility, // if present, only draw when resolves
  inputs = {}, // bind inputs to uniforms
  iTime,
  iMouse,
  sources = [],
  uniforms = {}
}) {
  uniforms = new Map(
    Object.entries(uniforms).map(([name, type]) => [name, { type }])
  );
  for (const { type } of uniforms.values())
    if (type !== "float") throw new Error(`unknown type: ${type}`);
  if (iTime && !uniforms.has("iTime")) uniforms.set("iTime", { type: "float" });
  if (iMouse && !uniforms.has("iMouse"))
    uniforms.set("iMouse", { type: "vec4" });

  inputs = new Map(Object.entries(inputs));
  for (const name of inputs.keys())
    if (!uniforms.has(name)) uniforms.set(name, { type: "float" });

  return (strings) => {
    const source = strings[0]; // TODO make this actually good
    const canvas = DOM.canvas(
      width * devicePixelRatio,
      height * devicePixelRatio
    );
    const gl = canvas.getContext("webgl2", { preserveDrawingBuffer });
    canvas.style = `max-width: 100%; width: ${width}px; height: auto;`;

    const fragmentShader = createShader(
      gl,
      gl.FRAGMENT_SHADER,
      `#version 300 es
precision highp float;

${Array.from(uniforms, ([name, { type }]) => `uniform ${type} ${name};`).join(
  "\n"
)}
 
const vec3 iResolution = vec3(
  ${(width * devicePixelRatio).toFixed(1)}, 
  ${(height * devicePixelRatio).toFixed(1)}, 
  ${devicePixelRatio.toFixed(1)}
);`,
      ...sources,
      source,
      `
out vec4 fragColor;
void main() {
  mainImage(fragColor, gl_FragCoord.xy);
}`
    );

    const vertexShader = createShader(
      gl,
      gl.VERTEX_SHADER,
      `#version 300 es
in vec4 a_position;
void main() {
  gl_Position = a_position;
}`
    );

    const program = createProgram(gl, vertexShader, fragmentShader);
    const positionAttributeLocation = gl.getAttribLocation(
      program,
      "a_position"
    );
    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);
    for (const [name, u] of uniforms)
      u.location = gl.getUniformLocation(program, name);
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW
    );
    gl.enableVertexAttribArray(positionAttributeLocation);
    gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.useProgram(program);
    gl.bindVertexArray(vao);

    async function render() {
      if (visibility !== undefined) await visibility();
      frame = undefined;
      gl.drawArrays(gl.TRIANGLES, 0, 6);
    }

    const ondispose =
      invalidation === undefined ? Inputs.disposal(canvas) : invalidation;
    let disposed = false;
    ondispose.then(() => (disposed = true));

    Object.assign(canvas, {
      update(values = {}) {
        if (disposed) return false;
        for (const name in values) {
          const u = uniforms.get(name);
          if (!u) throw new Error(`unknown uniform: ${name}`);
          gl.uniform1f(u.location, values[name]);
        }
        frame || requestAnimationFrame(render);
        return true;
      }
    });

    for (const [name, input] of inputs) {
      const u = uniforms.get(name);
      if (!u) throw new Error(`unknown uniform: ${name}`);
      gl.uniform1f(u.location, input.value);
      const update = () => {
        gl.uniform1f(u.location, input.value);
        frame || requestAnimationFrame(render);
      };
      input.addEventListener("input", update);
      ondispose.then(() => input.removeEventListener("input", update));
    }

    let u_mouse;
    let mouse = [0, 0];
    let leftDown = 0;
    let rightDown = 0;
    if (iMouse) {
      document.body.addEventListener("mousedown", (e) => {
        if (e.button === 0) {
          leftDown = 1;
        } else if (e.button === 2) {
          rightDown = 1;
        }
        gl.uniform4f(u_mouse, ...mouse, leftDown, rightDown);
        render();
      });
      document.body.addEventListener("mouseup", (e) => {
        if (e.button === 0) {
          leftDown = 0;
        } else if (e.button === 2) {
          rightDown = 0;
        }
        gl.uniform4f(u_mouse, ...mouse, leftDown, rightDown);
        render();
      });
      canvas.addEventListener("mousemove", (e) => {
        mouse = [
          e.offsetX * devicePixelRatio,
          height * devicePixelRatio - e.offsetY * devicePixelRatio
        ];
        gl.uniform4f(u_mouse, ...mouse, leftDown, rightDown);
        render();
      });

      u_mouse = gl.getUniformLocation(program, "iMouse");
      gl.uniform4f(u_mouse, ...mouse, leftDown, rightDown);
    }

    let frame;
    if (iTime) {
      frame = true; // always rendering
      const u_time = gl.getUniformLocation(program, "iTime");
      let timeframe;
      (async function tick() {
        if (visibility !== undefined) await visibility();
        gl.uniform1f(u_time, performance.now() / 1000);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
        return (timeframe = requestAnimationFrame(tick));
      })();
      ondispose.then(() => cancelAnimationFrame(timeframe));
    } else {
      gl.drawArrays(gl.TRIANGLES, 0, 6);
    }
    return canvas;
  };
}
)});
  main.variable(observer("createShader")).define("createShader", function(){return(
function createShader(gl, type, ...sources) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, sources.join("\n"));
  gl.compileShader(shader);
  if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) return shader;
  throw new Error(gl.getShaderInfoLog(shader));
}
)});
  main.variable(observer("createProgram")).define("createProgram", function(){return(
function createProgram(gl, ...shaders) {
  const program = gl.createProgram();
  for (const shader of shaders) gl.attachShader(program, shader);
  gl.linkProgram(program);
  if (gl.getProgramParameter(program, gl.LINK_STATUS)) return program;
  throw new Error(gl.getProgramInfoLog(program));
}
)});
  return main;
}
