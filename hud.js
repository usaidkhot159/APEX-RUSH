const HUD = {
  el: null,
  init() { this.el = document.getElementById('hud'); },

  render({ score, coins, lives, speed, maxSpeed, mode, timeLeft, multiplier }) {
    if (!this.el) return;
    const speedPct = Math.round(Math.min(100, ((speed-3)/(maxSpeed-3))*100));
    const livesHtml = '❤️'.repeat(Math.max(0,lives)) + '🖤'.repeat(Math.max(0,3-lives));
    const modeBadge = mode==='timetrial' ? '⏱ TIME TRIAL' : mode==='challenge' ? '🔴 CHALLENGE' : '🟢 ENDLESS';
    const multiColor = multiplier >= 3 ? '#ff2d78' : multiplier >= 2 ? '#ff6b00' : multiplier >= 1.5 ? '#ffe500' : '#bf5fff';

    this.el.innerHTML = `
      <div class="hud-block">
        <div class="hud-label">SCORE</div>
        <div class="hud-value score">${Utils.formatScore(Math.floor(score))}</div>
      </div>
      <div class="hud-center">
        <div class="hud-mode-badge">${modeBadge}</div>
        <div class="hud-multi" style="color:${multiColor}">×${multiplier.toFixed(1)}</div>
        <div class="hud-speed-wrap">
          <div class="hud-speed-label">SPEED ${speedPct}%</div>
          <div class="hud-speed-bar"><div class="hud-speed-fill" style="width:${speedPct}%"></div></div>
        </div>
      </div>
      <div class="hud-block" style="align-items:flex-end">
        <div style="display:flex;gap:20px;align-items:flex-start">
          <div>
            <div class="hud-label">COINS</div>
            <div class="hud-value coins">🪙 ${coins}</div>
          </div>
          <div>
            <div class="hud-label">LIVES</div>
            <div class="hud-value lives" style="font-size:1.1rem;letter-spacing:2px">${livesHtml}</div>
          </div>
        </div>
      </div>
      <div class="hud-powerup-row"></div>
      ${mode==='timetrial' ? `<div class="hud-countdown" style="color:${timeLeft<15?'#ff2d78':'#ffe500'}">${Math.ceil(timeLeft)}s</div>` : ''}
    `;
  },

  updatePowerups({ shield, nitro, nitroT, magnetT, slowT }) {
    const row = this.el?.querySelector('.hud-powerup-row');
    if (!row) return;
    row.innerHTML = '';
    const add = (cls, icon, label, t, dur) => {
      const pill = document.createElement('div');
      pill.className = `hud-powerup-pill ${cls}`;
      const pct = Math.min(100, (t/dur)*100);
      pill.innerHTML = `${icon} ${label}<div class="hud-timer-bar"><div class="hud-timer-fill" style="width:${pct}%;background:currentColor"></div></div>`;
      row.appendChild(pill);
    };
    if (shield)  add('shield','🛡️','SHIELD', 1,   1);
    if (nitro && nitroT)  add('nitro', '⚡','NITRO',  nitroT, 5);
    if (magnetT) add('magnet','🧲','MAGNET',magnetT,8);
    if (slowT)   add('slow',  '❄️','SLOW',  slowT,  5);
  }
};
