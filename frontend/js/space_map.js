/**
 * Space Starfield & Anti-gravity Canvas Engine
 */
class AntiGravityEngine {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.stars = [];
    this.numStars = 140;
    this.mouse = { x: -1000, y: -1000 };
    
    this.init();
  }

  init() {
    this.resize();
    window.addEventListener('resize', () => this.resize());
    window.addEventListener('mousemove', (e) => {
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;
    });

    this.createStars();
    this.animate();
  }

  resize() {
    this.width = this.canvas.width = window.innerWidth;
    this.height = this.canvas.height = window.innerHeight;
  }

  createStars() {
    this.stars = [];
    for (let i = 0; i < this.numStars; i++) {
      this.stars.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        size: Math.random() * 2.2 + 0.6,
        baseX: 0,
        baseY: 0,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        color: ['#ffffff', '#00f2fe', '#4facfe', '#7928ca', '#ffd700'][Math.floor(Math.random() * 5)],
        pulse: Math.random() * Math.PI * 2,
        pulseSpeed: 0.02 + Math.random() * 0.03
      });
    }
  }

  animate() {
    this.ctx.clearRect(0, 0, this.width, this.height);

    // Vẽ và cập nhật từng hạt sao
    for (let i = 0; i < this.stars.length; i++) {
      const s = this.stars[i];

      // Anti-gravity drift
      s.x += s.vx;
      s.y += s.vy;
      s.pulse += s.pulseSpeed;

      // Wrapping viền màn hình
      if (s.x < 0) s.x = this.width;
      if (s.x > this.width) s.x = 0;
      if (s.y < 0) s.y = this.height;
      if (s.y > this.height) s.y = 0;

      // Hiệu ứng lực phản trọng lực khi di chuột gần
      const dx = s.x - this.mouse.x;
      const dy = s.y - this.mouse.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 120 && dist > 0) {
        const force = (120 - dist) / 120;
        s.x += (dx / dist) * force * 3.5;
        s.y += (dy / dist) * force * 3.5;
      }

      // Vẽ hạt sao phát sáng
      const currentSize = s.size * (0.8 + 0.3 * Math.sin(s.pulse));
      this.ctx.beginPath();
      this.ctx.arc(s.x, s.y, Math.max(0.2, currentSize), 0, Math.PI * 2);
      this.ctx.fillStyle = s.color;
      this.ctx.shadowBlur = 8;
      this.ctx.shadowColor = s.color;
      this.ctx.fill();
    }

    requestAnimationFrame(() => this.animate());
  }
}

window.addEventListener('DOMContentLoaded', () => {
  window.antiGravityBackground = new AntiGravityEngine('space-canvas');
});
