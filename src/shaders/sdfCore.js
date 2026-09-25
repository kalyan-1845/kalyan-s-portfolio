import { sdfFunctions } from './includes/sdf.js';
import { simplex3D } from './includes/noise.js';

export const sdfCoreVertex = /* glsl */`
varying vec3 vPosition;
varying vec3 vWorldPosition;

void main() {
    vPosition = position;
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPos.xyz;
    gl_Position = projectionMatrix * viewMatrix * worldPos;
}
`;

export const sdfCoreFragment = /* glsl */`
${sdfFunctions}
${simplex3D}

uniform float uTime;
uniform vec2 uMouse;
uniform float uZoneProgress;
uniform float uOpacity;
uniform float uPulse;
uniform vec3 uCameraPos;
uniform int uMaxSteps;

varying vec3 vPosition;
varying vec3 vWorldPosition;

#define MAX_DIST 40.0
#define SURF_DIST 0.005

// Scene mapping
float map(vec3 p) {
    // Basic animation
    float time = uTime * 0.5;
    
    // Twist based on mouse and time
    float twistAmount = sin(time * 0.5) * 0.2 + (uMouse.x * 0.5);
    vec3 tp = opTwist(p, twistAmount);
    
    // Base shapes
    // A sphere that pulses
    float sphereRadius = 4.0 + sin(uTime * 2.0) * 0.2 + uPulse * 0.5;
    float dSphere = sdSphere(tp, sphereRadius);
    
    // A torus that cuts into or joins the sphere
    mat3 rotTorus = rotate3D(time, vec3(1.0, 1.0, 0.5));
    float dTorus = sdTorus(rotTorus * p, vec2(5.5, 1.2));
    
    // Smooth blending based on zone progress and scroll
    // Scroll progress morphs it from separated to merged
    float blendFactor = 1.0 + (uZoneProgress * 2.0);
    float dCombined = opSmoothUnion(dSphere, dTorus, blendFactor);
    
    // Add volumetric displacement / noise
    float noise = snoise(p * 0.5 + time) * 0.8;
    
    // Liquid morphing distance
    float finalDist = dCombined + noise;
    
    return finalDist * 0.6; // Scale down step to prevent stepping through surface
}

// Normal estimation
vec3 getNormal(vec3 p) {
    vec2 e = vec2(0.01, 0.0);
    float d = map(p);
    vec3 n = vec3(
        d - map(p - e.xyy),
        d - map(p - e.yxy),
        d - map(p - e.yyx)
    );
    return normalize(n);
}

// Raymarching loop
vec4 raymarch(vec3 ro, vec3 rd) {
    float d0 = 0.0;
    float minD = MAX_DIST;
    
    for(int i = 0; i < 150; i++) {
        // Dynamic step limit based on tier
        if(i >= uMaxSteps) break;
        
        vec3 p = ro + rd * d0;
        float dS = map(p);
        d0 += dS;
        
        if (dS < minD) minD = dS;
        
        if(dS < SURF_DIST) {
            return vec4(d0, 1.0, minD, float(i)); // Hit
        }
        if(d0 > MAX_DIST) {
            break;
        }
    }
    return vec4(d0, 0.0, minD, 0.0); // Miss
}

void main() {
    // Camera ray setup
    vec3 ro = uCameraPos;
    vec3 rd = normalize(vWorldPosition - ro);
    
    vec4 rm = raymarch(ro, rd);
    float d = rm.x;
    float hit = rm.y;
    float minD = rm.z; // For outer glow (volumetric pseudo-scattering)
    
    vec3 finalColor = vec3(0.0);
    float alpha = 0.0;
    
    vec3 coreColor = vec3(0.12, 0.23, 0.37); // Deep blue
    vec3 rimColor = vec3(0.0, 0.95, 1.0);    // Cyan
    vec3 highlightColor = vec3(0.6, 0.1, 0.9); // Purple
    
    if (hit > 0.5) {
        vec3 p = ro + rd * d;
        vec3 n = getNormal(p);
        
        // Lighting
        vec3 lightDir = normalize(vec3(1.0, 2.0, 1.0));
        vec3 viewDir = normalize(ro - p);
        
        // Diffuse
        float diff = max(dot(n, lightDir), 0.0);
        
        // Fresnel / Rim
        float fresnel = 1.0 - max(dot(viewDir, n), 0.0);
        fresnel = pow(fresnel, 2.5);
        
        // Specular
        vec3 halfVector = normalize(lightDir + viewDir);
        float spec = pow(max(dot(n, halfVector), 0.0), 32.0);
        
        // Simulated internal reflection / distortion
        float internalNoise = snoise(p * 2.0 - uTime) * 0.5 + 0.5;
        
        // Combine lighting - Make highlights and refraction more subtle
        finalColor = mix(coreColor, rimColor, fresnel + diff * 0.2);
        finalColor += highlightColor * spec * 0.4; // Reduced from 0.8
        finalColor += rimColor * internalNoise * fresnel * 0.5; // Softened refraction
        
        // Pulse integration
        finalColor *= 1.0 + (uPulse * 0.5);
        
        // Opacity mapping
        alpha = (fresnel + 0.5) * uOpacity;
        
        // Depth fade
        alpha *= smoothstep(MAX_DIST, 0.0, d);
    } 
    else {
        // Volumetric glow for missed rays (halo effect)
        float glow = 0.0;
        if (minD < 1.0) { // Tighter halo (reduced from 2.0)
            glow = pow(1.0 - minD, 3.0);
        }
        finalColor = rimColor * glow * 0.15; // Reduced from 0.3
        finalColor *= 1.0 + (uPulse * 0.3);
        alpha = glow * uOpacity;
    }
    
    // Scale down overall brightness to ensure content readability
    finalColor *= 0.5; // Dimmer baseline
    alpha *= 0.35;     // Much more transparent atmospheric layer
    
    gl_FragColor = vec4(finalColor, clamp(alpha, 0.0, 1.0));
}
`;
