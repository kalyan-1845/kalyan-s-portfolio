/**
 * MouseController — Tracks mouse/touch position normalized to [-1, 1].
 * Smooths movement to prevent shader jitter.
 */
export class MouseController {
  constructor() {
    this.raw = { x: 0, y: 0 };
    this.smoothed = { x: 0, y: 0 };
    this.smoothing = 0.08;

    this._onMouseMove = this._onMouseMove.bind(this);
    this._onTouchMove = this._onTouchMove.bind(this);

    window.addEventListener('mousemove', this._onMouseMove, { passive: true });
    window.addEventListener('touchmove', this._onTouchMove, { passive: true });
  }

  _onMouseMove(event) {
    this.raw.x = (event.clientX / window.innerWidth) * 2 - 1;
    this.raw.y = -(event.clientY / window.innerHeight) * 2 + 1;
  }

  _onTouchMove(event) {
    if (event.touches.length > 0) {
      const touch = event.touches[0];
      this.raw.x = (touch.clientX / window.innerWidth) * 2 - 1;
      this.raw.y = -(touch.clientY / window.innerHeight) * 2 + 1;
    }
  }

  update() {
    this.smoothed.x += (this.raw.x - this.smoothed.x) * this.smoothing;
    this.smoothed.y += (this.raw.y - this.smoothed.y) * this.smoothing;
  }

  getPosition() {
    return this.smoothed;
  }

  getRawPosition() {
    return this.raw;
  }

  dispose() {
    window.removeEventListener('mousemove', this._onMouseMove);
    window.removeEventListener('touchmove', this._onTouchMove);
  }
}
