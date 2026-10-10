(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (id) { return document.getElementById(id); };

  var welcome = $('welcome'), site = $('site'), openBtn = $('openBtn');
  var audio = $('bgm'), musicBtn = $('musicBtn'), musicNote = $('musicNote'), musicIcon = $('musicIcon');
  var canvas = $('fx'), ctx = canvas.getContext('2d');

  /* ---------- Floating hearts background ---------- */
  var symbols = ['💗', '💖', '💕', '🌸', '✨', '🌹'];
  function buildFloaters() {
    if (reduceMotion) return;
    var box = $('floaters');
    var count = window.innerWidth < 600 ? 12 : 22;
    for (var i = 0; i < count; i++) {
      var s = document.createElement('span');
      s.className = 'floater';
      s.textContent = symbols[Math.floor(Math.random() * symbols.length)];
      s.style.left = Math.random() * 100 + '%';
      s.style.fontSize = (14 + Math.random() * 22) + 'px';
      s.style.animationDuration = (9 + Math.random() * 12) + 's';
      s.style.animationDelay = (-Math.random() * 15) + 's';
      s.style.setProperty('--drift', (Math.random() * 80 - 40) + 'px');
      box.appendChild(s);
    }
  }
  buildFloaters();

  /* ---------- Canvas particles (hearts + confetti) ---------- */
  var particles = [], running = false;
  function resize() {
    var dpr = window.devicePixelRatio || 1;
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  window.addEventListener('resize', resize);
  resize();

  var confettiColors = ['#ff7aa8', '#ffc2d6', '#e0457b', '#fff', '#ffd6a5', '#f9a8d4'];

  function burst(type, amount, ox, oy) {
    if (reduceMotion) amount = Math.min(amount, 8);
    for (var i = 0; i < amount; i++) {
      var a = Math.random() * Math.PI * 2;
      var sp = 2 + Math.random() * 6;
      particles.push({
        type: type,
        x: ox == null ? window.innerWidth / 2 : ox,
        y: oy == null ? window.innerHeight * 0.55 : oy,
        vx: Math.cos(a) * sp,
        vy: Math.sin(a) * sp - (type === 'heart' ? 3 : 5),
        g: type === 'heart' ? -0.02 : 0.16,
        size: type === 'heart' ? 16 + Math.random() * 18 : 6 + Math.random() * 6,
        rot: Math.random() * 6, vr: (Math.random() - .5) * .3,
        life: 1, decay: type === 'heart' ? 0.006 : 0.008,
        color: confettiColors[Math.floor(Math.random() * confettiColors.length)]
      });
    }
    if (!running) { running = true; requestAnimationFrame(tick); }
  }

  function tick() {
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    for (var i = particles.length - 1; i >= 0; i--) {
      var p = particles[i];
      p.x += p.vx; p.y += p.vy; p.vy += p.g; p.vx *= 0.99; p.rot += p.vr; p.life -= p.decay;
      if (p.life <= 0) { particles.splice(i, 1); continue; }
      ctx.save();
      ctx.globalAlpha = Math.max(p.life, 0);
      ctx.translate(p.x, p.y); ctx.rotate(p.rot);
      if (p.type === 'heart') {
        ctx.font = p.size + 'px serif'; ctx.textAlign = 'center'; ctx.fillText('💗', 0, 0);
      } else {
        ctx.fillStyle = p.color; ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
      }
      ctx.restore();
    }
    if (particles.length) requestAnimationFrame(tick);
    else { running = false; ctx.clearRect(0, 0, window.innerWidth, window.innerHeight); }
  }

  /* ---------- Music ---------- */
  var musicOk = true;
  var noteTimer;
  function note(text) {
    musicNote.textContent = text;
    musicNote.classList.add('show');
    clearTimeout(noteTimer);
    noteTimer = setTimeout(function () { musicNote.classList.remove('show'); }, 3500);
  }
  function setMusicUI(playing) {
    musicBtn.classList.toggle('playing', playing);
    musicBtn.classList.toggle('paused', !playing);
    musicBtn.setAttribute('aria-pressed', playing ? 'true' : 'false');
    musicBtn.setAttribute('aria-label', playing ? 'Pause music' : 'Play music');
    musicIcon.textContent = playing ? '🎵' : '🔇';
  }
  audio.addEventListener('error', function () {
    musicOk = false;
    setMusicUI(false);
  });
  function startMusic() {
    audio.volume = 0.6;
    var p = audio.play();
    if (p && p.then) {
      p.then(function () { setMusicUI(true); })
       .catch(function () {
         setMusicUI(false);
         note(musicOk ? 'Tap the music button to play 🎶' : 'Music file not found');
       });
    }
  }
  musicBtn.addEventListener('click', function () {
    if (!musicOk) { note('Music file not found (assets/birthday-song.mp3)'); return; }
    if (audio.paused) {
      audio.play().then(function () { setMusicUI(true); }).catch(function () { note('Could not play the music'); });
    } else {
      audio.pause(); setMusicUI(false);
    }
  });

  /* ---------- Open surprise ---------- */
  openBtn.addEventListener('click', function () {
    startMusic();
    musicBtn.classList.remove('hidden');
    welcome.classList.add('leaving');
    site.classList.remove('hidden');
    document.body.classList.remove('locked');
    window.scrollTo(0, 0);
    burst('heart', 26);
    setTimeout(function () { burst('confetti', 70, window.innerWidth / 2, window.innerHeight * 0.3); }, 500);
    setTimeout(function () { welcome.hidden = true; welcome.style.display = 'none'; }, 1000);
    var h = site.querySelector('.hero h2'); if (h) { h.setAttribute('tabindex', '-1'); h.focus({ preventScroll: true }); }
  });

  /* ---------- Smooth scroll to gallery ---------- */
  $('toGallery').addEventListener('click', function (e) {
    e.preventDefault();
    $('gallery').scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
  });

  /* ---------- Gallery tap sparkle + Lightbox ---------- */
  var items = Array.prototype.slice.call(document.querySelectorAll('.photo-btn'));
  var lb = $('lightbox'), lbImg = $('lbImg'), lbCap = $('lbCap');
  var current = 0, lastFocus = null;

  function show(i) {
    current = (i + items.length) % items.length;
    var img = items[current].querySelector('img');
    var cap = items[current].parentNode.querySelector('figcaption');
    lbImg.src = img.getAttribute('src');
    lbImg.alt = img.alt;
    lbCap.textContent = cap ? cap.textContent : '';
  }
  function openLB(i, btn) {
    lastFocus = btn;
    show(i);
    lb.hidden = false;
    document.body.classList.add('locked');
    $('lbClose').focus();
  }
  function closeLB() {
    lb.hidden = true;
    document.body.classList.remove('locked');
    if (lastFocus) lastFocus.focus();
  }
  items.forEach(function (btn, i) {
    btn.addEventListener('click', function (e) {
      var r = btn.getBoundingClientRect();
      burst('heart', 5, r.left + r.width / 2, r.top + r.height / 2);
      openLB(i, btn);
    });
    var img = btn.querySelector('img');
    img.addEventListener('error', function () {
      img.style.visibility = 'hidden';
      btn.style.minHeight = '180px';
      btn.style.background = 'linear-gradient(135deg,#ffe3ec,#ffc2d6)';
    });
  });
  $('lbClose').addEventListener('click', closeLB);
  $('lbPrev').addEventListener('click', function () { show(current - 1); });
  $('lbNext').addEventListener('click', function () { show(current + 1); });
  lb.addEventListener('click', function (e) { if (e.target === lb) closeLB(); });
  document.addEventListener('keydown', function (e) {
    if (lb.hidden) return;
    if (e.key === 'Escape') closeLB();
    else if (e.key === 'ArrowLeft') show(current - 1);
    else if (e.key === 'ArrowRight') show(current + 1);
    else if (e.key === 'Tab') {
      var f = lb.querySelectorAll('button');
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });
  // swipe in lightbox
  var sx = null;
  lb.addEventListener('touchstart', function (e) { sx = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener('touchend', function (e) {
    if (sx === null) return;
    var dx = e.changedTouches[0].clientX - sx;
    if (Math.abs(dx) > 50) show(current + (dx < 0 ? 1 : -1));
    sx = null;
  });

  /* ---------- Wish cake ---------- */
  var wishes = [
    '💗 Wish made. I hope it comes true, Shivani.',
    '🌸 May this year bring you lots of happiness.',
    '✨ Whatever you wished for, you deserve it.'
  ];
  var cake = $('candleBtn'), wishMsg = $('wishMsg'), wi = 0;
  cake.addEventListener('click', function () {
    if (!cake.classList.contains('out')) {
      cake.classList.add('out');
      wishMsg.textContent = wishes[wi++ % wishes.length];
      var r = cake.getBoundingClientRect();
      burst('confetti', 60, r.left + r.width / 2, r.top);
      burst('heart', 12, r.left + r.width / 2, r.top);
    } else {
      cake.classList.remove('out');
      wishMsg.textContent = '🕯️ Tap the candle to make another wish';
    }
  });

  /* ---------- Celebrate again ---------- */
  $('replayBtn').addEventListener('click', function () {
    burst('confetti', 90, window.innerWidth / 2, window.innerHeight * 0.4);
    burst('heart', 24);
    window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
  });
})();
