import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

/**
 * PostFX — Post-processing pipeline with bloom.
 * Tier-aware: reduces bloom intensity on weaker GPUs.
 */
export class PostFX {
  constructor(renderer, scene, camera, tier) {
    this.renderer = renderer;
    this.composer = new EffectComposer(renderer);

    // Base render pass
    const renderPass = new RenderPass(scene, camera);
    this.composer.addPass(renderPass);

    // Bloom configuration per tier - carefully tuned for cinematic feel, no blowout
    const bloomConfig = {
      high:   { strength: 0.6, radius: 0.6, threshold: 0.4 },
      medium: { strength: 0.4, radius: 0.5, threshold: 0.5 },
      low:    { strength: 0.3, radius: 0.4, threshold: 0.6 }
    };

    const config = bloomConfig[tier] || bloomConfig.medium;
    const resolution = new THREE.Vector2(window.innerWidth, window.innerHeight);

    this.bloomPass = new UnrealBloomPass(resolution, config.strength, config.radius, config.threshold);
    this.composer.addPass(this.bloomPass);

    // Output pass for tone mapping + color space
    const outputPass = new OutputPass();
    this.composer.addPass(outputPass);
  }

  setBloomStrength(strength) {
    this.bloomPass.strength = strength;
  }

  render() {
    this.composer.render();
  }

  onResize(width, height) {
    this.composer.setSize(width, height);
  }

  dispose() {
    this.composer.dispose();
  }
}
