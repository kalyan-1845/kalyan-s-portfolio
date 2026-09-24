/**
 * ScrollController — Maps page scroll position to a normalized 0–1 progress value.
 * Uses lerp smoothing to prevent jitter on high-DPI trackpads and mice.
 */
export class ScrollController {
  constructor() {
    this.targetProgress = 0;
    this.currentProgress = 0;
    this.velocity = 0;
    this.previousProgress = 0;
    this.smoothing = 0.06;

    this._onScroll = this._onScroll.bind(this);
    window.addEventListener('scroll', this._onScroll, { passive: true });
    this._onScroll();
  }

  _onScroll() {
    const scrollTop = window.scrollY || window.pageYOffset;
    const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
    this.targetProgress = scrollHeight > 0
      ? Math.max(0, Math.min(1, scrollTop / scrollHeight))
      : 0;
  }

  update(delta) {
    this.previousProgress = this.currentProgress;
    this.currentProgress += (this.targetProgress - this.currentProgress) * this.smoothing;

    // Clamp to avoid floating-point drift
    if (Math.abs(this.currentProgress - this.targetProgress) < 0.0001) {
      this.currentProgress = this.targetProgress;
    }

    this.velocity = (this.currentProgress - this.previousProgress) / Math.max(delta, 0.001);
  }

  getProgress() {
    return this.currentProgress;
  }

  getVelocity() {
    return this.velocity;
  }

  dispose() {
    window.removeEventListener('scroll', this._onScroll);
  }
}
