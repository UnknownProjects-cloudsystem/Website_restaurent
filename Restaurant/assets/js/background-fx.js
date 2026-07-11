/* =========================================================
   background-fx.js — procedural embers/steam (2D canvas)
   + OPTIONAL YouTube hero background (legit way to use a
   web cooking video as the hero — set HERO_VIDEO.youtubeId).
   ========================================================= */
(function () {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Embers / steam ---------- */
  function makeField(canvas) {
    const mode = canvas.dataset.fx || "ember";
    const ctx = canvas.getContext("2d");
    let w, h, dpr, particles = [];
    function size() {
      dpr = Math.min(window.devicePixelRatio, 2);
      const r = canvas.getBoundingClientRect(); w = r.width; h = r.height;
      canvas.width = w * dpr; canvas.height = h * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    size(); window.addEventListener("resize", size);
    const COUNT = mode === "flame" ? 60 : Math.round((w * h) / 14000);
    function spawn(init) {
      const ember = mode === "ember";
      return { x: Math.random()*w, y: init ? Math.random()*h : h+10, r: ember ? Math.random()*1.8+0.4 : Math.random()*3+1.5,
        vy: -(Math.random()*0.5 + (ember?0.25:0.15)), vx: (Math.random()-0.5)*0.4, life: 0, max: Math.random()*260+120,
        hue: ember ? 30+Math.random()*20 : 35, steam: !ember };
    }
    for (let i=0;i<COUNT;i++) particles.push(spawn(true));
    function frame() {
      ctx.clearRect(0,0,w,h); ctx.globalCompositeOperation = "lighter";
      for (const p of particles) {
        p.life++; p.x += p.vx + Math.sin(p.life*0.04)*0.3; p.y += p.vy;
        const lr = p.life/p.max; const alpha = Math.sin(lr*Math.PI)*(p.steam?0.12:0.65);
        const grad = ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,p.r*(p.steam?6:3));
        if (p.steam) { grad.addColorStop(0,`rgba(224,200,160,${alpha})`); grad.addColorStop(1,"rgba(224,200,160,0)"); }
        else { grad.addColorStop(0,`rgba(255,${180+p.hue},90,${alpha})`); grad.addColorStop(0.5,`rgba(224,164,88,${alpha*0.6})`); grad.addColorStop(1,"rgba(201,80,30,0)"); }
        ctx.fillStyle = grad; ctx.beginPath(); ctx.arc(p.x,p.y,p.r*(p.steam?6:3),0,Math.PI*2); ctx.fill();
        if (p.life>p.max || p.y<-20) Object.assign(p, spawn(false));
      }
      ctx.globalCompositeOperation = "source-over";
      if (!reduce) requestAnimationFrame(frame);
    }
    frame();
  }
  document.querySelectorAll("canvas[data-fx]").forEach(makeField);

  /* ---------- Optional YouTube hero background ---------- */
  // To enable: set window.HERO_VIDEO = { youtubeId: "VIDEO_ID" } BEFORE this script,
  // or edit the default below. Leave blank to use the local mp4 + procedural look.
  const cfg = window.HERO_VIDEO || {};
  const host = document.getElementById("hero-yt");
  if (host && cfg.youtubeId) {
    const id = cfg.youtubeId;
    const src = `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&mute=1&controls=0&loop=1&playlist=${id}&playsinline=1&modestbranding=1&rel=0&showinfo=0&disablekb=1`;
    const iframe = document.createElement("iframe");
    iframe.src = src; iframe.allow = "autoplay; encrypted-media"; iframe.setAttribute("frameborder", "0"); iframe.title = "Ambient background";
    host.appendChild(iframe);
    // hide the local <video> if YouTube is used
    const v = document.querySelector(".hero-video"); if (v) v.style.display = "none";
  }
})();
