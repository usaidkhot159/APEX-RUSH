const ENVIRONMENTS = ['city', 'night', 'desert', 'highway'];

const Environment = {
  current: 'city',
  nextChange: 60,   // seconds
  elapsed: 0,
  transitionAlpha: 0,
  transitioning: false,
  idx: 0,

  init() {
    this.current = 'city';
    this.idx = 0;
    this.elapsed = 0;
    this.nextChange = 60;
    this.transitionAlpha = 0;
    this.transitioning = false;
  },

  update(dt) {
    this.elapsed += dt;
    if (this.elapsed >= this.nextChange && !this.transitioning) {
      this.transitioning = true;
      this.transitionAlpha = 0;
    }
    if (this.transitioning) {
      this.transitionAlpha += dt * 2;
      if (this.transitionAlpha >= 1) {
        this.idx = (this.idx + 1) % ENVIRONMENTS.length;
        this.current = ENVIRONMENTS[this.idx];
        this.elapsed = 0;
        this.transitionAlpha = 0;
        this.transitioning = false;
      }
    }
  },

  drawTransition(ctx, W, H) {
    if (!this.transitioning || this.transitionAlpha <= 0) return;
    const alpha = Math.sin(this.transitionAlpha * Math.PI);
    ctx.save();
    ctx.fillStyle = `rgba(0,0,0,${alpha * 0.7})`;
    ctx.fillRect(0, 0, W, H);
    ctx.restore();
  }
};
