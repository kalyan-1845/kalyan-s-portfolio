import * as THREE from 'three';
import { GPGPUEngine } from '../gpgpu/GPGPUEngine.js';
import { quantumVertex, quantumFragment } from '../shaders/quantum.js';
import { simulationFragment } from '../gpgpu/simulation.js';

export class QuantumCloud {
    constructor(scene, camera, renderer, tier) {
        this.scene = scene;
        this.camera = camera;
        this.renderer = renderer;
        this.tier = tier;
        
        this.group = new THREE.Group();
        this.particles = null;
        this.gpgpu = null;
        this.isFallback = false;
        this.fallbackTime = 0;
    }

    async init() {
        this.scene.add(this.group);
        
        let size;
        switch (this.tier) {
            case 'high': size = 256; break;
            case 'medium': size = 128; break;
            case 'low': size = 64; break;
            default: size = 128; break;
        }
        this.size = size;
        const totalParticles = size * size;
        
        const initialPositions = new Float32Array(totalParticles * 4);
        const aReference = new Float32Array(totalParticles * 2);
        
        for (let i = 0; i < totalParticles; i++) {
            const i4 = i * 4;
            const i2 = i * 2;
            
            const radius = 12 * Math.cbrt(Math.random());
            const theta = Math.random() * 2 * Math.PI;
            const phi = Math.acos(2 * Math.random() - 1);
            
            initialPositions[i4 + 0] = radius * Math.sin(phi) * Math.cos(theta); // x
            initialPositions[i4 + 1] = radius * Math.sin(phi) * Math.sin(theta); // y
            initialPositions[i4 + 2] = radius * Math.cos(phi); // z
            initialPositions[i4 + 3] = Math.random(); // w (seed)
            
            aReference[i2 + 0] = (i % size) / size; // u
            aReference[i2 + 1] = Math.floor(i / size) / size; // v
        }
        
        try {
            this.gpgpu = new GPGPUEngine(size, this.renderer);
            this.gpgpu.init(simulationFragment, initialPositions);
        } catch (e) {
            console.error("GPGPU init failed, falling back", e);
            this.isFallback = true;
            this.fallbackPositions = initialPositions;
        }
        
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('aReference', new THREE.BufferAttribute(aReference, 2));
        
        // Add fallback position attribute just in case
        const fallbackPosAttribute = new Float32Array(totalParticles * 3);
        for(let i = 0; i < totalParticles; i++) {
            fallbackPosAttribute[i*3] = initialPositions[i*4];
            fallbackPosAttribute[i*3+1] = initialPositions[i*4+1];
            fallbackPosAttribute[i*3+2] = initialPositions[i*4+2];
        }
        geometry.setAttribute('position', new THREE.BufferAttribute(fallbackPosAttribute, 3));
        
        this.material = new THREE.ShaderMaterial({
            vertexShader: quantumVertex,
            fragmentShader: quantumFragment,
            transparent: true,
            depthWrite: false,
            blending: THREE.AdditiveBlending,
            uniforms: {
                uTime: { value: 0 },
                uMouse: { value: new THREE.Vector2(0, 0) },
                uZoneProgress: { value: 0 },
                uOpacity: { value: 1 },
                uPositions: { value: null }
            }
        });
        
        this.particles = new THREE.Points(geometry, this.material);
        this.group.add(this.particles);
    }

    update(time, delta, globalProgress, mouse, zoneProgress, opacity) {
        if (!this.particles) return;
        
        if (this.isFallback) {
            this.fallbackTime += delta;
            this.material.uniforms.uTime.value = this.fallbackTime;
            this.material.uniforms.uMouse.value.copy(mouse);
            this.material.uniforms.uZoneProgress.value = zoneProgress;
            this.material.uniforms.uOpacity.value = opacity;
            
            this.group.rotation.y = this.fallbackTime * 0.1;
            return;
        }
        
        this.gpgpu.setUniform('uTime', time);
        this.gpgpu.setUniform('uMouse', mouse);
        this.gpgpu.setUniform('uZoneProgress', zoneProgress);
        this.gpgpu.setUniform('uDelta', delta);
        
        this.gpgpu.compute();
        
        this.material.uniforms.uPositions.value = this.gpgpu.getPositionTexture();
        this.material.uniforms.uTime.value = time;
        this.material.uniforms.uMouse.value.copy(mouse);
        this.material.uniforms.uZoneProgress.value = zoneProgress;
        this.material.uniforms.uOpacity.value = opacity;
    }

    setVisible(visible) {
        if(this.group) {
            this.group.visible = visible;
        }
    }

    onResize(width, height) {
    }

    dispose() {
        if (this.group) {
            this.scene.remove(this.group);
        }
        if (this.particles) {
            this.particles.geometry.dispose();
            this.particles.material.dispose();
        }
        if (this.gpgpu) {
            this.gpgpu.dispose();
        }
    }
}
