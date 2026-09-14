const Audio = (() => {
  let ctx = null;
  let engineNode = null, engineGain = null;
  let muted = false;

  function init() {
    if (ctx) return;
    try {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
    } catch {}
  }

  function resume() {
    if (ctx && ctx.state === 'suspended') ctx.resume();
  }

  function tone(freq, type, dur, vol = 0.3, delay = 0) {
    if (!ctx || muted) return;
    const osc  = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime + delay);
    gain.gain.setValueAtTime(0, ctx.currentTime + delay);
    gain.gain.linearRampToValueAtTime(vol, ctx.currentTime + delay + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + dur);
    osc.start(ctx.currentTime + delay);
    osc.stop(ctx.currentTime + delay + dur + 0.05);
  }

  function noise(dur, vol = 0.15) {
    if (!ctx || muted) return;
    const buf  = ctx.createBuffer(1, ctx.sampleRate * dur, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    const src  = ctx.createBufferSource();
    const gain = ctx.createGain();
    src.buffer = buf;
    src.connect(gain); gain.connect(ctx.destination);
    gain.gain.setValueAtTime(vol, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
    src.start();
  }

  return {
    init, resume,

    coin() {
      tone(880, 'sine', 0.08, 0.2);
      tone(1320, 'sine', 0.12, 0.15, 0.05);
    },

    powerup() {
      [440, 550, 660, 880].forEach((f, i) => tone(f, 'triangle', 0.1, 0.15, i * 0.06));
    },

    crash() {
      noise(0.35, 0.25);
      tone(80, 'sawtooth', 0.3, 0.2);
    },

    nitro() {
      tone(200, 'sawtooth', 0.05, 0.1);
      tone(300, 'square',   0.05, 0.08, 0.03);
    },

    startEngine() {
      if (!ctx || muted || engineNode) return;
      engineNode = ctx.createOscillator();
      engineGain = ctx.createGain();
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass'; filter.frequency.value = 600;
      engineNode.type = 'sawtooth';
      engineNode.frequency.value = 60;
      engineNode.connect(filter); filter.connect(engineGain); engineGain.connect(ctx.destination);
      engineGain.gain.value = 0.04;
      engineNode.start();
    },

    setEngineSpeed(speed, maxSpeed) {
      if (!engineNode || !engineGain || muted) return;
      const ratio = Utils.clamp(speed / maxSpeed, 0.2, 1);
      engineNode.frequency.setTargetAtTime(50 + ratio * 120, ctx.currentTime, 0.1);
      engineGain.gain.setTargetAtTime(0.02 + ratio * 0.04, ctx.currentTime, 0.1);
    },

    stopEngine() {
      if (engineNode) {
        try { engineNode.stop(); } catch {}
        engineNode = null; engineGain = null;
      }
    },

    countdownBeep(final) {
      tone(final ? 880 : 440, 'sine', 0.15, 0.25);
    },

    toggleMute() { muted = !muted; if (muted) this.stopEngine(); return muted; }
  };
})();
