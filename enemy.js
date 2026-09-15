const ENEMY_TYPES = [
  { emoji:'🚗', name:'Sedan',     color:'#e53935', speedMult:1.0,  w:36, h:60, weight:40 },
  { emoji:'🚕', name:'Taxi',      color:'#fdd835', speedMult:0.85, w:38, h:62, weight:20 },
  { emoji:'🚙', name:'SUV',       color:'#1565c0', speedMult:0.80, w:42, h:70, weight:20 },
  { emoji:'🚓', name:'Police',    color:'#42a5f5', speedMult:1.35, w:36, h:62, weight:10 },
  { emoji:'🚑', name:'Ambulance', color:'#ef5350', speedMult:1.1,  w:40, h:68, weight:5  },
  { emoji:'🏎️', name:'Racer',    color:'#ff6b00', speedMult:1.6,  w:34, h:58, weight:5  },
];

function pickEnemyType() {
  const total = ENEMY_TYPES.reduce((s,t) => s + t.weight, 0);
  let r = Math.random() * total;
  for (const t of ENEMY_TYPES) { r -= t.weight; if (r <= 0) return t; }
  return ENEMY_TYPES[0];
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x+r, y);
  ctx.lineTo(x+w-r, y);
  ctx.quadraticCurveTo(x+w, y, x+w, y+r);
  ctx.lineTo(x+w, y+h-r);
  ctx.quadraticCurveTo(x+w, y+h, x+w-r, y+h);
  ctx.lineTo(x+r, y+h);
  ctx.quadraticCurveTo(x, y+h, x, y+h-r);
  ctx.lineTo(x, y+r);
  ctx.quadraticCurveTo(x, y, x+r, y);
  ctx.closePath();
}

class EnemyCar {
  constructor(gameSpeed) {
    this.type  = pickEnemyType();
    this.w     = this.type.w;
    this.h     = this.type.h;
    this.lane  = Math.floor(Math.random() * Road.lanes);
    this.x     = Road.getLaneX(this.lane) - this.w / 2;
    this.y     = -this.h - 10;
    this.speed = gameSpeed * this.type.speedMult * Utils.rand(0.5, 0.9);
    this.dead  = false;
    this.laneChangeTimer = Utils.rand(1.5, 4);
    this.canChangeLane   = this.type.name === 'Police' || Math.random() > 0.65;
    this.tailLightAnim   = 0;
  }

  update(dt, gameSpeed, slowed) {
    const spd = slowed ? this.speed * 0.3 : this.speed;
    this.y += (gameSpeed * 0.5 + spd) * dt * 60 * 0.5;
    this.tailLightAnim += dt * 3;

    if (this.canChangeLane) {
      this.laneChangeTimer -= dt;
      if (this.laneChangeTimer <= 0) {
        const dir = Math.random() > 0.5 ? 1 : -1;
        this.lane = Math.max(0, Math.min(Road.lanes - 1, this.lane + dir));
        this.laneChangeTimer = Utils.rand(1.5, 4);
      }
    }
    const tx = Road.getLaneX(this.lane) - this.w / 2;
    this.x = Utils.lerp(this.x, tx, 0.05);

    if (this.y > Road.bottom + 100) this.dead = true;
  }

  draw(ctx) {
    const { x, y, w, h, type } = this;
    const cx = x + w/2;
    ctx.save();

    // Tail lights glow
    const tlGlow = 0.6 + 0.4 * Math.sin(this.tailLightAnim);
    ctx.shadowBlur = 12 * tlGlow;
    ctx.shadowColor = '#ff2020';

    // Body
    ctx.fillStyle = '#0d1420';
    roundRect(ctx, x, y, w, h, 5);
    ctx.fill();

    // Color accents
    ctx.shadowBlur = 0;
    ctx.fillStyle = type.color + 'aa';
    ctx.fillRect(x + 3, y + 3, w - 6, 6);

    // Tail lights
    ctx.fillStyle = `rgba(255,50,50,${0.7 + 0.3 * tlGlow})`;
    ctx.shadowBlur = 8; ctx.shadowColor = '#ff0000';
    ctx.fillRect(x + 3, y + h - 10, 10, 7);
    ctx.fillRect(x + w - 13, y + h - 10, 10, 7);
    ctx.shadowBlur = 0;

    // Windshield
    ctx.fillStyle = 'rgba(100,160,220,0.2)';
    ctx.fillRect(x + 5, y + 12, w - 10, 16);

    // Car emoji
    ctx.font = `${h * 0.48}px serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#fff';
    ctx.fillText(type.emoji, cx, y + h * 0.5);

    // Wheels
    ctx.fillStyle = '#060a10';
    ctx.fillRect(x-4, y+12, 5, 14);
    ctx.fillRect(x+w-1, y+12, 5, 14);
    ctx.fillRect(x-4, y+h-26, 5, 14);
    ctx.fillRect(x+w-1, y+h-26, 5, 14);
    ctx.fillStyle = '#2a2a3a';
    ctx.fillRect(x-3, y+13, 3, 12);
    ctx.fillRect(x+w, y+13, 3, 12);
    ctx.fillRect(x-3, y+h-25, 3, 12);
    ctx.fillRect(x+w, y+h-25, 3, 12);

    ctx.restore();
  }

  getBounds() { return { x:this.x+3, y:this.y+3, w:this.w-6, h:this.h-6 }; }
}

const EnemyManager = {
  list: [],
  spawnTimer: 0,
  spawnInterval: 1.8,

  init() { this.list = []; this.spawnTimer = 0; this.spawnInterval = 1.8; },

  update(dt, gameSpeed, slowed) {
    this.spawnTimer += dt;
    this.spawnInterval = Math.max(0.45, 2.0 - gameSpeed * 0.06);

    if (this.spawnTimer >= this.spawnInterval) {
      this.spawnTimer = 0;
      const count = gameSpeed > 12 && Math.random() > 0.55 ? 2 : 1;
      const usedLanes = new Set();
      for (let i = 0; i < count; i++) {
        const e = new EnemyCar(gameSpeed);
        if (!usedLanes.has(e.lane)) {
          usedLanes.add(e.lane);
          this.list.push(e);
        }
      }
    }
    this.list.forEach(e => e.update(dt, gameSpeed, slowed));
    this.list = this.list.filter(e => !e.dead);
  },

  draw(ctx) { this.list.forEach(e => e.draw(ctx)); }
};
