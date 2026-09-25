import { simplex3D } from '../shaders/includes/noise.js';

export const streamVertex = /* glsl */ `
${simplex3D}

uniform float uTime;
uniform vec2 uMouse;
uniform float uZoneProgress;
uniform float uOpacity;
uniform float uScrollVelocity;

attribute float aColumnIndex;
attribute float aSpeed;
attribute float aOffset;

varying vec3 vColor;
varying float vAlpha;

uniform float uIsLight;
void main() {
    vec3 pos = position;
    
    // Noise-based horizontal wobble within each column
    float wobble = snoise(vec3(pos.y * 0.1, aColumnIndex * 0.5, uTime * 0.2)) * 2.0;
    pos.x += wobble * uZoneProgress;
    
    // Mouse repulsion field
    float dist = distance(pos.xy, uMouse * vec2(20.0, 15.0)); // approximate world scale mapping
    if (dist < 5.0) {
        vec2 dir = normalize(pos.xy - (uMouse * vec2(20.0, 15.0)));
        pos.xy += dir * (5.0 - dist) * 0.5 * uZoneProgress;
    }
    
    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    
    // gl_PointSize: 2.0 to 5.0, varies with speed and distance
    gl_PointSize = (2.0 + aSpeed) * (15.0 / -mvPosition.z);
    
    // Colors: cyan (#00f2fe) to blue (#3b82f6) based on Y position
    vec3 cyan = vec3(0.0, 0.949, 0.996);
    vec3 blue = vec3(0.231, 0.51, 0.965);
    
    float normY = clamp((pos.y + 25.0) / 50.0, 0.0, 1.0);
    vColor = mix(blue, cyan, normY);
    
    // Alpha: particles near the top of their column are brighter, dimming as they fall
    float localY = mod(pos.y + aOffset * 10.0 + uTime * aSpeed * 2.0, 50.0) - 25.0;
    vAlpha = smoothstep(-25.0, 25.0, localY) * 0.8 + 0.2;
}
`;

export const streamFragment = /* glsl */ `
uniform float uOpacity;

varying vec3 vColor;
varying float vAlpha;

uniform float uIsLight;
void main() {
    // Render elongated vertical points (ellipse shape using gl_PointCoord) for motion blur
    vec2 coord = gl_PointCoord * 2.0 - 1.0;
    
    coord.x *= 3.0; // Squeeze X to make vertical ellipse
    
    float dist = dot(coord, coord);
    if (dist > 1.0) discard;
    
    // Glow effect and trail
    float glow = exp(-dist * 2.0);
    
    gl_FragColor = vec4(vColor, vAlpha * uOpacity * glow);
    if (uIsLight > 0.5) {
        vec3 darkColor = mix(gl_FragColor.rgb * 0.1, vec3(0.05, 0.15, 0.45), 0.9);
        float newAlpha = min(1.0, gl_FragColor.a * 15.0);
        if (gl_FragColor.a > 0.001 && gl_FragColor.a < 0.05) {
            newAlpha = gl_FragColor.a * 8.0;
        }
        gl_FragColor = vec4(darkColor, newAlpha);
    }
}
`;
