import { simplex3D } from '../shaders/includes/noise.js';

export const simulationFragment = /* glsl */ `
${simplex3D}

uniform float uTime;
uniform vec2 uMouse;
uniform float uZoneProgress;
uniform float uDelta;

void main() {
    vec2 uv = gl_FragCoord.xy / resolution.xy;
    vec4 currentPosData = texture2D(texturePosition, uv);
    vec3 pos = currentPosData.xyz;
    float seed = currentPosData.w; 
    
    // Base shapes
    // Torus
    float t = uTime * 0.2 + seed * 6.28;
    vec3 torusPos = vec3(
        (10.0 + 3.0 * cos(seed * 6.28 * 10.0)) * cos(t),
        3.0 * sin(seed * 6.28 * 10.0),
        (10.0 + 3.0 * cos(seed * 6.28 * 10.0)) * sin(t)
    );
    
    // Double Helix
    float h = (seed - 0.5) * 40.0;
    float angle = h * 0.5 + uTime;
    float r = 5.0;
    float helix1 = mod(seed * 100.0, 2.0) < 1.0 ? 1.0 : -1.0;
    vec3 helixPos = vec3(
        r * cos(angle + helix1 * 3.14159),
        h,
        r * sin(angle + helix1 * 3.14159)
    );
    
    // Sphere
    float theta = seed * 6.28 * 100.0;
    float phi = acos(2.0 * fract(seed * 73.123) - 1.0);
    vec3 spherePos = vec3(
        8.0 * sin(phi) * cos(theta),
        8.0 * sin(phi) * sin(theta),
        8.0 * cos(phi)
    );
    
    // Interpolate based on uZoneProgress
    vec3 targetPos = vec3(0.0);
    if(uZoneProgress < 0.33) {
        float f = smoothstep(0.2, 0.33, uZoneProgress);
        targetPos = mix(torusPos, helixPos, f);
    } else if(uZoneProgress < 0.66) {
        float f = smoothstep(0.53, 0.66, uZoneProgress);
        targetPos = mix(helixPos, spherePos, f);
    } else {
        targetPos = spherePos;
    }
    
    // Add noise displacement
    float n = snoise(targetPos * 0.1 + uTime * 0.5);
    targetPos += normalize(targetPos + 0.001) * n * 2.0;
    
    // Gravitational attraction to mouse
    vec3 mousePos = vec3(uMouse.x * 20.0, uMouse.y * 20.0, 0.0);
    vec3 dirToMouse = mousePos - pos;
    float distToMouse = length(dirToMouse);
    vec3 attraction = normalize(dirToMouse) * (1.0 / (distToMouse * distToMouse + 1.0)) * 50.0;
    targetPos += attraction;
    
    // Smoothly interpolate current pos towards target
    pos = mix(pos, targetPos, uDelta * 2.0);
    
    gl_FragColor = vec4(pos, seed);
}
`;
