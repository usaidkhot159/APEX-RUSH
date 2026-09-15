const Storage = {
  KEY: 'apex_rush_v1',

  _data: null,

  _defaults() {
    return {
      bestScore:      0,
      totalCoins:     0,
      totalGames:     0,
      totalDistance:  0,
      selectedCar:    'starter',
      carColor:       '#00f5ff',
      neonOn:         true,
      ownedCars:      ['starter'],
      challenges: {
        survive30:   { progress: 0, completed: false },
        coins20:     { progress: 0, completed: false },
        nocrash60:   { progress: 0, completed: false },
        reach5000:   { progress: 0, completed: false },
        collect50coins: { progress: 0, completed: false },
        survive120:  { progress: 0, completed: false },
      }
    };
  },

  load() {
    try {
      const raw = localStorage.getItem(this.KEY);
      this._data = raw ? { ...this._defaults(), ...JSON.parse(raw) } : this._defaults();
    } catch {
      this._data = this._defaults();
    }
    return this._data;
  },

  save() {
    try {
      localStorage.setItem(this.KEY, JSON.stringify(this._data));
    } catch {}
  },

  get(key) {
    if (!this._data) this.load();
    return this._data[key];
  },

  set(key, val) {
    if (!this._data) this.load();
    this._data[key] = val;
    this.save();
  },

  addCoins(n) {
    this._data.totalCoins = (this._data.totalCoins || 0) + n;
    this.save();
  },

  updateBestScore(score) {
    if (score > this._data.bestScore) {
      this._data.bestScore = score;
      this.save();
      return true;
    }
    return false;
  },

  unlockCar(id) {
    if (!this._data.ownedCars.includes(id)) {
      this._data.ownedCars.push(id);
      this.save();
    }
  },

  updateChallenge(id, progress, total) {
    const ch = this._data.challenges[id];
    if (!ch || ch.completed) return false;
    ch.progress = Math.min(progress, total);
    if (ch.progress >= total) {
      ch.completed = true;
      this.save();
      return true; // newly completed
    }
    this.save();
    return false;
  },

  reset() {
    this._data = this._defaults();
    this.save();
  }
};

Storage.load();
