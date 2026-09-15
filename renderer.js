const Renderer = {
  canvas: null,
  ctx: null,
  shakeTimer: 0,
  shakeMag: 0,
  W: 0, H: 0,

  init() {
    this.canvas = document.getElementById('gameCanvas');
    this.ctx = this.canvas.getContext('2d');
    this.resize();
    window.addEventListener('resize', () => this.resize());
  },

  resize() {
    // Use window dimensions directly — most reliable
    this.W = this.canvas.width  = window.innerWidth;
    this.H = this.canvas.height = window.innerHeight;
    Road.resize(this.W, this.H);
  },

  shake(duration = 0.3, mag = 6) {
    this.shakeTimer = duration;
    this.shakeMag = mag;
  },

  render(game) {
    const { ctx, W, H } = this;
    ctx.save();

    if (this.shakeTimer > 0) {
      this.shakeTimer -= game.dt;
      const s = this.shakeMag * Math.max(0, this.shakeTimer / 0.3);
      ctx.translate((Math.random()-0.5)*s, (Math.random()-0.5)*s);
    }

    ctx.clearRect(0, 0, W, H);

    Road.draw(ctx, game.environment);
    CoinManager.draw(ctx);
    PowerupManager.draw(ctx);
    EnemyManager.draw(ctx);
    Particles.draw(ctx);
    Player.draw(ctx);

    if (Player.slowActive) {
      ctx.fillStyle = 'rgba(68,204,255,0.05)';
      ctx.fillRect(0, 0, W, H);
    }
    if (Player.nitroActive) this._drawSpeedLines(ctx, W, H);

    this._drawVignette(ctx, W, H);
    ctx.restore();
  },

  _drawSpeedLines(ctx, W, H) {
    ctx.save();
    ctx.globalAlpha = 0.25;
    ctx.strokeStyle = '#ff6b00';
    ctx.lineWidth = 1;
    for (let i = 0; i < 24; i++) {
      const x = Math.random() * W;
      const len = 40 + Math.random() * 80;
      const y = Math.random() * H;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x, y + len);
      ctx.stroke();
    }
    ctx.restore();
  },

  _drawVignette(ctx, W, H) {
    const vg = ctx.createRadialGradient(W/2, H/2, H*0.15, W/2, H/2, H*0.85);
    vg.addColorStop(0, 'rgba(0,0,0,0)');
    vg.addColorStop(1, 'rgba(0,0,0,0.65)');
    ctx.fillStyle = vg;
    ctx.fillRect(0, 0, W, H);
  }
};
