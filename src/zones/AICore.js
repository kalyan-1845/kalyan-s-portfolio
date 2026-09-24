import * as THREE from 'three';
import { coreVertex, coreFragment, ringVertex, ringFragment } from '../shaders/core.js';
import { simplex3D } from '../shaders/includes/noise.js';

export class AICore {
    constructor(scene, camera, renderer, tier = 'high') {
        this.scene = scene;
        this.camera = camera;
        this.renderer = renderer;
        this.tier = tier;
        this.group = new THREE.Group();
    }

    async init() {
        try {
            this.scene.add(this.group);

            let sphereDetail = 64;
            let ringCount = 200;
            let ambientCount = 2000;

            if (this.tier === 'medium') {
                sphereDetail = 32;
                ringCount = 100;
                ambientCount = 1000;
            } else if (this.tier === 'low') {
                sphereDetail = 16;
                ringCount = 50;
                ambientCount = 500;
            }

            // CORE SPHERE
            const sphereGeo = new THREE.IcosahedronGeometry(5, sphereDetail);
            this.coreMaterial = new THREE.ShaderMaterial({
                vertexShader: coreVertex,
                fragmentShader: coreFragment,
                uniforms: {
                    uTime: { value: 0 },
                    uMouse: { value: new THREE.Vector2(0, 0) },
                    uZoneProgress: { value: 0 },
                    uOpacity: { value: 1 },
                    uPulse: { value: 0 }
                },
                side: THREE.FrontSide,
                transparent: true
            });
            this.coreMesh = new THREE.Mesh(sphereGeo, this.coreMaterial);
            this.group.add(this.coreMesh);

            // ENERGY RINGS
            this.ringSystems = [];
            const radii = [7, 9, 11];
            const speeds = [0.5, -0.3, 0.7];

            for (let i = 0; i < 3; i++) {
                const geo = new THREE.BufferGeometry();
                const positions = new Float32Array(ringCount * 3);
                const sizes = new Float32Array(ringCount);

                const radius = radii[i];
                for (let j = 0; j < ringCount; j++) {
                    const angle = (j / ringCount) * Math.PI * 2;
                    positions[j * 3] = Math.cos(angle) * radius;
                    positions[j * 3 + 1] = (Math.random() - 0.5) * 1.5;
                    positions[j * 3 + 2] = Math.sin(angle) * radius;
                    sizes[j] = Math.random() * 0.5 + 0.1;
                }

                geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
                geo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

                const mat = new THREE.ShaderMaterial({
                    vertexShader: ringVertex,
                    fragmentShader: ringFragment,
                    uniforms: {
                        uTime: { value: 0 },
                        uOpacity: { value: 1 },
                        uZoneProgress: { value: 0 }
                    },
                    transparent: true,
                    blending: THREE.AdditiveBlending,
                    depthWrite: false
                });

                const points = new THREE.Points(geo, mat);
                points.rotation.x = (Math.random() - 0.5) * Math.PI * 0.5;
                points.rotation.y = (Math.random() - 0.5) * Math.PI * 0.5;
                
                this.group.add(points);
                this.ringSystems.push({ mesh: points, speed: speeds[i] });
            }

            // AMBIENT PARTICLES
            const ambientGeo = new THREE.BufferGeometry();
            const ambientPos = new Float32Array(ambientCount * 3);

            for (let i = 0; i < ambientCount; i++) {
                const r = Math.random() * 20 + 6;
                const theta = Math.random() * Math.PI * 2;
                const phi = Math.acos((Math.random() * 2) - 1);

                ambientPos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
                ambientPos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
                ambientPos[i * 3 + 2] = r * Math.cos(phi);
            }

            ambientGeo.setAttribute('position', new THREE.BufferAttribute(ambientPos, 3));

            const ambientMat = new THREE.ShaderMaterial({
                vertexShader: /* glsl */`
                    uniform float uOpacity;
                    varying float vAlpha;
                    void main() {
                        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                        gl_PointSize = (100.0 / -mvPosition.z);
                        gl_Position = projectionMatrix * mvPosition;
                        vAlpha = 1.0;
                    }
                `,
                fragmentShader: /* glsl */`
                    uniform float uOpacity;
                    varying float vAlpha;
                    void main() {
                        vec2 cxy = 2.0 * gl_PointCoord - 1.0;
                        float r = dot(cxy, cxy);
                        if(r > 1.0) discard;
                        gl_FragColor = vec4(1.0, 1.0, 1.0, (1.0 - r) * 0.5 * uOpacity);
                    }
                `,
                uniforms: {
                    uOpacity: { value: 1.0 }
                },
                transparent: true,
                blending: THREE.AdditiveBlending,
                depthWrite: false
            });

            this.ambientMesh = new THREE.Points(ambientGeo, ambientMat);
            this.group.add(this.ambientMesh);

        } catch (error) {
            console.error('Error initializing AICore:', error);
        }
    }

    update(time, delta, globalProgress, mouse, zoneProgress, opacity) {
        if (!this.coreMaterial) return;

        this.coreMaterial.uniforms.uTime.value = time;
        this.coreMaterial.uniforms.uMouse.value.copy(mouse);
        this.coreMaterial.uniforms.uZoneProgress.value = zoneProgress;
        this.coreMaterial.uniforms.uOpacity.value = opacity;

        const mouseDist = Math.sqrt(mouse.x * mouse.x + mouse.y * mouse.y);
        const boost = Math.max(0, 1.0 - mouseDist);
        this.coreMaterial.uniforms.uPulse.value = Math.sin(time * 2.0) * 0.5 + 0.5 + boost * 0.5;

        this.ringSystems.forEach(ring => {
            ring.mesh.rotation.y += ring.speed * delta * 0.5;
            ring.mesh.material.uniforms.uTime.value = time;
            ring.mesh.material.uniforms.uOpacity.value = opacity;
            ring.mesh.material.uniforms.uZoneProgress.value = zoneProgress;
        });

        const positions = this.ambientMesh.geometry.attributes.position.array;
        for (let i = 0; i < positions.length; i += 3) {
            let x = positions[i];
            let y = positions[i+1];
            let z = positions[i+2];
            
            x *= 0.99;
            y *= 0.99;
            z *= 0.99;

            const distSq = x*x + y*y + z*z;
            if (distSq < 25) {
                const r = 26;
                const theta = Math.random() * Math.PI * 2;
                const phi = Math.acos((Math.random() * 2) - 1);
                x = r * Math.sin(phi) * Math.cos(theta);
                y = r * Math.sin(phi) * Math.sin(theta);
                z = r * Math.cos(phi);
            }

            positions[i] = x;
            positions[i+1] = y;
            positions[i+2] = z;
        }
        this.ambientMesh.geometry.attributes.position.needsUpdate = true;
        this.ambientMesh.material.uniforms.uOpacity.value = opacity;

        const scale = 0.3 + 0.7 * Math.min(1.0, Math.max(0.0, zoneProgress / 0.4));
        this.group.scale.setScalar(scale);
    }

    setVisible(visible) {
        this.group.visible = visible;
    }

    onResize(width, height) {}

    dispose() {
        if (this.coreMesh) {
            this.coreMesh.geometry.dispose();
            this.coreMaterial.dispose();
        }
        this.ringSystems.forEach(ring => {
            ring.mesh.geometry.dispose();
            ring.mesh.material.dispose();
        });
        if (this.ambientMesh) {
            this.ambientMesh.geometry.dispose();
            this.ambientMesh.material.dispose();
        }
        if (this.group.parent) {
            this.group.parent.remove(this.group);
        }
    }
}
