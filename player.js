const CARS = {
  starter:  { name:'STARTER',     emoji:'🏎️', price:0,    speed:2, handling:3, armor:1, w:38, h:64, color:'#00f5ff' },
  speedster:{ name:'SPEEDSTER',   emoji:'🚀', price:500,  speed:5, handling:2, armor:1, w:34, h:58, color:'#ff6b00' },
  tank:     { name:'TANK',        emoji:'🚙', price:1000, speed:2, handling:5, armor:3, w:44, h:70, color:'#39ff14' },
  phantom:  { name:'PHANTOM',     emoji:'🏁', price:2000, speed:5, handling:4, armor:2, w:36, h:60, color:'#bf5fff' },
  police:   { name:'INTERCEPTOR', emoji:'🚓', price:1500, speed:4, handling:4, armor:2, w:38, h:64, color:'#1e88e5' },
};

const Player = {
  x:0, y:0, w:38, h:64,
  lane:1, targetX:0,
  color:'#00f5ff', neonOn:true,
  carId:'starter', carData:null,
  invincible:false, invincibleTimer:0,
  shieldActive:false,
  nitroActive:false,  nitroTimer:0,
  magnetActive:false, magnetTimer:0,
  slowActive:false,   slowTimer:0,
  lives:3,
  flashPhase:0,
  W:0, H:0,

  init(canvas, carId, color, neonOn) {
    this.W = canvas.width  || window.innerWidth;
    this.H = canvas.height || window.innerHeight;
    this.carId   = carId   || 'starter';
    this.carData = CARS[this.carId] || CARS.starter;
    this.color   = color   || this.carData.color || '#00f5ff';
    this.neonOn  = neonOn !== false;
    this.w = this.carData.w;
    this.h = this.carData.h;
    this.lane = Math.floor(Road.lanes / 2) - 1;
    this.x = Road.getLaneX(this.lane) - this.w / 2;
    this.y = this.H - this.h - 100;
    this.lives = 3;
    this.shieldActive = false;
    this.nitroActive  = false;
    this.magnetActive = false;
    this.slowActive   = false;
    this.invincible   = false;
    this.invincibleTimer = 0;
    this.flashPhase   = 0;
  },

  setLane(dir) {
    const n = Math.max(0, Math.min(Road.lanes - 1, this.lane + dir));
    if (n !== this.lane) { this.lane = n; Audio.resume(); }
  },

  update(dt, gameSpeed) {
    const tx = Road.getLaneX(this.lane) - this.w / 2;
    const handling = this.carData?.handling || 3;
    this.x = Utils.lerp(this.x, tx, Math.min(1, (0.06 + handling * 0.04) * 60 * dt));

    if (this.nitroActive)   { this.nitroTimer  -= dt; if (this.nitroTimer  <= 0) this.nitroActive  = false; }
    if (this.magnetActive)  { this.magnetTimer -= dt; if (this.magnetTimer <= 0) this.magnetActive = false; }
    if (this.slowActive)    { this.slowTimer   -= dt; if (this.slowTimer   <= 0) this.slowActive   = false; }
    if (this.invincible)    {
      this.invincibleTimer -= dt;
      this.flashPhase += dt * 18;
      if (this.invincibleTimer <= 0) { this.invincible = false; }
    }

    Audio.setEngineSpeed(gameSpeed, 18);
    if (Math.random() < 0.5) {
      Particles.exhaust(this.x + this.w/2 - 6, this.y + this.h, gameSpeed);
      Particles.exhaust(this.x + this.w/2 + 6, this.y + this.h, gameSpeed);
    }
  },

  activateShield()  { this.shieldActive = true;  Audio.powerup(); },
  activateNitro()   { this.nitroActive  = true;  this.nitroTimer  = 5; Audio.powerup(); },
  activateMagnet()  { this.magnetActive = true;  this.magnetTimer = 8; Audio.powerup(); },
  activateSlow()    { this.slowActive   = true;  this.slowTimer   = 5; Audio.powerup(); },

  hit() {
    if (this.invincible) return false;
    if (this.shieldActive) {
      this.shieldActive = false;
      this.invincible = true; this.invincibleTimer = 1.5;
      Audio.crash(); return false;
    }
    this.lives--;
    this.invincible = true; this.invincibleTimer = 1.8;
    Audio.crash();
    return this.lives <= 0;
  },

  draw(ctx) {
    // Flicker when invincible
    if (this.invincible && Math.sin(this.flashPhase) > 0) return;

    const { x, y, w, h, color, neonOn, shieldActive, nitroActive, carData } = this;
    const cx = x + w / 2;

    ctx.save();

    // Nitro flame trail
    if (nitroActive) {
      const flameH = 50 + Math.random() * 20;
      const fg = ctx.createLinearGradient(cx, y + h, cx, y + h + flameH);
      fg.addColorStop(0, 'rgba(255,200,0,0.9)');
      fg.addColorStop(0.4, 'rgba(255,100,0,0.7)');
      fg.addColorStop(1, 'rgba(255,50,0,0)');
      ctx.fillStyle = fg;
      ctx.beginPath();
      ctx.ellipse(cx, y + h + flameH * 0.4, w * 0.28, flameH * 0.6, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // Headlights (bottom of car = front in top-down)
    ctx.save();
    ctx.shadowBlur = 30;
    ctx.shadowColor = color;
    const hl = ctx.createRadialGradient(x + 8, y + 6, 0, x + 8, y + 6, 24);
    hl.addColorStop(0, color + 'cc');
    hl.addColorStop(1, 'transparent');
    ctx.fillStyle = hl;
    ctx.fillRect(x + 2, y + 2, 14, 24);
    const hr = ctx.createRadialGradient(x + w - 8, y + 6, 0, x + w - 8, y + 6, 24);
    hr.addColorStop(0, color + 'cc');
    hr.addColorStop(1, 'transparent');
    ctx.fillStyle = hr;
    ctx.fillRect(x + w - 16, y + 2, 14, 24);
    ctx.restore();

    // Car body shadow
    ctx.save();
    ctx.shadowBlur = neonOn ? 20 : 8;
    ctx.shadowColor = color;

    // Body base
    ctx.fillStyle = '#12192a';
    this._roundRect(ctx, x, y, w, h, 5);
    ctx.fill();

    // Color stripe top
    ctx.fillStyle = color;
    ctx.globalAlpha = 0.9;
    this._roundRect(ctx, x + 3, y + 3, w - 6, 8, 3);
    ctx.fill();

    // Color stripe bottom
    this._roundRect(ctx, x + 3, y + h - 11, w - 6, 8, 3);
    ctx.fill();
    ctx.globalAlpha = 1;

    // Windshield
    ctx.fillStyle = 'rgba(120,200,255,0.25)';
    this._roundRect(ctx, x + 6, y + 14, w - 12, 18, 3);
    ctx.fill();
    ctx.strokeStyle = 'rgba(150,220,255,0.4)';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.restore();

    // Car emoji
    ctx.save();
    ctx.font = `${h * 0.52}px serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowBlur = neonOn ? 12 : 0;
    ctx.shadowColor = color;
    ctx.fillText(carData?.emoji || '🏎️', cx, y + h * 0.52);
    ctx.restore();

    // Neon underglow
    if (neonOn) {
      ctx.save();
      ctx.shadowBlur = 16;
      ctx.shadowColor = color;
      ctx.strokeStyle = color + '80';
      ctx.lineWidth = 2;
      this._roundRect(ctx, x + 1, y + 1, w - 2, h - 2, 5);
      ctx.stroke();
      ctx.restore();
    }

    // Wheel marks
    ctx.save();
    ctx.fillStyle = '#060a10';
    ctx.fillRect(x - 4, y + 10, 6, 16);
    ctx.fillRect(x + w - 2, y + 10, 6, 16);
    ctx.fillRect(x - 4, y + h - 26, 6, 16);
    ctx.fillRect(x + w - 2, y + h - 26, 6, 16);
    ctx.fillStyle = '#334';
    ctx.fillRect(x - 3, y + 11, 4, 14);
    ctx.fillRect(x + w - 1, y + 11, 4, 14);
    ctx.fillRect(x - 3, y + h - 25, 4, 14);
    ctx.fillRect(x + w - 1, y + h - 25, 4, 14);
    ctx.restore();

    // Shield bubble
    if (shieldActive) {
      ctx.save();
      const pulse = 0.25 + 0.1 * Math.sin(Date.now() * 0.005);
      ctx.globalAlpha = pulse;
      ctx.strokeStyle = '#00f5ff';
      ctx.lineWidth = 3;
      ctx.shadowBlur = 20;
      ctx.shadowColor = '#00f5ff';
      ctx.beginPath();
      ctx.ellipse(cx, y + h/2, w * 0.78, h * 0.62, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.globalAlpha = pulse * 0.3;
      ctx.fillStyle = '#00f5ff';
      ctx.fill();
      ctx.restore();
    }

    ctx.restore();
  },

  _roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  },

  getBounds() { return { x: this.x + 4, y: this.y + 4, w: this.w - 8, h: this.h - 8 }; }
};
