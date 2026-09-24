import * as THREE from 'three';
import { streamVertex, streamFragment } from '../shaders/stream.js';
import { simplex3D } from '../shaders/includes/noise.js';

export class DataStream {
    constructor(scene, camera, renderer, tier) {
        this.scene = scene;
        this.camera = camera;
        this.renderer = renderer;
        this.tier = tier;
        
        this.group = new THREE.Group();
        this.particleCount = this.getParticleCount(tier);
        
        this.positions = null;
        this.speeds = null;
        this.geometry = null;
        this.material = null;
        this.points = null;
    }
    
    getParticleCount(tier) {
        switch (tier) {
            case 'high': return 8000;
            case 'low': return 2500;
            case 'medium': default: return 5000;
        }
    }
    
    async init() {
        try {
            this.geometry = new THREE.BufferGeometry();
            
            this.positions = new Float32Array(this.particleCount * 3);
            const columnIndices = new Float32Array(this.particleCount);
            this.speeds = new Float32Array(this.particleCount);
            const offsets = new Float32Array(this.particleCount);
            
            const numColumns = 30;
            const minX = -20;
            const maxX = 20;
            const stepX = (maxX - minX) / (numColumns - 1);
            
            for (let i = 0; i < this.particleCount; i++) {
                // Random column index 0-29
                const colIndex = Math.floor(Math.random() * numColumns);
                const colX = minX + colIndex * stepX;
                
                // Initial position
                const randomOffsetX = (Math.random() - 0.5) * 0.5;
                const x = colX + randomOffsetX;
                const y = (Math.random() * 50) - 25; // -25 to 25
                const z = (Math.random() * 20) - 10; // -10 to 10
                
                this.positions[i * 3] = x;
                this.positions[i * 3 + 1] = y;
                this.positions[i * 3 + 2] = z;
                
                columnIndices[i] = colIndex;
                this.speeds[i] = 0.5 + Math.random() * 2.5; // 0.5 to 3.0
                offsets[i] = Math.random() * Math.PI * 2;
            }
            
            this.geometry.setAttribute('position', new THREE.BufferAttribute(this.positions, 3));
            this.geometry.setAttribute('aColumnIndex', new THREE.BufferAttribute(columnIndices, 1));
            this.geometry.setAttribute('aSpeed', new THREE.BufferAttribute(this.speeds, 1));
            this.geometry.setAttribute('aOffset', new THREE.BufferAttribute(offsets, 1));
            
            this.material = new THREE.ShaderMaterial({
                vertexShader: streamVertex,
                fragmentShader: streamFragment,
                uniforms: {
                    uTime: { value: 0 },
                    uMouse: { value: new THREE.Vector2(0, 0) },
                    uZoneProgress: { value: 0 },
                    uOpacity: { value: 0 },
                    uScrollVelocity: { value: 0 }
                },
                transparent: true,
                depthWrite: false,
                blending: THREE.AdditiveBlending
            });
            
            this.points = new THREE.Points(this.geometry, this.material);
            this.group.add(this.points);
            this.scene.add(this.group);
            
        } catch (error) {
            console.error('Error initializing DataStream zone:', error);
        }
    }
    
    update(time, delta, globalProgress, mouse, zoneProgress, opacity) {
        if (!this.material || !this.points) return;
        
        // Update uniforms
        this.material.uniforms.uTime.value = time;
        this.material.uniforms.uMouse.value.copy(mouse);
        this.material.uniforms.uZoneProgress.value = zoneProgress;
        this.material.uniforms.uOpacity.value = opacity;
        
        // Animate particle Y positions on CPU
        const posAttr = this.geometry.attributes.position;
        const posArray = posAttr.array;
        
        for (let i = 0; i < this.particleCount; i++) {
            const speed = this.speeds[i];
            
            // Fall downward continuously
            posArray[i * 3 + 1] -= speed * delta * 5.0;
            
            // Wrap around when below -25
            if (posArray[i * 3 + 1] < -25) {
                posArray[i * 3 + 1] += 50; // loop back to +25
            }
        }
        
        posAttr.needsUpdate = true;
    }
    
    setVisible(visible) {
        this.group.visible = visible;
    }
    
    onResize(width, height) {
        // Handle resize if needed
    }
    
    dispose() {
        if (this.geometry) this.geometry.dispose();
        if (this.material) this.material.dispose();
        if (this.group) {
            this.scene.remove(this.group);
        }
    }
}
