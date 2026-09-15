const POWERUP_TYPES = [
  { id:'shield', label:'🛡️ SHIELD',  color:'#00f5ff', bg:'rgba(0,245,255,0.15)'  },
  { id:'nitro',  label:'⚡ NITRO',   color:'#ff6b00', bg:'rgba(255,107,0,0.15)'  },
  { id:'magnet', label:'🧲 MAGNET',  color:'#bf5fff', bg:'rgba(191,95,255,0.15)' },
  { id:'slow',   label:'❄️ SLOW-MO', color:'#44ccff', bg:'rgba(68,204,255,0.15)' },
];

class PowerupItem {
  constructor() {
    const type   = POWERUP_TYPES[Math.floor(Math.random()*POWERUP_TYPES.length)];
    const lane   = Math.floor(Math.random()*Road.lanes);
    this.type    = type;
    this.x       = Road.getLaneX(lane);
    this.y       = -30;
    this.r       = 20;
    this.dead    = false;
    this.anim    = 0;
    this.alpha   = 1;
    this.collected = false;
  }

  update(dt, gameSpeed) {
    this.y += gameSpeed * dt * 60 * 0.5;
    this.anim += dt * 2.5;
    if (this.collected) {
      this.alpha -= dt * 3.5;
      if (this.alpha <= 0) this.dead = true;
    } else if (this.y > Road.bottom + 50) {
      this.dead = true;
    }
  }

  draw(ctx) {
    const { x, y, r, type, anim, alpha } = this;
    ctx.save();
    ctx.globalAlpha = Math.max(0, alpha);
    const pulse = 1 + 0.15 * Math.sin(anim);
    ctx.translate(x, y);
    ctx.scale(pulse, pulse);

    ctx.shadowBlur = 24;
    ctx.shadowColor = type.color;

    // Outer ring
    ctx.strokeStyle = type.color;
    ctx.lineWidth = 2;
    ctx.globalAlpha *= (0.4 + 0.3*Math.sin(anim*1.5));
    ctx.beginPath(); ctx.arc(0, 0, r*1.5, 0, Math.PI*2); ctx.stroke();
    ctx.globalAlpha = Math.max(0, alpha);

    // Body
    ctx.fillStyle = type.bg;
    ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI*2); ctx.fill();
    ctx.strokeStyle = type.color; ctx.lineWidth = 2;
    ctx.stroke();

    // Icon
    ctx.shadowBlur = 0;
    const icon = type.id==='shield'?'🛡️':type.id==='nitro'?'⚡':type.id==='magnet'?'🧲':'❄️';
    ctx.font = `${r*1.1}px serif`;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(icon, 0, 1);

    // Label
    ctx.fillStyle = type.color;
    ctx.font = `bold ${r*0.45}px Orbitron, monospace`;
    ctx.letterSpacing = '1px';
    ctx.fillText(type.id.toUpperCase(), 0, r + 10);

    ctx.restore();
  }

  getBounds() { return {x:this.x-this.r, y:this.y-this.r, w:this.r*2, h:this.r*2}; }
}

const PowerupManager = {
  list: [],
  spawnTimer: 0,
  spawnInterval: 7,

  init() { this.list=[]; this.spawnTimer=0; },

  update(dt, gameSpeed) {
    this.spawnTimer += dt;
    if (this.spawnTimer >= this.spawnInterval) {
      this.spawnTimer = 0;
      if (Math.random() > 0.25) this.list.push(new PowerupItem());
    }
    this.list.forEach(p => p.update(dt, gameSpeed));
    this.list = this.list.filter(p => !p.dead);
  },

  draw(ctx) { this.list.forEach(p => p.draw(ctx)); },

  announce(typeId) {
    const type = POWERUP_TYPES.find(t => t.id===typeId);
    if (!type) return;
    const el = document.getElementById('powerup-display');
    el.innerHTML = '';
    const div = document.createElement('div');
    div.className = `powerup-announce ${typeId}`;
    div.textContent = type.label;
    el.appendChild(div);
    setTimeout(() => { if (el.contains(div)) el.removeChild(div); }, 2100);
  }
};
