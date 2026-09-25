import * as THREE from 'three';
import { SceneManager } from './SceneManager.js';
import { ScrollController } from './ScrollController.js';
import { MouseController } from './MouseController.js';
import { DeviceProfiler } from './utils/DeviceProfiler.js';

/**
 * NexusEngine — Main entry point for the NEXUS 3D portfolio background.
 * Initializes Three.js, detects GPU tier, and orchestrates all 4 zones.
 */
class NexusEngine {
  constructor() {
    this.canvas = null;
    this.renderer = null;
    this.scene = null;
    this.camera = null;
    this.sceneManager = null;
    this.scrollController = null;
    this.mouseController = null;
    this.isRunning = false;
    this.previousTime = 0;
    this.clock = new THREE.Clock();
  }

  async init() {
    try {
      // 1. Detect GPU capability
      const profiler = new DeviceProfiler();
      const tier = await profiler.detectTier();
      console.log(`[NEXUS] GPU Tier: ${tier}`);

      if (tier === 'none') {
        console.warn('[NEXUS] WebGL not supported. Falling back to CSS background.');
        return;
      }

      // 2. Grab canvas
      this.canvas = document.getElementById('nexus-canvas');
      if (!this.canvas) {
        console.error('[NEXUS] Canvas element #nexus-canvas not found.');
        return;
      }

      // 3. Create renderer
      this.renderer = new THREE.WebGLRenderer({
        canvas: this.canvas,
        antialias: tier === 'high',
        alpha: false,
        powerPreference: 'high-performance'
      });
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, tier === 'high' ? 2 : 1.5));
      this.renderer.setClearColor(0x0a0a0a, 1);
      this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
      this.renderer.toneMappingExposure = 0.6; // Darker, more cinematic base exposure

      // 4. Create scene
      this.scene = new THREE.Scene();
      this.scene.fog = new THREE.FogExp2(0x0a0a0a, 0.012);

      // 5. Create camera
      this.camera = new THREE.PerspectiveCamera(
        60,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
      );
      this.camera.position.set(0, 0, 30);

      // 6. Create controllers
      this.scrollController = new ScrollController();
      this.mouseController = new MouseController();

      // 7. Create scene manager
      this.sceneManager = new SceneManager(
        this.scene,
        this.camera,
        this.renderer,
        tier
      );
      await this.sceneManager.init();

      // 8. Reduced motion listener
      this.mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      this.isReducedMotion = this.mediaQuery.matches;
      this.mediaQuery.addEventListener('change', (e) => {
        this.isReducedMotion = e.matches;
      });
      this.simTime = 0; // custom time tracker scaled by motion pref

      // 9. Resize handler
      window.addEventListener('resize', this._onResize.bind(this));

      // 10. Start animation loop
      this.isRunning = true;
      this.previousTime = 0;
      this.clock.start();
      this._animate();

      console.log('[NEXUS] Engine initialized successfully.');
    } catch (error) {
      console.error('[NEXUS] Engine initialization failed:', error);
    }
  }

  _animate() {
    if (!this.isRunning) return;
    requestAnimationFrame(this._animate.bind(this));

    const elapsed = this.clock.getElapsedTime();
    const delta = elapsed - this.previousTime;
    this.previousTime = elapsed;

    // Clamp delta to prevent huge jumps after tab switch
    const clampedDelta = Math.min(delta, 0.1);
    
    // Scale motion if user prefers reduced motion
    const timeScale = this.isReducedMotion ? 0.05 : 1.0;
    const safeDelta = clampedDelta * timeScale;
    this.simTime += safeDelta;

    // Update controllers
    this.scrollController.update(clampedDelta);
    this.mouseController.update();

    const progress = this.scrollController.getProgress();
    const mouse = this.mouseController.getPosition();
    
    // Disable mouse parallax if reduced motion is on
    const safeMouse = this.isReducedMotion ? { x: 0, y: 0 } : mouse;

    // Update and render all zones
    this.sceneManager.update(this.simTime, safeDelta, progress, safeMouse);
    this.sceneManager.render();
  }

  _onResize() {
    const width = window.innerWidth;
    const height = window.innerHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);

    if (this.sceneManager) {
      this.sceneManager.onResize(width, height);
    }
  }

  dispose() {
    this.isRunning = false;
    if (this.sceneManager) this.sceneManager.dispose();
    if (this.renderer) this.renderer.dispose();
    if (this.mouseController) this.mouseController.dispose();
    if (this.scrollController) this.scrollController.dispose();
  }
}

// Boot the engine
const nexus = new NexusEngine();

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => nexus.init());
} else {
  nexus.init();
}
