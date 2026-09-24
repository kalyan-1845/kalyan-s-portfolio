import * as THREE from 'three';
import { SpatialHash } from '../utils/SpatialHash.js';
import { neuralVertex, neuralFragment, neuralLineVertex, neuralLineFragment } from '../shaders/neural.js';

export default class NeuralField {
    constructor(scene, camera, renderer, tier) {
        this.scene = scene;
        this.camera = camera;
        this.renderer = renderer;
        this.tier = tier || 'medium';
        this.group = new THREE.Group();
        this.frameCounter = 0;
        this.time = 0;
        
        switch (this.tier) {
            case 'high':
                this.nodeCount = 5000;
                this.maxConnections = 8000;
                break;
            case 'medium':
                this.nodeCount = 3000;
                this.maxConnections = 4000;
                break;
            case 'low':
                this.nodeCount = 1500;
                this.maxConnections = 2000;
                break;
            default:
                this.nodeCount = 3000;
                this.maxConnections = 4000;
                break;
        }
    }

    async init() {
        try {
            this.scene.add(this.group);

            // Nodes
            const positions = new Float32Array(this.nodeCount * 3);
            const velocities = new Float32Array(this.nodeCount * 3);
            const sizes = new Float32Array(this.nodeCount);

            for (let i = 0; i < this.nodeCount; i++) {
                positions[i * 3] = (Math.random() - 0.5) * 50;
                positions[i * 3 + 1] = (Math.random() - 0.5) * 50;
                positions[i * 3 + 2] = (Math.random() - 0.5) * 50;

                velocities[i * 3] = (Math.random() - 0.5) * 0.05;
                velocities[i * 3 + 1] = (Math.random() - 0.5) * 0.05;
                velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.05;

                sizes[i] = 2 + Math.random() * 6; // range 2-8
            }

            this.geometry = new THREE.BufferGeometry();
            this.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
            this.geometry.setAttribute('aVelocity', new THREE.BufferAttribute(velocities, 3));
            this.geometry.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));

            this.material = new THREE.ShaderMaterial({
                vertexShader: neuralVertex,
                fragmentShader: neuralFragment,
                uniforms: {
                    uTime: { value: 0 },
                    uMouse: { value: new THREE.Vector2(0, 0) },
                    uZoneProgress: { value: 0 },
                    uOpacity: { value: 1 }
                },
                transparent: true,
                depthWrite: false,
                blending: THREE.AdditiveBlending
            });

            this.points = new THREE.Points(this.geometry, this.material);
            this.group.add(this.points);

            // Connections
            this.linePositions = new Float32Array(this.maxConnections * 2 * 3);
            this.lineGeometry = new THREE.BufferGeometry();
            this.lineGeometry.setAttribute('position', new THREE.BufferAttribute(this.linePositions, 3));
            this.lineGeometry.setDrawRange(0, 0);

            this.lineMaterial = new THREE.ShaderMaterial({
                vertexShader: neuralLineVertex,
                fragmentShader: neuralLineFragment,
                uniforms: {
                    uOpacity: { value: 1 }
                },
                transparent: true,
                depthWrite: false,
                blending: THREE.AdditiveBlending
            });

            this.lines = new THREE.LineSegments(this.lineGeometry, this.lineMaterial);
            this.group.add(this.lines);

            this.spatialHash = new SpatialHash(4.0); // Cell size of 4.0
        } catch (error) {
            console.error("Failed to initialize NeuralField:", error);
        }
    }

    update(time, delta, globalProgress, mouse, zoneProgress, opacity) {
        this.time = time;
        this.frameCounter++;
        
        // Update Uniforms
        this.material.uniforms.uTime.value = time;
        if (mouse) {
            this.material.uniforms.uMouse.value.set(mouse.x, mouse.y);
        }
        this.material.uniforms.uZoneProgress.value = zoneProgress;
        this.material.uniforms.uOpacity.value = opacity;

        this.lineMaterial.uniforms.uOpacity.value = opacity;

        const positions = this.geometry.attributes.position.array;
        const velocities = this.geometry.attributes.aVelocity.array;

        // CPU-side movement
        for (let i = 0; i < this.nodeCount; i++) {
            const idx = i * 3;
            positions[idx] += velocities[idx];
            positions[idx + 1] += velocities[idx + 1];
            positions[idx + 2] += velocities[idx + 2];

            // Wrap around a 50x50x50 cube
            for (let j = 0; j < 3; j++) {
                if (positions[idx + j] > 25) positions[idx + j] -= 50;
                else if (positions[idx + j] < -25) positions[idx + j] += 50;
            }
        }
        this.geometry.attributes.position.needsUpdate = true;

        // Rebuild connections every 3 frames
        if (this.frameCounter % 3 === 0) {
            this.spatialHash.clear();
            
            for (let i = 0; i < this.nodeCount; i++) {
                this.spatialHash.insert(
                    positions[i * 3],
                    positions[i * 3 + 1],
                    positions[i * 3 + 2],
                    i
                );
            }

            let connectionCount = 0;
            const radiusSq = 16.0; // 4.0 squared
            const maxConns = this.maxConnections;

            for (let i = 0; i < this.nodeCount; i++) {
                if (connectionCount >= maxConns) break;

                const px = positions[i * 3];
                const py = positions[i * 3 + 1];
                const pz = positions[i * 3 + 2];

                const neighborCount = this.spatialHash.queryRadius(px, py, pz, 4.0, positions);

                for (let j = 0; j < neighborCount; j++) {
                    const neighborIdx = this.spatialHash.queryResults[j];
                    if (neighborIdx <= i) continue;

                    if (connectionCount >= maxConns) break;

                    const nx = positions[neighborIdx * 3];
                    const ny = positions[neighborIdx * 3 + 1];
                    const nz = positions[neighborIdx * 3 + 2];

                    // SpatialHash queryRadius already does distance check, but we do it again just to be safe
                    const dx = px - nx;
                    const dy = py - ny;
                    const dz = pz - nz;
                    const distSq = dx * dx + dy * dy + dz * dz;

                    if (distSq < radiusSq) {
                        const lineIdx = connectionCount * 6;
                        this.linePositions[lineIdx] = px;
                        this.linePositions[lineIdx + 1] = py;
                        this.linePositions[lineIdx + 2] = pz;
                        
                        this.linePositions[lineIdx + 3] = nx;
                        this.linePositions[lineIdx + 4] = ny;
                        this.linePositions[lineIdx + 5] = nz;
                        
                        connectionCount++;
                    }
                }
            }

            this.lineGeometry.setDrawRange(0, connectionCount * 2);
            this.lineGeometry.attributes.position.needsUpdate = true;
        }
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
        if (this.lineGeometry) this.lineGeometry.dispose();
        if (this.lineMaterial) this.lineMaterial.dispose();
        
        if (this.group) {
            this.scene.remove(this.group);
        }
    }
}
