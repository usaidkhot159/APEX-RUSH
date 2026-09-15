const GameLoop = {
  running: false,
  raf: null,
  lastTime: 0,
  dt: 0,

  start(updateFn) {
    this.running  = true;
    this.lastTime = performance.now();
    const loop = (now) => {
      if (!this.running) return;
      this.dt = Math.min((now - this.lastTime) / 1000, 0.05);
      this.lastTime = now;
      updateFn(this.dt);
      this.raf = requestAnimationFrame(loop);
    };
    this.raf = requestAnimationFrame(loop);
  },

  stop() {
    this.running = false;
    if (this.raf) { cancelAnimationFrame(this.raf); this.raf = null; }
  }
};
