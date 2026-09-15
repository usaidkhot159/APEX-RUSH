const Game = {
  mode:'endless', score:0, coins:0, elapsed:0,
  timeLeft:60, speed:3, maxSpeed:18,
  multiplier:1, multiTimer:0,
  dt:0, running:false,
  distance:0, noCrashTimer:0,
  completedChallenges:[],

  start(mode='endless') {
    this.mode = mode; this.score = 0; this.coins = 0;
    this.elapsed = 0; this.timeLeft = 60; this.speed = 3;
    this.multiplier = 1; this.multiTimer = 0;
    this.distance = 0; this.noCrashTimer = 0;
    this.completedChallenges = [];
    this.running = true;

    Screens.show('game');

    // Init renderer AFTER screen is shown so dimensions are correct
    setTimeout(() => {
      Renderer.init();
      Road.init(Renderer.canvas);
      Environment.init();
      EnemyManager.init();
      CoinManager.init();
      PowerupManager.init();
      Particles.clear();
      HUD.init();

      const carId  = Storage.get('selectedCar') || 'starter';
      const color  = Storage.get('carColor')    || '#00f5ff';
      const neonOn = Storage.get('neonOn') !== false;
      Player.init(Renderer.canvas, carId, color, neonOn);

      Audio.startEngine();
      this._countdown(() => GameLoop.start(dt => this._tick(dt)));
    }, 50);
  },

  _countdown(cb) {
    let count = 3;
    const screenEl = document.getElementById('screen-game');
    const el = document.createElement('div');
    el.style.cssText = `position:absolute;inset:0;display:flex;align-items:center;
      justify-content:center;z-index:500;pointer-events:none;
      font-family:'Orbitron',monospace;font-size:5rem;font-weight:900;
      color:#00f5ff;text-shadow:0 0 20px #00f5ff,0 0 60px #00f5ff80;`;
    screenEl.appendChild(el);
    const tick = () => {
      if (count > 0) {
        el.textContent = count;
        el.style.animation='none'; void el.offsetHeight;
        el.style.animation='countdownPop 0.7s ease-out';
        Audio.countdownBeep(false);
        count--; setTimeout(tick, 800);
      } else {
        el.textContent='GO!';
        el.style.color='#39ff14';
        el.style.textShadow='0 0 20px #39ff14,0 0 60px #39ff1480';
        el.style.animation='none'; void el.offsetHeight;
        el.style.animation='countdownPop 0.4s ease-out';
        Audio.countdownBeep(true);
        setTimeout(()=>{ el.remove(); cb(); }, 600);
      }
    };
    setTimeout(tick, 300);
  },

  _tick(dt) {
    this.dt = dt;
    if (!this.running) return;

    this.elapsed  += dt;
    this.distance += this.speed * dt;

    // Speed ramp
    const carBonus = (CARS[Storage.get('selectedCar')]?.speed || 2) * 0.12;
    this.speed = Math.min(this.maxSpeed, 3 + this.elapsed * 0.05 + carBonus);
    if (Player.nitroActive) this.speed = Math.min(this.maxSpeed+4, this.speed*1.9);

    if (this.mode==='timetrial') {
      this.timeLeft -= dt;
      if (this.timeLeft <= 0) { this.timeLeft=0; this._end(); return; }
    }

    // Score
    this.score = Math.round(this.score + this.speed * dt * 15 * this.multiplier);
    if (this.multiTimer > 0) { this.multiTimer -= dt; if (this.multiTimer<=0) this.multiplier=1; }
    if (!Player.invincible) this.noCrashTimer += dt;

    // Update all systems
    Road.update(this.speed);
    Environment.update(dt);
    EnemyManager.update(dt, this.speed, Player.slowActive);
    CoinManager.update(dt, this.speed, Player.magnetActive, Player.x+Player.w/2, Player.y);
    PowerupManager.update(dt, this.speed);
    Player.update(dt, this.speed);
    Particles.update();

    // Collisions
    const res = Collision.check(this);
    if (res.coinsCollected > 0) {
      this.coins += res.coinsCollected;
      this.score += res.coinsCollected * 150;
      this.multiplier = Math.min(5, this.multiplier + 0.4*res.coinsCollected);
      this.multiTimer = 4;
      this._checkChallenge('coins20', this.coins, 20);
      this._checkChallenge('collect50coins', this.coins, 50);
    }
    if (Player.lives <= 0) { this._end(); return; }

    this._checkChallenge('survive30', this.elapsed, 30);
    this._checkChallenge('survive120', this.elapsed, 120);
    this._checkChallenge('nocrash60', this.noCrashTimer, 60);
    this._checkChallenge('reach5000', this.score, 5000);

    HUD.render({
      score:this.score, coins:this.coins, lives:Player.lives,
      speed:this.speed, maxSpeed:this.maxSpeed, mode:this.mode,
      timeLeft:this.timeLeft, multiplier:this.multiplier
    });
    HUD.updatePowerups({
      shield:Player.shieldActive, nitro:Player.nitroActive, nitroT:Player.nitroTimer,
      magnetT:Player.magnetActive?Player.magnetTimer:0, slowT:Player.slowActive?Player.slowTimer:0
    });
    Renderer.render(this);
    Environment.drawTransition(Renderer.ctx, Renderer.W, Renderer.H);
  },

  _checkChallenge(id, progress, total) {
    const ch = Storage.get('challenges')[id];
    if (!ch || ch.completed) return;
    const newlyDone = Storage.updateChallenge(id, progress, total);
    if (newlyDone) {
      const def = CHALLENGE_DEFS.find(c=>c.id===id);
      this.completedChallenges.push(def?.name || id);
      if (id==='collect50coins') Storage.unlockCar('speedster');
      if (id==='survive120') Storage.unlockCar('phantom');
    }
  },

  _end() {
    this.running = false;
    GameLoop.stop();
    Audio.stopEngine();
    Storage.addCoins(this.coins);
    const isNewBest = Storage.updateBestScore(this.score);
    Storage._data.totalGames = (Storage._data.totalGames||0) + 1;
    Storage.save();
    document.getElementById('screen-game').querySelectorAll('.hud-countdown').forEach(e=>e.remove());
    setTimeout(()=>{
      GameoverScreen.render({
        score:this.score, coins:this.coins, distance:Math.floor(this.distance),
        time:this.elapsed, bestScore:Storage.get('bestScore'),
        isNewBest, mode:this.mode, completedChallenges:this.completedChallenges
      });
      Screens.show('gameover');
    }, 600);
  },

  screenShake(dur=0.3) {
    Renderer.shake(dur, 8);
    const gs = document.getElementById('screen-game');
    gs.classList.add('shake','flash');
    setTimeout(()=>gs.classList.remove('shake','flash'), 500);
  },

  get environment() { return Environment.current; }
};
