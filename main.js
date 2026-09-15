// ── Screen manager ──────────────────────────────────────────────────
const Screens = {
  show(name) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    const el = document.getElementById(`screen-${name}`);
    if (el) el.classList.add('active');
  }
};

// ── Keyboard input ──────────────────────────────────────────────────
const Input = {
  held: {},

  init() {
    document.addEventListener('keydown', e => {
      if (this.held[e.code]) return;
      this.held[e.code] = true;
      this._handle(e.code, true);
    });
    document.addEventListener('keyup', e => {
      this.held[e.code] = false;
    });
  },

  _handle(code, down) {
    if (!Game.running) return;
    if (down) {
      if (code === 'ArrowLeft'  || code === 'KeyA') Player.setLane(-1);
      if (code === 'ArrowRight' || code === 'KeyD') Player.setLane(1);
      if (code === 'KeyM') Audio.toggleMute();
    }
  }
};

// ── Touch / swipe input ─────────────────────────────────────────────
const TouchInput = {
  startX: 0, startY: 0, threshold: 40,

  init() {
    const el = document.getElementById('screen-game');
    el.addEventListener('touchstart', e => {
      this.startX = e.touches[0].clientX;
      this.startY = e.touches[0].clientY;
    }, { passive: true });

    el.addEventListener('touchend', e => {
      const dx = e.changedTouches[0].clientX - this.startX;
      const dy = e.changedTouches[0].clientY - this.startY;
      if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > this.threshold) {
        if (!Game.running) return;
        Player.setLane(dx > 0 ? 1 : -1);
      }
    }, { passive: true });
  }
};

// ── Init ─────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  Input.init();
  TouchInput.init();
  MenuScreen.render();
  Screens.show('menu');
});
