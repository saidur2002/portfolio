/* =====================================================
   PORTFOLIO – APP.JS
   Particle Network Background + Navbar + Photo Upload
   ===================================================== */

/* ──────────────────────────────────────────────────
   TECH PARTICLE NETWORK (Canvas)
────────────────────────────────────────────────── */
(function initParticleNetwork() {
  const canvas = document.getElementById('techCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let W, H, particles, animId;
  const PARTICLE_COUNT = 90;
  const MAX_DIST       = 160;   // max distance to draw a connection line
  const SPEED          = 0.45;

  /* Resize canvas to fill viewport */
  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  /* Create a single particle */
  function makeParticle() {
    const angle = Math.random() * Math.PI * 2;
    const speed = (Math.random() * 0.5 + 0.2) * SPEED;
    return {
      x:  Math.random() * W,
      y:  Math.random() * H,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      r:  Math.random() * 2 + 1.2,   /* radius */
    };
  }

  function init() {
    resize();
    particles = Array.from({ length: PARTICLE_COUNT }, makeParticle);
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);

    /* Update & draw each particle */
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];

      /* Bounce off walls */
      if (p.x < 0 || p.x > W) p.vx *= -1;
      if (p.y < 0 || p.y > H) p.vy *= -1;
      p.x += p.vx;
      p.y += p.vy;

      /* Glow dot */
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0, 230, 200, 0.85)';
      ctx.shadowColor = '#00e6c8';
      ctx.shadowBlur  = 8;
      ctx.fill();
      ctx.shadowBlur  = 0;

      /* Draw connections to nearby particles */
      for (let j = i + 1; j < particles.length; j++) {
        const q    = particles[j];
        const dx   = p.x - q.x;
        const dy   = p.y - q.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < MAX_DIST) {
          const alpha = (1 - dist / MAX_DIST) * 0.45;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(q.x, q.y);
          ctx.strokeStyle = `rgba(0, 230, 200, ${alpha})`;
          ctx.lineWidth   = 0.8;
          ctx.stroke();
        }
      }
    }

    animId = requestAnimationFrame(draw);
  }

  window.addEventListener('resize', () => { resize(); });

  init();
  draw();
})();




document.addEventListener('DOMContentLoaded', () => {

  /* Sync initial state if a default photo is already loaded */
  const _initImg = document.getElementById('uploaded-photo');
  if (_initImg && _initImg.src && !_initImg.src.endsWith('/') ) {
    const photoCircleEl = document.getElementById('photo-circle');
    if (photoCircleEl) photoCircleEl.title = 'Click to change photo';
  }


  /* ──────────────────────────────────────────────────
     NAVBAR – scroll shadow + hamburger toggle
  ────────────────────────────────────────────────── */
  const navbar    = document.getElementById('navbar');
  const hamburger = document.getElementById('hamburger');
  const navLinks  = document.getElementById('nav-links');

  if (navbar) {
    window.addEventListener('scroll', () => {
      navbar.style.boxShadow = window.scrollY > 10
        ? '0 4px 24px rgba(0,0,0,0.10)'
        : '0 2px 16px rgba(0,0,0,0.06)';
    });
  }

  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
      navLinks.classList.toggle('open');
    });
  }

  /* Active nav link on scroll */
  const sections  = document.querySelectorAll('section[id]');
  const navItems  = document.querySelectorAll('.nav-item');

  if (sections.length > 0) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          navItems.forEach(item => item.classList.remove('active'));
          const active = document.querySelector(`.nav-item[href="#${entry.target.id}"]`);
          if (active) active.classList.add('active');
        }
      });
    }, { threshold: 0.5 });

    sections.forEach(s => observer.observe(s));
  }

  /* ──────────────────────────────────────────────────
     PHOTO UPLOAD – click, drag & drop, paste, remove
  ────────────────────────────────────────────────── */
  const photoCircle      = document.getElementById('photo-circle');
  const photoInput       = document.getElementById('photo-input');
  const uploadPlaceholder= document.getElementById('upload-placeholder');
  const uploadedPhoto    = document.getElementById('uploaded-photo');
  const removeBtn        = document.getElementById('remove-photo');

  if (photoCircle && photoInput) {
    /** Show the uploaded image */
    function showPhoto(src) {
      if (uploadedPhoto) {
        uploadedPhoto.src = src;
        uploadedPhoto.classList.add('visible');
      }
      if (uploadPlaceholder) uploadPlaceholder.classList.add('hidden');
      if (removeBtn) removeBtn.classList.add('visible');
      photoCircle.classList.add('has-photo');
      photoCircle.title = 'Click to change photo';
    }

    /** Reset to upload placeholder */
    function clearPhoto() {
      if (uploadedPhoto) {
        uploadedPhoto.src = '';
        uploadedPhoto.classList.remove('visible');
      }
      if (uploadPlaceholder) uploadPlaceholder.classList.remove('hidden');
      if (removeBtn) removeBtn.classList.remove('visible');
      photoCircle.classList.remove('has-photo');
      photoCircle.title = 'Click or drag and drop to upload your photo';
      photoInput.value  = '';
    }

    /** Read a File and call showPhoto */
    function loadFile(file) {
      if (!file || !file.type.startsWith('image/')) {
        alert('Please select a valid image file.');
        return;
      }
      const reader = new FileReader();
      reader.onload = e => showPhoto(e.target.result);
      reader.readAsDataURL(file);
    }

    /* -- Click to open file picker (but not on remove button) -- */
    photoCircle.addEventListener('click', (e) => {
      if (removeBtn && e.target === removeBtn) return;
      photoInput.click();
    });

    /* -- Keyboard accessibility -- */
    photoCircle.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        photoInput.click();
      }
    });

    /* -- File input change -- */
    photoInput.addEventListener('change', () => {
      if (photoInput.files && photoInput.files[0]) {
        loadFile(photoInput.files[0]);
      }
    });

    /* -- Remove button -- */
    if (removeBtn) {
      removeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        clearPhoto();
      });
    }

    /* -- Drag & drop -- */
    ['dragenter', 'dragover'].forEach(evt => {
      photoCircle.addEventListener(evt, (e) => {
        e.preventDefault();
        photoCircle.classList.add('drag-over');
      });
    });

    ['dragleave', 'dragend', 'drop'].forEach(evt => {
      photoCircle.addEventListener(evt, () => {
        photoCircle.classList.remove('drag-over');
      });
    });

    photoCircle.addEventListener('drop', (e) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      loadFile(file);
    });

    /* -- Paste image from clipboard (Ctrl+V anywhere on page) -- */
    document.addEventListener('paste', (e) => {
      const items = Array.from(e.clipboardData.items || []);
      const imgItem = items.find(i => i.type.startsWith('image/'));
      if (imgItem) {
        loadFile(imgItem.getAsFile());
      }
    });
  }

});

