import { simplex3D } from '../shaders/includes/noise.js';

export const coreVertex = /* glsl */`
${simplex3D}

uniform float uTime;
uniform vec2 uMouse;
uniform float uZoneProgress;
uniform float uOpacity;
uniform float uPulse;

varying vec3 vNormal;
varying vec3 vPosition;
varying vec2 vUv;
varying vec3 vViewPosition;

void main() {
    vNormal = normalize(normalMatrix * normal);
    vUv = uv;
    vPosition = position;
    
    // Noise displacement
    float noiseValue = snoise(position * 2.0 + uTime * 0.5);
    
    // Contraction and expansion based on zone progress
    float scale = mix(0.9, 1.1 + uPulse * 0.2, smoothstep(0.0, 1.0, uZoneProgress));
    
    vec3 displacedPosition = position * scale + normal * noiseValue * uPulse * 0.5;
    
    vec4 mvPosition = modelViewMatrix * vec4(displacedPosition, 1.0);
    vViewPosition = -mvPosition.xyz;
    gl_Position = projectionMatrix * mvPosition;
}
`;

export const coreFragment = /* glsl */`
uniform float uTime;
uniform float uOpacity;
uniform float uPulse;

varying vec3 vNormal;
varying vec3 vPosition;
varying vec2 vUv;
varying vec3 vViewPosition;

// Simple FBM for detail
float random (vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
}

float noise (vec2 st) {
    vec2 i = floor(st);
    vec2 f = fract(st);

    float a = random(i);
    float b = random(i + vec2(1.0, 0.0));
    float c = random(i + vec2(0.0, 1.0));
    float d = random(i + vec2(1.0, 1.0));

    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(a, b, u.x) + (c - a)* u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
}

float fbm (vec2 st) {
    float value = 0.0;
    float amplitude = 0.5;
    for (int i = 0; i < 5; i++) {
        value += amplitude * noise(st);
        st *= 2.0;
        amplitude *= 0.5;
    }
    return value;
}

void main() {
    vec3 normal = normalize(vNormal);
    vec3 viewDir = normalize(vViewPosition);
    
    // Fresnel
    float fresnel = dot(viewDir, normal);
    fresnel = clamp(1.0 - fresnel, 0.0, 1.0);
    fresnel = pow(fresnel, 3.0);
    
    // Core color
    vec3 coreColor = vec3(0.12, 0.23, 0.37); // #1e3a5f
    vec3 rimColor = vec3(0.0, 0.95, 1.0);    // #00f2fe
    
    // Energy Rings
    float ringPhase = fract(vPosition.y * 2.0 - uTime);
    float ring = smoothstep(0.0, 0.1, ringPhase) * smoothstep(0.2, 0.1, ringPhase);
    
    // Surface noise
    float detail = fbm(vUv * 10.0 + uTime * 0.1);
    
    vec3 finalColor = mix(coreColor, rimColor, fresnel + ring * 0.5);
    finalColor += rimColor * ring * (0.6 + uPulse * 1.0); // Reduced additive ring brightness
    finalColor *= 1.0 + detail * 0.5;
    finalColor *= (0.5 + uPulse * 0.2); // Reduced overall multiplier
    
    float alpha = clamp(fresnel + 0.3 + ring, 0.0, 1.0) * uOpacity * 0.7; // Dim base alpha
    
    gl_FragColor = vec4(finalColor, alpha);
}
`;

export const ringVertex = /* glsl */`
uniform float uTime;
uniform float uZoneProgress;

attribute float size;

varying float vAlpha;

void main() {
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    
    // Attenuation - Reduced point size multiplier
    gl_PointSize = size * (180.0 / -mvPosition.z);
    
    gl_Position = projectionMatrix * mvPosition;
    
    vAlpha = smoothstep(0.0, 0.5, uZoneProgress);
}
`;

export const ringFragment = /* glsl */`
uniform float uOpacity;

varying float vAlpha;

void main() {
    // Soft circle
    vec2 cxy = 2.0 * gl_PointCoord - 1.0;
    float r = dot(cxy, cxy);
    if (r > 1.0) {
        discard;
    }
    
    float a = (1.0 - r) * uOpacity * vAlpha * 0.4; // Reduced from 0.8
    vec3 color = vec3(0.0, 0.95, 1.0);
    
    gl_FragColor = vec4(color, a);
}
`;
