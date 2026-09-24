/**
 * DeviceProfiler — Detects GPU capabilities and returns a quality tier.
 * Tiers: 'high' (100K particles), 'medium' (50K), 'low' (10K), 'none' (no WebGL).
 */
export class DeviceProfiler {
  async detectTier() {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');

      if (!gl) {
        console.warn('[NEXUS] No WebGL support detected.');
        return 'none';
      }

      const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
      const gpuRenderer = debugInfo
        ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL)
        : 'unknown';

      console.log(`[NEXUS] GPU: ${gpuRenderer}`);

      const maxTextureSize = gl.getParameter(gl.MAX_TEXTURE_SIZE);
      const maxVaryings = gl.getParameter(gl.MAX_VARYING_VECTORS);
      const isWebGL2 = gl instanceof WebGL2RenderingContext;

      // Check for known high-end GPUs
      const highEndPattern = /nvidia|radeon|apple m[1-9]|adreno 7|mali-g[7-9]/i;
      const lowEndPattern = /swiftshader|llvmpipe|mesa|intel hd [1-3]/i;

      let tier = 'medium';

      if (lowEndPattern.test(gpuRenderer) || maxTextureSize < 4096) {
        tier = 'low';
      } else if (highEndPattern.test(gpuRenderer) && maxTextureSize >= 16384 && isWebGL2) {
        tier = 'high';
      } else if (maxTextureSize >= 8192 && isWebGL2) {
        tier = 'medium';
      } else {
        tier = 'low';
      }

      // Mobile detection — force lower tier on small screens
      const isMobile = /android|iphone|ipad|mobile/i.test(navigator.userAgent);
      if (isMobile && tier === 'high') {
        tier = 'medium';
      }

      // Clean up test canvas
      const loseContext = gl.getExtension('WEBGL_lose_context');
      if (loseContext) loseContext.loseContext();

      return tier;
    } catch (error) {
      console.error('[NEXUS] GPU profiling failed:', error);
      return 'low';
    }
  }

  getParticleCount(tier) {
    const counts = { high: 100000, medium: 50000, low: 10000, none: 0 };
    return counts[tier] || 10000;
  }

  getNodeCount(tier) {
    const counts = { high: 5000, medium: 3000, low: 1500, none: 0 };
    return counts[tier] || 1500;
  }
}
