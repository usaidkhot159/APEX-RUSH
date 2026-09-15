class Particle {
  constructor(x, y, opts={}) {
    this.x = x; this.y = y;
    this.vx = opts.vx ?? (Math.random()-0.5)*5;
    this.vy = opts.vy ?? (Math.random()-2)*4;
    this.life    = 1;
    this.decay   = opts.decay  ?? Utils.rand(0.02, 0.05);
    this.size    = opts.size   ?? Utils.rand(3, 9);
    this.color   = opts.color  ?? '#ff6b00';
    this.gravity = opts.gravity ?? 0.15;
    this.glow    = opts.glow   ?? false;
    this.shape   = opts.shape  ?? 'circle';
  }
  update() {
    this.x += this.vx; this.y += this.vy;
    this.vy += this.gravity;
    this.vx *= 0.98;
    this.life -= this.decay;
    this.size *= 0.97;
  }
  draw(ctx) {
    if (this.life <= 0 || this.size < 0.3) return;
    ctx.save();
    ctx.globalAlpha = Math.max(0, this.life);
    if (this.glow) { ctx.shadowBlur = 10; ctx.shadowColor = this.color; }
    ctx.fillStyle = this.color;
    if (this.shape === 'square') {
      ctx.fillRect(this.x - this.size/2, this.y - this.size/2, this.size, this.size);
    } else if (this.shape === 'spark') {
      ctx.strokeStyle = this.color;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(this.x, this.y);
      ctx.lineTo(this.x + this.vx*3, this.y + this.vy*3);
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size/2, 0, Math.PI*2);
      ctx.fill();
    }
    ctx.restore();
  }
  get dead() { return this.life <= 0 || this.size < 0.3; }
}

const Particles = {
  list: [],
  spawn(x, y, count, opts={}) {
    for (let i = 0; i < count; i++) {
      const p = new Particle(x, y, {
        ...opts,
        vx: typeof opts.vx === 'function' ? opts.vx() : opts.vx,
        vy: typeof opts.vy === 'function' ? opts.vy() : opts.vy,
        size: typeof opts.size === 'function' ? opts.size() : opts.size,
      });
      this.list.push(p);
    }
  },
  crashBurst(x, y, color='#ff6b00') {
    // Debris chunks
    for (let i=0; i<20; i++) this.list.push(new Particle(x, y, {
      color, size:Utils.rand(4,12), decay:0.018, glow:true, shape:'square',
      vx:(Math.random()-0.5)*10, vy:(Math.random()-2.5)*6, gravity:0.25
    }));
    // Sparks
    for (let i=0; i<28; i++) this.list.push(new Particle(x, y, {
      color:'#ffe500', size:2, decay:0.035, glow:true, shape:'spark',
      vx:(Math.random()-0.5)*14, vy:(Math.random()-2.5)*10, gravity:0.2
    }));
    // Fire
    for (let i=0; i<14; i++) this.list.push(new Particle(x, y, {
      color: i%2===0 ? '#ff2d78' : '#ff6b00', size:Utils.rand(6,16), decay:0.025, glow:true,
      vx:(Math.random()-0.5)*5, vy:(Math.random()-2)*5, gravity:0.05
    }));
    // Smoke
    for (let i=0; i<10; i++) this.list.push(new Particle(x, y, {
      color:'#334455', size:Utils.rand(8,18), decay:0.012,
      vx:(Math.random()-0.5)*3, vy:-Math.random()*3-1, gravity:-0.02
    }));
  },
  coinCollect(x, y) {
    for (let i=0; i<12; i++) this.list.push(new Particle(x, y, {
      color:'#ffe500', size:Utils.rand(2,5), decay:0.06, glow:true, shape:'spark',
      vx:(Math.random()-0.5)*8, vy:(Math.random()-1.5)*5, gravity:0.12
    }));
  },
  powerupCollect(x, y, color) {
    for (let i=0; i<16; i++) this.list.push(new Particle(x, y, {
      color, size:Utils.rand(4,8), decay:0.03, glow:true,
      vx:(Math.random()-0.5)*9, vy:(Math.random()-2)*6, gravity:0.1
    }));
  },
  exhaust(x, y, speed) {
    if (Math.random() > 0.35) return;
    const hot = speed > 10;
    this.list.push(new Particle(x, y, {
      color: hot ? '#ff6b00' : '#223344',
      size: Utils.rand(3, hot ? 8 : 5),
      decay: 0.065,
      vx: (Math.random()-0.5)*1.2,
      vy: Utils.rand(1.5, 3.5),
      gravity: -0.02,
      glow: hot,
    }));
  },
  update() { this.list.forEach(p => p.update()); this.list = this.list.filter(p => !p.dead); },
  draw(ctx)  { this.list.forEach(p => p.draw(ctx)); },
  clear()    { this.list = []; }
};
