import { simplex3D } from '../shaders/includes/noise.js';

export const quantumVertex = /* glsl */ `
${simplex3D}

uniform float uTime;
uniform vec2 uMouse;
uniform float uZoneProgress;
uniform float uOpacity;
uniform sampler2D uPositions;

attribute vec2 aReference;

varying vec3 vColor;

uniform float uIsLight;
void main() {
    vec4 positionData = texture2D(uPositions, aReference);
    vec3 pos = positionData.xyz;
    
    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    
    float distanceToCamera = -mvPosition.z;
    gl_PointSize = (100.0 / distanceToCamera) * (1.5 + (sin(uTime * 2.0 + pos.z) * 0.5 + 0.5) * 2.5);
    
    vec3 color1 = vec3(0.0, 0.949, 0.996); // #00f2fe
    vec3 color2 = vec3(0.486, 0.227, 0.929); // #7c3aed
    vec3 color3 = vec3(0.941, 0.576, 0.984); // #f093fb
    
    float noiseVal = snoise(pos * 0.2 + uTime * 0.1);
    float mixVal1 = smoothstep(-1.0, 0.0, noiseVal + pos.y * 0.1);
    float mixVal2 = smoothstep(0.0, 1.0, noiseVal + pos.y * 0.1);
    
    vec3 finalColor = mix(mix(color1, color2, mixVal1), color3, mixVal2);
    vColor = finalColor;
}
`;

export const quantumFragment = /* glsl */ `
uniform float uOpacity;
varying vec3 vColor;

uniform float uIsLight;
void main() {
    vec2 coord = gl_PointCoord - vec2(0.5);
    float dist = length(coord);
    if(dist > 0.5) {
        discard;
    }
    
    float alpha = (0.5 - dist) * 2.0;
    alpha = pow(alpha, 1.5);
    
    gl_FragColor = vec4(vColor, alpha * uOpacity);
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
