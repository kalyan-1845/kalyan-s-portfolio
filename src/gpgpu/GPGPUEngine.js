import * as THREE from 'three';
import { GPUComputationRenderer } from 'three/addons/misc/GPUComputationRenderer.js';

export class GPGPUEngine {
    constructor(size, renderer) {
        this.size = size;
        this.renderer = renderer;
        this.gpuCompute = null;
        this.positionVariable = null;
    }

    init(simulationShader, initialPositions) {
        this.gpuCompute = new GPUComputationRenderer(this.size, this.size, this.renderer);
        
        const dtPosition = this.gpuCompute.createTexture();
        dtPosition.image.data.set(initialPositions);
        
        this.positionVariable = this.gpuCompute.addVariable('texturePosition', simulationShader, dtPosition);
        
        this.gpuCompute.setVariableDependencies(this.positionVariable, [this.positionVariable]);
        
        this.positionVariable.material.uniforms.uTime = { value: 0.0 };
        this.positionVariable.material.uniforms.uMouse = { value: new THREE.Vector2(0, 0) };
        this.positionVariable.material.uniforms.uZoneProgress = { value: 0.0 };
        this.positionVariable.material.uniforms.uDelta = { value: 0.0 };
        
        const error = this.gpuCompute.init();
        if (error !== null) {
            console.error('GPUComputationRenderer init failed', error);
            throw new Error(error);
        }
    }

    setUniform(name, value) {
        if (this.positionVariable && this.positionVariable.material.uniforms[name]) {
            this.positionVariable.material.uniforms[name].value = value;
        }
    }

    compute() {
        if (this.gpuCompute) {
            this.gpuCompute.compute();
        }
    }

    getPositionTexture() {
        if (this.gpuCompute) {
            return this.gpuCompute.getCurrentRenderTarget(this.positionVariable).texture;
        }
        return null;
    }

    dispose() {
        if (this.gpuCompute) {
            this.gpuCompute.dispose();
        }
    }
}
