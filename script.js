document.addEventListener('DOMContentLoaded', () => {
  // 0. Interactive Background Particle Canvas
  const canvas = document.getElementById('doodleCanvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    window.addEventListener('resize', () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    });

    const particles = [];
    const numParticles = Math.min(35, Math.floor(width / 35));

    for (let i = 0; i < numParticles; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 8 + 4,
        speedX: (Math.random() - 0.5) * 0.4,
        speedY: (Math.random() - 0.5) * 0.4,
        type: Math.floor(Math.random() * 3), // 0: cross, 1: star, 2: dot
        rot: Math.random() * Math.PI,
        rotSpeed: (Math.random() - 0.5) * 0.01
      });
    }

    let mX = width / 2, mY = height / 2;
    window.addEventListener('mousemove', (e) => {
      mX = e.clientX;
      mY = e.clientY;
    });

    function renderCanvas() {
      ctx.clearRect(0, 0, width, height);

      particles.forEach(p => {
        p.x += p.speedX;
        p.y += p.speedY;
        p.rot += p.rotSpeed;

        if (p.x < -20) p.x = width + 20;
        if (p.x > width + 20) p.x = -20;
        if (p.y < -20) p.y = height + 20;
        if (p.y > height + 20) p.y = -20;

        // Mouse repel physics
        const dx = p.x - mX;
        const dy = p.y - mY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 120) {
          const angle = Math.atan2(dy, dx);
          const force = (120 - dist) / 120;
          p.x += Math.cos(angle) * force * 2;
          p.y += Math.sin(angle) * force * 2;
        }

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.lineWidth = 1.4;
        ctx.strokeStyle = '#3C6E9E';
        ctx.fillStyle = '#E1543C';
        ctx.globalAlpha = 0.35;

        if (p.type === 0) { // Cross
          ctx.beginPath();
          ctx.moveTo(-p.size, 0); ctx.lineTo(p.size, 0);
          ctx.moveTo(0, -p.size); ctx.lineTo(0, p.size);
          ctx.stroke();
        } else if (p.type === 1) { // Star
          ctx.beginPath();
          ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
          ctx.fill();
        } else { // Square sketch
          ctx.strokeRect(-p.size / 2, -p.size / 2, p.size, p.size);
        }
        ctx.restore();
      });

      requestAnimationFrame(renderCanvas);
    }
    renderCanvas();
  }

  // 1. Scroll Progress Bar
  const progressBar = document.getElementById('scrollProgress');
  window.addEventListener('scroll', () => {
    const winScroll = document.documentElement.scrollTop || document.body.scrollTop;
    const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrolled = (winScroll / height) * 100;
    if (progressBar) progressBar.style.width = scrolled + '%';
  });

  // 2. Custom Sketch Cursor Trail & Click Ripple
  const cursor = document.getElementById('customCursor');
  const cursorDot = document.getElementById('customCursorDot');
  let mouseX = 0, mouseY = 0;
  let cursorX = 0, cursorY = 0;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    if (cursorDot) {
      cursorDot.style.transform = `translate(${mouseX}px, ${mouseY}px)`;
    }

    // Update Mouse CSS vars for card spotlights
    document.querySelectorAll('.paper-card, .project-card').forEach(card => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);
    });
  });

  // Ink Splatter Ripple on click
  window.addEventListener('click', (e) => {
    const ripple = document.createElement('div');
    ripple.className = 'ink-ripple';
    ripple.style.left = `${e.clientX}px`;
    ripple.style.top = `${e.clientY}px`;
    document.body.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
  });

  function animateCursor() {
    cursorX += (mouseX - cursorX) * 0.16;
    cursorY += (mouseY - cursorY) * 0.16;
    if (cursor) {
      cursor.style.transform = `translate(${cursorX}px, ${cursorY}px)`;
    }
    requestAnimationFrame(animateCursor);
  }
  animateCursor();

  const interactiveEls = document.querySelectorAll('a, button, .project-card, .tool-chip, .paper-card, .process-step');
  interactiveEls.forEach(el => {
    el.addEventListener('mouseenter', () => cursor && cursor.classList.add('hovered'));
    el.addEventListener('mouseleave', () => cursor && cursor.classList.remove('hovered'));
  });

  // 3. Magnetic Button Pull Effect
  const magneticBtns = document.querySelectorAll('.btn, .nav-cta, .logo');
  magneticBtns.forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      btn.style.transform = `translate(${x * 0.25}px, ${y * 0.25}px) scale(1.04)`;
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = 'translate(0px, 0px) scale(1)';
    });
  });

  // 4. Intersection Observer for Scroll Reveals
  const observerOptions = { threshold: 0.12, rootMargin: "0px 0px -40px 0px" };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
        
        // Trigger SVG path drawing inside target
        const paths = entry.target.querySelectorAll('.draw-path');
        paths.forEach(p => p.classList.add('in'));

        // Trigger Meter Fills if inside skills section
        const meters = entry.target.querySelectorAll('.meter-fill');
        meters.forEach(m => {
          const targetWidth = m.getAttribute('data-width');
          if (targetWidth) m.style.width = targetWidth;
        });

        // Trigger Counter Animation
        const counters = entry.target.querySelectorAll('.counter');
        counters.forEach(c => animateCounter(c));
      }
    });
  }, observerOptions);

  document.querySelectorAll('.reveal, .draw-path').forEach(el => observer.observe(el));

  // 5. Number Counter Animation
  function animateCounter(counterEl) {
    if (counterEl.getAttribute('data-animated')) return;
    counterEl.setAttribute('data-animated', 'true');
    
    const target = parseInt(counterEl.getAttribute('data-target'), 10);
    const duration = 2000;
    const stepTime = 30;
    const steps = duration / stepTime;
    const increment = target / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        counterEl.textContent = target;
        clearInterval(timer);
      } else {
        counterEl.textContent = Math.floor(current);
      }
    }, stepTime);
  }

  // 6. 3D Parallax Tilt Effect on Project Cards
  const cards = document.querySelectorAll('.project-card');
  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = ((y - centerY) / centerY) * -7;
      const rotateY = ((x - centerX) / centerX) * 7;

      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-5px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)';
    });
  });

  // 7. Navigation Active Link Highlighting
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('nav.links a');

  window.addEventListener('scroll', () => {
    let currentSection = '';
    sections.forEach(sec => {
      const sectionTop = sec.offsetTop - 140;
      if (window.scrollY >= sectionTop) {
        currentSection = sec.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === '#' + currentSection) {
        link.classList.add('active');
      }
    });
  });

  // 8. Mobile Navigation Toggle & Link Auto-Close
  const mobileToggle = document.getElementById('mobileToggle');
  const navLinksContainer = document.getElementById('navLinks');
  if (mobileToggle && navLinksContainer) {
    mobileToggle.addEventListener('click', () => {
      navLinksContainer.classList.toggle('mobile-open');
      mobileToggle.textContent = navLinksContainer.classList.contains('mobile-open') ? '✕' : '☰';
    });

    navLinksContainer.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        if (navLinksContainer.classList.contains('mobile-open')) {
          navLinksContainer.classList.remove('mobile-open');
          mobileToggle.textContent = '☰';
        }
      });
    });
  }
});
