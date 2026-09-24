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

    // Size attenuation
    gl_PointSize = aSize * (1.0 + noise * 0.5) * (100.0 / -mvPosition.z);

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
}
`;

export const neuralLineVertex = /* glsl */ `
uniform float uOpacity;
varying float vOpacity;
varying float vDepth;

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

void main() {
    // Cyan #00f2fe
    vec3 color = vec3(0.0, 0.949, 0.996);
    
    // Distance fade
    float fade = 1.0 - smoothstep(10.0, 50.0, vDepth);
    
    gl_FragColor = vec4(color, vOpacity * fade * 0.3);
}
`;
