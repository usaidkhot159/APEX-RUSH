const Road = {
  lanes: 4,
  offset: 0,
  dashLen: 40,
  dashGap: 30,
  left: 0, right: 0, bottom: 0,
  laneW: 0,
  W: 0, H: 0,
  buildings: [],
  buildingOffset: 0,
  stars: [],

  init(canvas) {
    this.resize(canvas.width || window.innerWidth, canvas.height || window.innerHeight);
    this.offset = 0;
    this.buildingOffset = 0;
    this.buildings = this._genBuildings();
    this.stars = this._genStars();
  },

  resize(w, h) {
    this.W = w; this.H = h;
    const roadW = Math.min(w * 0.68, 400);
    this.left  = (w - roadW) / 2;
    this.right = this.left + roadW;
    this.bottom = h;
    this.laneW = roadW / this.lanes;
  },

  _genBuildings() {
    const b = [];
    const roadW = this.right - this.left;
    for (let i = 0; i < 12; i++) {
      b.push({ side:'L', x: this.left - 20 - Math.random()*120, y: Math.random()*600-100, w: 40+Math.random()*80, h: 80+Math.random()*200, hue: 200+Math.random()*60 });
      b.push({ side:'R', x: this.right + 20 + Math.random()*80,  y: Math.random()*600-100, w: 40+Math.random()*80, h: 80+Math.random()*200, hue: 200+Math.random()*60 });
    }
    return b;
  },

  _genStars() {
    const s = [];
    for (let i = 0; i < 80; i++) {
      s.push({ x: Math.random()*1600, y: Math.random()*400, r: Math.random()*1.5+0.3, a: Math.random() });
    }
    return s;
  },

  update(speed) {
    this.offset = (this.offset + speed) % (this.dashLen + this.dashGap);
    this.buildingOffset = (this.buildingOffset + speed * 0.25) % 700;
  },

  draw(ctx, env) {
    const { left, right, W, H } = this;
    const roadW = right - left;

    // Sky
    const sky = ctx.createLinearGradient(0, 0, 0, H * 0.45);
    if (env === 'desert') {
      sky.addColorStop(0, '#120500'); sky.addColorStop(1, '#1a0800');
    } else if (env === 'highway') {
      sky.addColorStop(0, '#000510'); sky.addColorStop(1, '#000a18');
    } else {
      sky.addColorStop(0, '#020408'); sky.addColorStop(1, '#060c18');
    }
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, W, H * 0.45);

    // Stars
    this._drawStars(ctx, env);

    // Side areas
    const sideGrad = ctx.createLinearGradient(0, 0, 0, H);
    if (env === 'desert') {
      sideGrad.addColorStop(0, '#1a0800'); sideGrad.addColorStop(1, '#100500');
    } else {
      sideGrad.addColorStop(0, '#060c14'); sideGrad.addColorStop(1, '#030608');
    }
    ctx.fillStyle = sideGrad;
    ctx.fillRect(0, 0, left, H);
    ctx.fillRect(right, 0, W - right, H);

    // Buildings
    this._drawBuildings(ctx, env);

    // Road surface
    const roadGrad = ctx.createLinearGradient(left, 0, right, 0);
    roadGrad.addColorStop(0,   '#0a0f16');
    roadGrad.addColorStop(0.15,'#111820');
    roadGrad.addColorStop(0.5, '#161f2e');
    roadGrad.addColorStop(0.85,'#111820');
    roadGrad.addColorStop(1,   '#0a0f16');
    ctx.fillStyle = roadGrad;
    ctx.fillRect(left, 0, roadW, H);

    // Road surface texture (subtle horizontal bands)
    for (let y = (this.offset * 2) % 80; y < H; y += 80) {
      const g2 = ctx.createLinearGradient(0, y, 0, y + 40);
      g2.addColorStop(0, 'rgba(255,255,255,0.012)');
      g2.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g2;
      ctx.fillRect(left, y, roadW, 40);
    }

    // Road edge glow
    this._drawRoadEdges(ctx, left, right, H);

    // Lane lines
    this._drawLanes(ctx, left, H);

    // Horizon glow
    const hg = ctx.createLinearGradient(left, 0, right, 0);
    hg.addColorStop(0, 'rgba(0,245,255,0)');
    hg.addColorStop(0.5, 'rgba(0,245,255,0.06)');
    hg.addColorStop(1, 'rgba(0,245,255,0)');
    ctx.fillStyle = hg;
    ctx.fillRect(left, 0, roadW, 3);
  },

  _drawStars(ctx, env) {
    if (env === 'desert') return;
    ctx.save();
    for (const s of this.stars) {
      const flicker = 0.4 + 0.6 * Math.abs(Math.sin(Date.now()*0.001 + s.a * 10));
      ctx.globalAlpha = s.a * flicker * 0.8;
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(s.x % this.W, s.y, s.r, 0, Math.PI*2);
      ctx.fill();
    }
    ctx.restore();
  },

  _drawBuildings(ctx, env) {
    ctx.save();
    for (const b of this.buildings) {
      const by = (b.y + this.buildingOffset) % 700 - 150;
      const bx = b.x;
      // Building body
      const bg = ctx.createLinearGradient(bx, by, bx + b.w, by + b.h);
      bg.addColorStop(0, `hsl(${b.hue},25%,10%)`);
      bg.addColorStop(1, `hsl(${b.hue},20%,6%)`);
      ctx.fillStyle = bg;
      ctx.fillRect(bx, by, b.w, b.h);
      // Neon roof line
      ctx.strokeStyle = `hsla(${b.hue},80%,60%,0.4)`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(bx, by); ctx.lineTo(bx + b.w, by);
      ctx.stroke();
      // Windows
      const cols = Math.floor(b.w / 14);
      const rows = Math.floor(b.h / 18);
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const lit = Math.random() > 0.45;
          if (!lit) continue;
          const wx = bx + 5 + c * 14;
          const wy = by + 8 + r * 18;
          ctx.fillStyle = `rgba(255,240,180,${0.3 + Math.random()*0.4})`;
          ctx.fillRect(wx, wy, 8, 10);
        }
      }
      // Edge glow
      ctx.shadowBlur = 8;
      ctx.shadowColor = `hsl(${b.hue},80%,60%)`;
      ctx.strokeStyle = `hsla(${b.hue},80%,60%,0.15)`;
      ctx.strokeRect(bx, by, b.w, b.h);
      ctx.shadowBlur = 0;
    }
    ctx.restore();
  },

  _drawRoadEdges(ctx, left, right, H) {
    // Left glow edge
    const gl = ctx.createLinearGradient(left-16, 0, left+6, 0);
    gl.addColorStop(0, 'rgba(0,245,255,0)');
    gl.addColorStop(1, 'rgba(0,245,255,0.35)');
    ctx.fillStyle = gl;
    ctx.fillRect(left-16, 0, 22, H);

    // Right glow edge
    const gr = ctx.createLinearGradient(right-6, 0, right+16, 0);
    gr.addColorStop(0, 'rgba(0,245,255,0.35)');
    gr.addColorStop(1, 'rgba(0,245,255,0)');
    ctx.fillStyle = gr;
    ctx.fillRect(right-6, 0, 22, H);

    // White edge lines
    ctx.save();
    ctx.shadowBlur = 6;
    ctx.shadowColor = '#00f5ff';
    ctx.strokeStyle = 'rgba(255,255,255,0.7)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(left, 0); ctx.lineTo(left, H);
    ctx.moveTo(right, 0); ctx.lineTo(right, H);
    ctx.stroke();
    ctx.restore();
  },

  _drawLanes(ctx, left, H) {
    ctx.save();
    ctx.strokeStyle = 'rgba(255,255,255,0.13)';
    ctx.lineWidth = 2;
    ctx.setLineDash([this.dashLen, this.dashGap]);
    ctx.lineDashOffset = -this.offset;
    for (let i = 1; i < this.lanes; i++) {
      const x = left + i * this.laneW;
      ctx.beginPath();
      ctx.moveTo(x, 0); ctx.lineTo(x, H);
      ctx.stroke();
    }
    ctx.setLineDash([]);
    ctx.restore();
  },

  getLaneX(lane) {
    return this.left + (lane + 0.5) * this.laneW;
  },

  getRandomLaneX() {
    return this.getLaneX(Math.floor(Math.random() * this.lanes));
  }
};
