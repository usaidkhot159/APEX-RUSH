class Coin {
  constructor(lane, yOffset) {
    this.r = 11;
    this.lane = lane !== undefined ? lane : Math.floor(Math.random() * Road.lanes);
    this.x = Road.getLaneX(this.lane);
    this.y = (yOffset || 0) - 20;
    this.dead = false;
    this.collected = false;
    this.anim = Math.random() * Math.PI * 2;
    this.alpha = 1;
    this.scaleX = 1;
  }

  update(dt, gameSpeed, magnetActive, px, py) {
    this.y += gameSpeed * dt * 60 * 0.5;
    this.anim += dt * 4;
    this.scaleX = Math.cos(this.anim * 0.6);

    if (magnetActive) {
      const dx = px - this.x, dy = py - this.y;
      const d = Math.sqrt(dx*dx + dy*dy);
      if (d < 200 && d > 0) {
        const force = Math.min(8, 200 / d * 3);
        this.x += (dx/d) * force;
        this.y += (dy/d) * force;
      }
    }

    if (this.collected) {
      this.alpha -= dt * 5;
      this.r += dt * 20;
      if (this.alpha <= 0) this.dead = true;
    } else if (this.y > Road.bottom + 30) {
      this.dead = true;
    }
  }

  draw(ctx) {
    if (this.dead) return;
    const { x, y, r, scaleX, alpha } = this;
    ctx.save();
    ctx.globalAlpha = Math.max(0, alpha);
    ctx.translate(x, y);
    ctx.scale(Math.max(0.05, Math.abs(scaleX)), 1);

    // Glow
    ctx.shadowBlur = 16;
    ctx.shadowColor = '#ffe500';

    // Coin body
    const grad = ctx.createRadialGradient(-r*0.25, -r*0.25, 0, 0, 0, r);
    grad.addColorStop(0, '#fffaaa');
    grad.addColorStop(0.4, '#ffe500');
    grad.addColorStop(0.8, '#cc9900');
    grad.addColorStop(1, '#996600');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI*2);
    ctx.fill();

    // Inner ring
    ctx.strokeStyle = 'rgba(255,255,180,0.5)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(0, 0, r*0.65, 0, Math.PI*2);
    ctx.stroke();

    // Dollar sign / coin mark
    ctx.fillStyle = 'rgba(255,255,200,0.8)';
    ctx.font = `bold ${r}px serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('$', 0, 1);

    ctx.restore();
  }

  getBounds() { return { x:this.x-this.r, y:this.y-this.r, w:this.r*2, h:this.r*2 }; }
}

const CoinManager = {
  list: [],
  spawnTimer: 0,
  spawnInterval: 1.0,

  init() { this.list = []; this.spawnTimer = 0; },

  update(dt, gameSpeed, magnetActive, px, py) {
    this.spawnTimer += dt;
    if (this.spawnTimer >= this.spawnInterval) {
      this.spawnTimer = 0;
      const pattern = Math.random();
      if (pattern < 0.4) {
        // Single coin
        this.list.push(new Coin());
      } else if (pattern < 0.75) {
        // Row of 3 in same lane
        const lane = Math.floor(Math.random() * Road.lanes);
        for (let i = 0; i < 3; i++) this.list.push(new Coin(lane, -i*38));
      } else {
        // Spread across lanes
        for (let i = 0; i < Road.lanes; i++) {
          if (Math.random() > 0.4) this.list.push(new Coin(i));
        }
      }
    }
    this.list.forEach(c => c.update(dt, gameSpeed, magnetActive, px, py));
    this.list = this.list.filter(c => !c.dead);
  },

  draw(ctx) { this.list.forEach(c => c.draw(ctx)); }
};
