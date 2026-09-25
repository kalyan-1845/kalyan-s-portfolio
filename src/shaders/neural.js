import { simplex3D } from '../shaders/includes/noise.js';

export const neuralVertex = /* glsl */ `
${simplex3D}

uniform float uTime;
uniform vec2 uMouse;
uniform float uZoneProgress;
uniform float uOpacity;

attribute vec3 aVelocity;
attribute float aSize;

varying vec3 vColor;
varying float vOpacity;

uniform float uIsLight;
void main() {
    vec3 pos = position;
    
    // Apply simplex noise displacement
    float noise = snoise(vec3(pos.x * 0.1, pos.y * 0.1, pos.z * 0.1 + uTime * 0.2));
    pos += aVelocity * noise * 2.0;

    // Mouse repulsion
    vec2 mouseWorld = uMouse * 20.0;
    float distToMouse = length(pos.xy - mouseWorld);
    float radius = 5.0;
    if (distToMouse < radius) {
        vec2 dir = normalize(pos.xy - mouseWorld);
        float force = (radius - distToMouse) / radius;
        pos.xy += dir * force * 2.0;
    }

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPosition;

    // Size attenuation (reduced multiplier from 100 to 40, clamped max size to prevent massive blowouts)
    gl_PointSize = min(aSize * (1.0 + noise * 0.5) * (40.0 / -mvPosition.z), 12.0);

    // Color interpolation between cyan #00f2fe and pink #f093fb
    vec3 cyan = vec3(0.0, 0.949, 0.996);
    vec3 pink = vec3(0.941, 0.576, 0.984);
    
    float colorMix = (noise + 1.0) * 0.5;
    vColor = mix(cyan, pink, colorMix);
    
    vOpacity = uOpacity;
}
`;

export const neuralFragment = /* glsl */ `
varying vec3 vColor;
varying float vOpacity;

uniform float uIsLight;
void main() {
    // Soft circular points
    vec2 coord = gl_PointCoord - vec2(0.5);
    float dist = length(coord);
    
    if (dist > 0.5) {
        discard;
    }
    
    // Glow falloff
    float alpha = (0.5 - dist) * 2.0;
    alpha = pow(alpha, 1.5); // Smoother falloff
    
    gl_FragColor = vec4(vColor, alpha * vOpacity);
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

export const neuralLineVertex = /* glsl */ `
uniform float uOpacity;
varying float vOpacity;
varying float vDepth;

uniform float uIsLight;
void main() {
    vOpacity = uOpacity;
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    vDepth = -mvPosition.z;
}
`;

export const neuralLineFragment = /* glsl */ `
varying float vOpacity;
varying float vDepth;

uniform float uIsLight;
void main() {
    // Cyan #00f2fe
    vec3 color = vec3(0.0, 0.949, 0.996);
    
    // Distance fade
    float fade = 1.0 - smoothstep(10.0, 50.0, vDepth);
    
    gl_FragColor = vec4(color, vOpacity * fade * 0.08);
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
