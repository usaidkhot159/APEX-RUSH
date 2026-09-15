const MenuScreen = {
  selectedMode: 'endless',

  render() {
    const best = Storage.get('bestScore') || 0;
    const el   = document.getElementById('screen-menu');
    el.innerHTML = `
      <div class="menu-bg-grid"></div>
      <div class="menu-particles" id="menu-particles"></div>

      <div class="menu-logo-wrap">
        <div class="menu-car-preview">🏎️</div>
        <div class="menu-tagline">HIGH VELOCITY RACING</div>
        <div class="menu-title">APEX<br>RUSH</div>
        <div class="menu-subtitle">SURVIVE · COLLECT · DOMINATE</div>
      </div>

      <div class="menu-mode-select">
        <button class="mode-btn ${this.selectedMode==='endless'   ?'active':''}" data-mode="endless">🟢 ENDLESS</button>
        <button class="mode-btn ${this.selectedMode==='timetrial' ?'active':''}" data-mode="timetrial">⏱ TIME TRIAL</button>
        <button class="mode-btn ${this.selectedMode==='challenge' ?'active':''}" data-mode="challenge">🔴 CHALLENGE</button>
      </div>

      <div class="menu-buttons">
        <button class="btn btn-primary" id="btn-play">▶ START RACE</button>
        <button class="btn btn-secondary" id="btn-garage">🚗 GARAGE</button>
        <button class="btn btn-secondary" id="btn-challenges">🏆 CHALLENGES</button>
      </div>

      <div class="menu-footer">
        <div class="menu-best-score">🏆 BEST: <span>${Utils.formatScore(best)}</span></div>
        <div class="menu-controls">← → ARROW KEYS &nbsp;|&nbsp; SWIPE TO MOVE</div>
      </div>
    `;

    el.querySelectorAll('.mode-btn').forEach(btn => {
      btn.addEventListener('click', () => { this.selectedMode=btn.dataset.mode; this.render(); });
    });
    el.querySelector('#btn-play').addEventListener('click', () => {
      Audio.init(); Audio.resume(); Game.start(this.selectedMode);
    });
    el.querySelector('#btn-garage').addEventListener('click', () => {
      Audio.init(); GarageScreen.render(); Screens.show('garage');
    });
    el.querySelector('#btn-challenges').addEventListener('click', () => {
      ChallengesScreen.render(); Screens.show('challenges');
    });
  }
};
