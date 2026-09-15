const Utils = {
  rand: (min, max) => Math.random() * (max - min) + min,
  randInt: (min, max) => Math.floor(Math.random() * (max - min + 1)) + min,
  clamp: (val, min, max) => Math.max(min, Math.min(max, val)),
  lerp: (a, b, t) => a + (b - a) * t,

  rectOverlap(a, b, margin = 0) {
    return (
      a.x < b.x + b.w - margin &&
      a.x + a.w > b.x + margin &&
      a.y < b.y + b.h - margin &&
      a.y + a.h > b.y + margin
    );
  },

  dist(a, b) {
    const dx = a.x - b.x, dy = a.y - b.y;
    return Math.sqrt(dx * dx + dy * dy);
  },

  formatScore(n) {
    return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  },

  shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  },

  // Easing
  easeOut: t => 1 - Math.pow(1 - t, 3),
  easeIn:  t => t * t * t,
  easeInOut: t => t < 0.5 ? 4*t*t*t : 1 - Math.pow(-2*t+2,3)/2,
};
