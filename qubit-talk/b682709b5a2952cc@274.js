import define1 from "./775e213587625426@434.js";

export default function define(runtime, observer) {
  const main = runtime.module();
  main.variable(observer()).define(["shader"], function(shader){return(
shader({ height: 340, width: 340, iTime: true })`/**
 * SDFs and Raymarching:
 * https://iquilezles.org/www/index.htm
 * https://iquilezles.org/www/articles/distfunctions/distfunctions.htm
 * http://jamie-wong.com/2016/07/15/ray-marching-signed-distance-functions/
 *
 * Volume rendering:
 * https://www.willusher.io/webgl/2019/01/13/volume-rendering-with-webgl
 */

// source: https://en.wikipedia.org/wiki/Partial_trace#/media/File:Partial_Trace.svg
mat2 partialTrace(mat4 mat) {
  return mat2(
      vec2(mat[0][0] + mat[1][1], mat[2][0] + mat[3][1]),
      vec2(mat[0][2] + mat[1][3], mat[2][2] + mat[3][3])
  );
}

float trace(mat2 mat) {
    return mat[0][0] + mat[1][1];
}

// source: https://www.shadertoy.com/view/NsSXRm            
#define bary4(p, a, b, c, d) vec4(p, 1) * inverse(transpose(mat4(a, 1, b, 1, c, 1, d, 1)))

const int MAX_MARCHING_STEPS = 255;
const float MIN_DIST = 0.0;
const float MAX_DIST = 100.0;
const float EPSILON = 0.0001;
const float VOLUME_MARCH_STEP = 0.004;

/**
 * Signed distance function for a sphere centered at the origin with radius 1.0;
 */
float sphereSDF(vec3 samplePoint) {
    return length(samplePoint) - 1.0;
}

mat4 rotateZ(float theta) {
    float c = cos(theta);
    float s = sin(theta);

    return mat4(
        vec4(c, s, 0, 0),
        vec4(-s, c, 0, 0),
        vec4(0, 0, 1, 0),
        vec4(0, 0, 0, 1)
    );
}

mat4 rotateY(float theta) {
    float c = cos(theta);
    float s = sin(theta);

    return mat4(
        vec4(c, 0, s, 0),
        vec4(0, 1, 0, 0),
        vec4(-s, 0, c, 0),
        vec4(0, 0, 0, 1)
    );
}

/* source: https://github.com/fogleman/sdf/blob/2a17d2fe0332ce5c2e554469fcd9cf1a525a70b3/sdf/d3.py#L286 */
float tetrahedron(vec3 p, float r) 
{
    return (max(abs(p.x + p.y) - p.z, abs(p.x - p.y) + p.z) - r) / sqrt(3.0);
}

float pyramidSDF( vec3 p, float h)
{
  float m2 = h*h + 0.25;
    
  p.xz = abs(p.xz);
  p.xz = (p.z>p.x) ? p.zx : p.xz;
  p.xz -= 0.5;

  vec3 q = vec3( p.z, h*p.y - 0.5*p.x, h*p.x + 0.5*p.y);
   
  float s = max(-q.x,0.0);
  float t = clamp( (q.y-0.5*p.z)/(m2+0.25), 0.0, 1.0 );
    
  float a = m2*(q.x+s)*(q.x+s) + q.y*q.y;
  float b = m2*(q.x+0.5*t)*(q.x+0.5*t) + (q.y-m2*t)*(q.y-m2*t);
    
  float d2 = min(q.y,-q.x*m2-q.y*0.5) > 0.0 ? 0.0 : min(a,b);
    
  return sqrt( (d2+q.z*q.z)/m2 ) * sign(max(q.z,-p.y));
}

/**
 * Signed distance function describing the scene.
 * 
 * Absolute value of the return value indicates the distance to the surface.
 * Sign indicates whether the point is inside or outside the surface,
 * negative indicating inside.
 */
float sceneSDF(vec3 samplePoint) {
    vec3 p = (rotateY(iTime) * vec4(samplePoint, 1.0)).xyz;
    return tetrahedron(p, 0.5);
}

/**
 * Return the shortest distance from the eyepoint to the scene surface along
 * the marching direction. If no part of the surface is found between start and end,
 * return end.
 * 
 * eye: the eye point, acting as the origin of the ray
 * marchingDirection: the normalized direction to march in
 * start: the starting distance away from the eye
 * end: the max distance away from the ey to march before giving up
 */
float shortestDistanceToSurface(vec3 eye, vec3 marchingDirection, float start, float end) {
    float depth = start;
    for (int i = 0; i < MAX_MARCHING_STEPS; i++) {
        float dist = sceneSDF(eye + depth * marchingDirection);
        if (dist < EPSILON) {
			return depth;
        }
        depth += dist;
        if (depth >= end) {
            return end;
        }
    }
    return end;
}

vec4 volumeRender(vec3 intersect, vec3 dir, vec3 p1, vec3 p2, vec3 p3, vec3 p4) {

  float s;
  vec4 color;
  
  for (int i = 0; i < MAX_MARCHING_STEPS; i++) {
    float dist = sceneSDF(intersect + s*dir);
    if (dist > 6.) { // once the dist > 20., we are out the other side
        break;
    }
    
    vec4 bary = bary4(intersect+s*dir, p1, p2, p3, p4);
    vec4 sqrtBary = sqrt(bary);
    mat2 dopA = partialTrace(outerProduct(sqrtBary, sqrtBary));
    float trEm = trace(dopA * dopA);
    float normalTrEm = trEm;
    // future ref: https://iquilezles.org/www/articles/functions/functions.htm
    // future ref: https://threejs.org/examples/?q=texture3#webgl2_materials_texture3d
    // future ref: https://en.wikipedia.org/wiki/Maximum_intensity_projection
    // future ref: https://en.wikipedia.org/wiki/Isosurface
    // 'gain' function could be used to remap trEm for better vis.
    vec4 val_color = vec4(1., 1., 1.-normalTrEm, 1.05-normalTrEm);
    
    color.r += (1.0 - color.a) * val_color.a * val_color.r;
    color.g += (1.0 - color.b) * val_color.b * val_color.g;
    color.b += (1.0 - color.b) * val_color.b;
    color.a += (1.0 - color.a) * val_color.a;
    
    if (color.a >= 0.95 || color.b >= 0.95) {
        break;
    }
  
    s += VOLUME_MARCH_STEP;
  }
  
  return color;
}

/**
 * Return the normalized direction to march in from the eye point for a single pixel.
 * 
 * fieldOfView: vertical field of view in degrees
 * size: resolution of the output image
 * fragCoord: the x,y coordinate of the pixel in the output image
 */
vec3 rayDirection(float fieldOfView, vec2 size, vec2 fragCoord) {
    vec2 xy = fragCoord - size / 2.0;
    float z = size.y / tan(radians(fieldOfView) / 2.0);
    return normalize(vec3(xy, -z));
}

void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
	vec3 dir = rayDirection(45.0, iResolution.xy, fragCoord);
    vec3 eye = vec3(0.0, 0.0, 5.0);
    float dist = shortestDistanceToSurface(eye, dir, MIN_DIST, MAX_DIST);
    
    if (dist > MAX_DIST - EPSILON) {
        // Didn't hit anything
        fragColor = vec4(0.0, 0.0, 0.0, 0.0);
		return;
    }
    
    vec3 intersect = dir * dist;
    
    mat4 transform =  rotateY(-iTime);
    
    vec3 p1 = - eye - (transform * vec4(-.5,.5,.5, 1.)).xyz;
    vec3 p2 = - eye - (transform * vec4(.5,-.5,.5, 1.)).xyz;
    vec3 p3 = - eye - (transform * vec4(.5,.5,-.5, 1.)).xyz;
    vec3 p4 = - eye - (transform * vec4(-.5,-.5,-.5, 1.)).xyz;
    
    fragColor = volumeRender(intersect, dir, p1, p2, p3, p4);
}
`
)});
  const child1 = runtime.module(define1);
  main.import("shader", child1);
  return main;
}
