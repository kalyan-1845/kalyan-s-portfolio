import { NeuralField } from './zones/NeuralField.js';
import { DataStream } from './zones/DataStream.js';
import { QuantumCloud } from './zones/QuantumCloud.js';
import { AICore } from './zones/AICore.js';
import { PostFX } from './postprocessing/PostFX.js';

/**
 * Zone scroll ranges — each zone fades in/out with overlap for smooth transitions.
 * Zone 1 has no fade-in (starts at full opacity).
 * Zone 4 has no fade-out (ends at full opacity).
 */
const ZONE_CONFIG = [
  { id: 'neural',  ZoneClass: NeuralField,  start: 0.00, end: 0.30, fadeIn: false, fadeOut: true  },
  { id: 'stream',  ZoneClass: DataStream,   start: 0.22, end: 0.55, fadeIn: true,  fadeOut: true  },
  { id: 'quantum', ZoneClass: QuantumCloud, start: 0.47, end: 0.80, fadeIn: true,  fadeOut: true  },
  { id: 'core',    ZoneClass: AICore,       start: 0.72, end: 1.00, fadeIn: true,  fadeOut: false }
];

const CROSSFADE_WIDTH = 0.06;

/**
 * SceneManager — Orchestrates all 4 NEXUS zones with scroll-based transitions.
 */
export class SceneManager {
  constructor(scene, camera, renderer, tier) {
    this.scene = scene;
    this.camera = camera;
    this.renderer = renderer;
    this.tier = tier;
    this.zones = [];
    this.postfx = null;
  }

  async init() {
    // Create post-processing pipeline
    this.postfx = new PostFX(this.renderer, this.scene, this.camera, this.tier);

    // Create and initialize each zone
    for (const config of ZONE_CONFIG) {
      try {
        const instance = new config.ZoneClass(this.scene, this.camera, this.renderer, this.tier);
        await instance.init();
        instance.setVisible(config.id === 'neural'); // Only Zone 1 visible at start

        this.zones.push({
          instance,
          config,
          opacity: config.id === 'neural' ? 1 : 0
        });

        console.log(`[NEXUS] Zone "${config.id}" initialized.`);
      } catch (error) {
        console.warn(`[NEXUS] Zone "${config.id}" failed to initialize:`, error.message);
      }
    }
  }

  update(time, delta, progress, mouse) {
    for (const zone of this.zones) {
      const { config, instance } = zone;
      const { start, end, fadeIn, fadeOut } = config;

      // Calculate zone opacity with crossfade
      let opacity = 0;
      if (progress >= start && progress <= end) {
        opacity = 1;

        // Fade in
        if (fadeIn && progress < start + CROSSFADE_WIDTH) {
          opacity = Math.max(0, (progress - start) / CROSSFADE_WIDTH);
        }

        // Fade out
        if (fadeOut && progress > end - CROSSFADE_WIDTH) {
          opacity = Math.max(0, (end - progress) / CROSSFADE_WIDTH);
        }

        opacity = Math.max(0, Math.min(1, opacity));
      }

      zone.opacity = opacity;
      const isActive = opacity > 0.001;

      if (isActive) {
        instance.setVisible(true);

        // Local progress within this zone (0–1)
        const zoneProgress = Math.max(0, Math.min(1,
          (progress - start) / (end - start)
        ));

        instance.update(time, delta, progress, mouse, zoneProgress, opacity);
      } else {
        instance.setVisible(false);
      }
    }

    // Camera follows scroll + mouse parallax
    this._updateCamera(progress, mouse);
  }

  _updateCamera(progress, mouse) {
    // Scroll drives camera depth
    const baseZ = 30 - progress * 18;
    const baseY = Math.sin(progress * Math.PI * 2) * 1.5;
    const baseX = Math.cos(progress * Math.PI) * 2;

    // Mouse parallax
    const mouseInfluence = 0.4;
    const targetX = baseX + mouse.x * mouseInfluence * 3;
    const targetY = baseY + mouse.y * mouseInfluence * 2;

    // Smooth camera lerp
    this.camera.position.x += (targetX - this.camera.position.x) * 0.025;
    this.camera.position.y += (targetY - this.camera.position.y) * 0.025;
    this.camera.position.z += (baseZ - this.camera.position.z) * 0.03;

    // Camera always looks at center
    this.camera.lookAt(0, 0, 0);
  }

  render() {
    this.postfx.render();
  }

  onResize(width, height) {
    this.postfx.onResize(width, height);
    for (const { instance } of this.zones) {
      if (instance.onResize) instance.onResize(width, height);
    }
  }

  dispose() {
    for (const { instance } of this.zones) {
      if (instance.dispose) instance.dispose();
    }
    if (this.postfx) this.postfx.dispose();
  }
}
