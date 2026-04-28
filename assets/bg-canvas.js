(function networkCanvas() {
  var canvas = document.getElementById("bg-canvas");
  if (!canvas) return;
  var ctx = canvas.getContext("2d");
  var mouse = { x: -9999, y: -9999 };
  var particles = [];
  var rafId = 0;
  var dpr = Math.min(window.devicePixelRatio || 1, 2);

  var CFG = {
    count: 380,
    countNarrow: 220,
    linkDistance: 100,
    mouseRadius: 168,
    lineWidth: 0.55,
    idleLinkAlpha: 0.07,
    mouseLinkAlpha: 0.48
  };

  function paletteDot() {
    if (Math.random() < 0.55) {
      return {
        r: 200 + Math.floor(Math.random() * 55),
        g: 14 + Math.floor(Math.random() * 36),
        b: 18 + Math.floor(Math.random() * 32)
      };
    }
    return {
      r: 110 + Math.floor(Math.random() * 45),
      g: 12 + Math.floor(Math.random() * 18),
      b: 16 + Math.floor(Math.random() * 20)
    };
  }

  function rgba(c, a) {
    return "rgba(" + c.r + "," + c.g + "," + c.b + "," + a + ")";
  }

  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  function mixColor(c1, c2, t) {
    return {
      r: Math.floor(lerp(c1.r, c2.r, t)),
      g: Math.floor(lerp(c1.g, c2.g, t)),
      b: Math.floor(lerp(c1.b, c2.b, t))
    };
  }

  function inMouseBand(px, py) {
    var mx = mouse.x - px;
    var my = mouse.y - py;
    var r = CFG.mouseRadius;
    return mx < r && mx > -r && my < r && my > -r;
  }

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    var w = window.innerWidth;
    var h = window.innerHeight;
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    canvas.style.width = w + "px";
    canvas.style.height = h + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    CFG.count = w < 1100 ? CFG.countNarrow : 380;
    if (particles.length !== CFG.count) {
      particles = [];
      for (var i = 0; i < CFG.count; i++) {
        particles.push(new Particle());
      }
    } else {
      for (var j = 0; j < particles.length; j++) {
        particles[j].x = Math.min(Math.max(particles[j].x, 0), w);
        particles[j].y = Math.min(Math.max(particles[j].y, 0), h);
      }
    }
  }

  function Particle() {
    this.x = Math.random() * window.innerWidth;
    this.y = Math.random() * window.innerHeight;
    this.vx = -0.45 + Math.random() * 0.9;
    this.vy = -0.45 + Math.random() * 0.9;
    this.radius = 0.6 + Math.random() * 1.8;
    this.color = paletteDot();
  }

  Particle.prototype.step = function (w, h) {
    this.x += this.vx;
    this.y += this.vy;
    if (this.y < 0 || this.y > h) this.vy *= -1;
    if (this.x < 0 || this.x > w) this.vx *= -1;
  };

  Particle.prototype.draw = function () {
    ctx.beginPath();
    ctx.fillStyle = rgba(this.color, 0.82);
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
  };

  function frame() {
    var w = window.innerWidth;
    var h = window.innerHeight;
    ctx.clearRect(0, 0, w, h);

    var i, j, a, b, dx, dy, dist;
    var maxD = CFG.linkDistance;

    for (i = 0; i < particles.length; i++) {
      particles[i].step(w, h);
    }

    ctx.lineWidth = CFG.lineWidth;
    for (i = 0; i < particles.length; i++) {
      a = particles[i];
      for (j = i + 1; j < particles.length; j++) {
        b = particles[j];
        dx = a.x - b.x;
        dy = a.y - b.y;
        if (dx > maxD || dy > maxD || dx < -maxD || dy < -maxD) continue;
        dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > maxD) continue;

        var mc = mixColor(a.color, b.color, b.radius / (a.radius + b.radius + 0.01));
        var nearMouse =
          inMouseBand(a.x, a.y) ||
          inMouseBand(b.x, b.y) ||
          inMouseBand((a.x + b.x) * 0.5, (a.y + b.y) * 0.5);

        var alpha = (1 - dist / maxD) * (nearMouse ? CFG.mouseLinkAlpha : CFG.idleLinkAlpha);
        if (alpha < 0.002) continue;

        ctx.strokeStyle = rgba(mc, alpha);
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }
    }

    for (i = 0; i < particles.length; i++) {
      particles[i].draw();
    }

    rafId = requestAnimationFrame(frame);
  }

  function onMove(e) {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  }

  function onLeave() {
    mouse.x = -9999;
    mouse.y = -9999;
  }

  window.addEventListener("mousemove", onMove, { passive: true });
  document.documentElement.addEventListener("mouseleave", onLeave);
  window.addEventListener("resize", resize);

  resize();
  if (rafId) cancelAnimationFrame(rafId);
  rafId = requestAnimationFrame(frame);
})();
