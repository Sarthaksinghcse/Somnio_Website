/* ============================================================
   SOMNIO — Landing Page Scripts
   Scroll animations, mobile nav, active section tracking
   ============================================================ */

(function () {
  'use strict';

  // ============================================================
  // 0. PREMIUM SPLASH PRELOADER
  // ============================================================
  const preloader = document.getElementById('preloader');
  if (preloader) {
    // Disable body scrolling during preloading
    document.body.style.overflow = 'hidden';

    const startTime = Date.now();

    window.addEventListener('load', () => {
      const elapsedTime = Date.now() - startTime;
      // Guarantee a minimum of 2.5 seconds for visual loading branding
      const remainingTime = Math.max(0, 2500 - elapsedTime);

      setTimeout(() => {
        preloader.classList.add('fade-out');
        document.body.style.overflow = '';

        // Clean up DOM
        setTimeout(() => {
          preloader.remove();
        }, 600);
      }, remainingTime);
    });
  }

  // ============================================================
  // 1. SCROLL-TRIGGERED FADE-IN ANIMATIONS
  // ============================================================
  const revealElements = document.querySelectorAll('.reveal, .reveal-children');

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target); // Once visible, stay visible
        }
      });
    },
    {
      threshold: 0.05,
      rootMargin: '0px 0px -40px 0px',
    }
  );

  revealElements.forEach((el) => revealObserver.observe(el));

  // ============================================================
  // 2. MOBILE NAVIGATION TOGGLE
  // ============================================================
  const hamburger = document.getElementById('navHamburger');
  const mobileNav = document.getElementById('mobileNav');
  const mobileOverlay = document.getElementById('mobileNavOverlay');

  function toggleMobileNav() {
    const isOpen = mobileNav.classList.contains('open');

    hamburger.classList.toggle('open');
    mobileNav.classList.toggle('open');
    mobileOverlay.classList.toggle('open');
    hamburger.setAttribute('aria-expanded', !isOpen);

    // Prevent body scroll when menu is open
    document.body.style.overflow = isOpen ? '' : 'hidden';
  }

  function closeMobileNav() {
    hamburger.classList.remove('open');
    mobileNav.classList.remove('open');
    mobileOverlay.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  hamburger.addEventListener('click', toggleMobileNav);
  mobileOverlay.addEventListener('click', closeMobileNav);

  // Close mobile nav when a link is clicked
  mobileNav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', closeMobileNav);
  });

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileNav.classList.contains('open')) {
      closeMobileNav();
    }
  });

  // ============================================================
  // 3. ACTIVE NAV SECTION TRACKING
  // ============================================================
  const navLinks = document.querySelectorAll('.nav-links a[href^="#"]');
  const scrollTargets = [];

  navLinks.forEach((link) => {
    const href = link.getAttribute('href');
    if (href && href !== '#download') {
      const section = document.querySelector(href);
      if (section) {
        scrollTargets.push({ element: section, link: link });
      }
    }
  });

  function updateActiveSection() {
    const scrollPosition = window.pageYOffset + 120; // cushions sticky navbar height

    // Clear active states when near the top (in Hero section)
    if (window.pageYOffset < 120) {
      navLinks.forEach((l) => l.classList.remove('active'));
      return;
    }

    let currentActive = null;
    let maxTop = -1;

    scrollTargets.forEach((target) => {
      const top = target.element.getBoundingClientRect().top + window.pageYOffset;
      const height = target.element.offsetHeight;

      // Check if scroll is within the bounds of this section
      if (scrollPosition >= top && scrollPosition < top + height) {
        // Prioritize more specific/nested target (i.e. larger offsetTop)
        if (top > maxTop) {
          maxTop = top;
          currentActive = target;
        }
      }
    });

    if (currentActive) {
      navLinks.forEach((l) => l.classList.remove('active'));
      currentActive.link.classList.add('active');
    } else {
      navLinks.forEach((l) => l.classList.remove('active'));
    }
  }

  window.addEventListener('scroll', updateActiveSection, { passive: true });
  window.addEventListener('resize', updateActiveSection, { passive: true });
  updateActiveSection(); // Run initially

  // ============================================================
  // 4. SMOOTH SCROLL FOR ANCHOR LINKS
  // ============================================================
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (href === '#') return;

      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        const navHeight = document.getElementById('navbar').offsetHeight;
        const targetPosition =
          target.getBoundingClientRect().top + window.pageYOffset - navHeight;

        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth',
        });
      }
    });
  });

  // ============================================================
  // 5. NAVBAR BACKGROUND ON SCROLL
  // ============================================================
  const navbar = document.getElementById('navbar');

  window.addEventListener(
    'scroll',
    () => {
      const currentScroll = window.pageYOffset;

      if (currentScroll > 50) {
        navbar.style.background = 'rgba(0, 0, 0, 0.85)';
        navbar.style.borderBottomColor = 'rgba(255, 255, 255, 0.1)';
      } else {
        navbar.style.background = 'rgba(0, 0, 0, 0.7)';
        navbar.style.borderBottomColor = 'rgba(255, 255, 255, 0.06)';
      }
    },
    { passive: true }
  );

  // ============================================================
  // 6. SCROLL-DRIVEN CONNECTOR LINE
  // ============================================================
  const featuresSection = document.getElementById('features');
  const activePath = document.querySelector('.scroll-line-active');
  const glowPath = document.querySelector('.scroll-line-glow');
  const trackPath = document.querySelector('.scroll-line-track');
  const infoCards = featuresSection ? featuresSection.querySelectorAll('.feature-info') : [];

  if (featuresSection && activePath && glowPath && trackPath && infoCards.length > 0) {
    let pathLength = 0;

    // Calculates coordinates relative to the #features container
    function getRelativeCoords(element, parent) {
      let x = 0;
      let y = 0;
      let current = element;
      while (current && current !== parent) {
        x += current.offsetLeft;
        y += current.offsetTop;
        current = current.offsetParent;
      }
      return {
        x: x + element.offsetWidth / 2,
        y: y + element.offsetHeight / 2
      };
    }

    function updatePath() {
      const points = Array.from(infoCards).map(card => getRelativeCoords(card, featuresSection));
      if (points.length === 0) return;

      let d = `M ${points[0].x} ${points[0].y}`;
      for (let i = 0; i < points.length - 1; i++) {
        const p1 = points[i];
        const p2 = points[i + 1];
        const dY = p2.y - p1.y;
        const dX = Math.abs(p2.x - p1.x);

        if (dX < 50) {
          // Stacked layout (mobile) — draw straight vertical line
          d += ` L ${p2.x} ${p2.y}`;
        } else {
          // Curved layout (desktop/tablet) — draw smooth S-curve
          const cp1y = p1.y + dY * 0.45;
          const cp2y = p2.y - dY * 0.45;
          d += ` C ${p1.x} ${cp1y}, ${p2.x} ${cp2y}, ${p2.x} ${p2.y}`;
        }
      }

      // Apply the generated path d-attribute to all path elements
      trackPath.setAttribute('d', d);
      activePath.setAttribute('d', d);
      glowPath.setAttribute('d', d);

      // Recalculate path length for dash animations
      pathLength = activePath.getTotalLength();

      activePath.style.strokeDasharray = pathLength;
      glowPath.style.strokeDasharray = pathLength;

      // Force recalculation of scroll position
      onScroll();
    }

    function onScroll() {
      if (!pathLength) return;

      // Get document-relative Y for start and end cards
      const card0 = infoCards[0];
      const cardN = infoCards[infoCards.length - 1];

      const rect0 = card0.getBoundingClientRect();
      const rectN = cardN.getBoundingClientRect();

      const y0 = rect0.top + window.pageYOffset + rect0.height / 2;
      const yN = rectN.top + window.pageYOffset + rectN.height / 2;

      // Determine viewport trigger line (65% of viewport height)
      const triggerY = window.pageYOffset + window.innerHeight * 0.65;

      let progress = (triggerY - y0) / (yN - y0);
      progress = Math.max(0, Math.min(1, progress));

      const offset = pathLength - (progress * pathLength);
      activePath.style.strokeDashoffset = offset;
      glowPath.style.strokeDashoffset = offset;
    }

    let resizeAnimationFrame;
    function handleResize() {
      if (resizeAnimationFrame) {
        window.cancelAnimationFrame(resizeAnimationFrame);
      }
      resizeAnimationFrame = window.requestAnimationFrame(updatePath);
    }

    // Set up listeners
    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('load', updatePath);

    // Initial setup
    updatePath();
    // Re-run shortly after dom content loaded just in case layout shifts
    setTimeout(updatePath, 200);
  }

  // ============================================================
  // 7. INTERACTIVE 3D GLASS CARD TILT & SHINE EFFECT
  // ============================================================
  const interactiveCards = document.querySelectorAll('.feature-info, .glass-card:not(.legal-content-card):not(.flip-card-front):not(.flip-card-back)');

  interactiveCards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      // Only apply 3D effects if the card is fully revealed
      const parentRow = card.closest('.feature-row, .reveal-children');
      const isRevealed = parentRow
        ? parentRow.classList.contains('visible')
        : (!card.classList.contains('reveal') || card.classList.contains('visible'));
      if (!isRevealed) return;

      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left; // cursor X inside card
      const y = e.clientY - rect.top;  // cursor Y inside card

      // Update custom properties for CSS radial shine highlight
      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      // Calculate rotation angles (max 8 degrees for elegant restraint)
      const rotateX = ((y - centerY) / centerY) * -8;
      const rotateY = ((x - centerX) / centerX) * 8;

      // Apply 3D transform perspective, rotate, and scale slightly up (1.02)
      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
      card.style.transition = 'transform 100ms cubic-bezier(0.25, 0.46, 0.45, 0.94)';
    });

    card.addEventListener('mouseleave', () => {
      // Smoothly reset transformations
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
      card.style.transition = 'transform 450ms cubic-bezier(0.25, 0.46, 0.45, 0.94)';

      // Move shine spotlight off screen
      card.style.setProperty('--mouse-x', `-999px`);
      card.style.setProperty('--mouse-y', `-999px`);
    });
  });

  // ============================================================
  // 8. SLEEP DUST CANVAS PARTICLES
  // ============================================================
  const canvas = document.getElementById('sleep-dust-canvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let particles = [];
    let mouse = { x: null, y: null, radius: 120 };

    // Handle resize
    function resizeCanvas() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initParticles();
    }

    // Particle class
    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 1.4 + 0.3;
        this.speedX = Math.random() * 0.4 - 0.2;
        this.speedY = Math.random() * 0.4 - 0.2;
        this.alpha = Math.random() * 0.5 + 0.15;
        this.fadeDir = Math.random() > 0.5 ? 0.005 : -0.005;
        this.color = Math.random() > 0.6
          ? '155, 77, 255' // Purple
          : (Math.random() > 0.5 ? '74, 144, 226' : '255, 255, 255'); // Blue or White
      }

      update() {
        // Drift
        this.x += this.speedX;
        this.y += this.speedY;

        // Wrap around boundaries
        if (this.x < 0) this.x = canvas.width;
        if (this.x > canvas.width) this.x = 0;
        if (this.y < 0) this.y = canvas.height;
        if (this.y > canvas.height) this.y = 0;

        // Pulse alpha (so they twinkle like real stars!)
        this.alpha += this.fadeDir;
        if (this.alpha > 0.65 || this.alpha < 0.1) {
          this.fadeDir = -this.fadeDir;
        }

        // React to mouse movement
        if (mouse.x !== null && mouse.y !== null) {
          const dx = mouse.x - this.x;
          const dy = mouse.y - this.y;
          const distance = Math.hypot(dx, dy);
          if (distance < mouse.radius) {
            // Gentle attraction
            const force = (mouse.radius - distance) / mouse.radius;
            this.x += (dx / distance) * force * 0.4;
            this.y += (dy / distance) * force * 0.4;
          }
        }
      }

      draw() {
        ctx.save();
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${this.color}, ${this.alpha})`;
        if (this.size > 1.2) {
          ctx.shadowBlur = 4;
          ctx.shadowColor = `rgba(${this.color}, ${this.alpha})`;
        }
        ctx.fill();
        ctx.restore();
      }
    }

    function initParticles() {
      particles = [];
      const maxCount = window.innerWidth < 768 ? 40 : 120;
      for (let i = 0; i < maxCount; i++) {
        particles.push(new Particle());
      }
    }

    function animateParticles() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.update();
        p.draw();
      });
      requestAnimationFrame(animateParticles);
    }

    // Listeners
    window.addEventListener('resize', resizeCanvas);
    window.addEventListener('mousemove', (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    });

    window.addEventListener('mouseleave', () => {
      mouse.x = null;
      mouse.y = null;
    });

    // Check for prefers-reduced-motion to keep performance accessible
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (!motionQuery.matches) {
      resizeCanvas();
      animateParticles();
    }
  }

  // ============================================================
  // 9. MOUSE-FOLLOWING GLOW ORB
  // ============================================================
  const glowOrb = document.getElementById('interactiveGlowOrb');
  if (glowOrb) {
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (!motionQuery.matches) {
      let currentX = window.innerWidth / 2;
      let currentY = window.innerHeight / 2;
      let targetX = currentX;
      let targetY = currentY;

      window.addEventListener('mousemove', (e) => {
        targetX = e.clientX;
        targetY = e.clientY;
      }, { passive: true });

      function updateOrb() {
        const dx = targetX - currentX;
        const dy = targetY - currentY;
        currentX += dx * 0.08; // smooth interpolation factor (inertia)
        currentY += dy * 0.08;
        glowOrb.style.transform = `translate3d(${currentX}px, ${currentY}px, 0) translate(-50%, -50%)`;
        requestAnimationFrame(updateOrb);
      }
      updateOrb();
    } else {
      glowOrb.style.display = 'none';
    }
  }

  // ============================================================
  // 10. CUSTOM COMET STAR CURSOR
  // ============================================================
  function initCustomCursor() {
    const hoverQuery = window.matchMedia('(hover: hover) and (pointer: fine)');
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    // Check if device supports hover and doesn't prefer reduced motion
    if (!hoverQuery.matches || motionQuery.matches) return;

    // Create cursor container
    const cursorContainer = document.createElement('div');
    cursorContainer.className = 'custom-cursor-container';
    cursorContainer.setAttribute('aria-hidden', 'true');
    document.body.appendChild(cursorContainer);

    // Create comet head (the main star)
    const cometHead = document.createElement('div');
    cometHead.className = 'comet-head';
    cometHead.innerHTML = `
      <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="star-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#FFFFFF" />
            <stop offset="50%" stop-color="#D6B4FF" />
            <stop offset="100%" stop-color="#9B4DFF" />
          </linearGradient>
        </defs>
        <path d="M12 2C12 7.5 16.5 12 22 12C16.5 12 12 16.5 12 22C12 16.5 7.5 12 2 12C7.5 12 12 7.5 12 2Z" fill="url(#star-gradient)"/>
      </svg>
    `;
    cursorContainer.appendChild(cometHead);

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let headX = mouseX;
    let headY = mouseY;
    let lastSpawnX = mouseX;
    let lastSpawnY = mouseY;
    let hasMoved = false;

    // Update mouse positions
    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      if (!hasMoved) {
        hasMoved = true;
        cometHead.classList.add('visible');
        headX = mouseX;
        headY = mouseY;
      }
    }, { passive: true });

    // Track click state
    window.addEventListener('mousedown', () => {
      cometHead.classList.add('clicking');
    });
    window.addEventListener('mouseup', () => {
      cometHead.classList.remove('clicking');
    });

    // Handle mouse leaving window
    document.addEventListener('mouseleave', () => {
      cometHead.classList.remove('visible');
      hasMoved = false;
    });

    // Highlight on links / buttons
    window.addEventListener('mouseover', (e) => {
      const target = e.target;
      if (target && (target.closest('a') || target.closest('button') || target.closest('.btn') || target.closest('[role="button"]') || target.closest('input[type="submit"]'))) {
        cometHead.classList.add('hovering-link');
      } else {
        cometHead.classList.remove('hovering-link');
      }
    });

    // Particle colors matching sleep dust: purple, blue, white
    const colors = [
      '#9B4DFF', // Purple
      '#4A90E2', // Blue
      '#FFFFFF'  // White
    ];

    function createTailParticle(x, y) {
      const particle = document.createElement('div');
      particle.className = 'comet-tail-particle';

      // Randomize color, size, and rotation
      const size = Math.random() * 12 + 6; // 6px to 18px
      const color = colors[Math.floor(Math.random() * colors.length)];

      particle.style.width = `${size}px`;
      particle.style.height = `${size}px`;
      particle.style.left = `${x}px`;
      particle.style.top = `${y}px`;

      particle.innerHTML = `
        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2C12 7.5 16.5 12 22 12C16.5 12 12 16.5 12 22C12 16.5 7.5 12 2 12C7.5 12 12 7.5 12 2Z" fill="${color}" />
        </svg>
      `;

      cursorContainer.appendChild(particle);

      // Remove particle after animation ends
      setTimeout(() => {
        particle.remove();
      }, 700);
    }

    // Animation Loop
    function updateCursor() {
      // Lerp for smooth comet delay
      const dx = mouseX - headX;
      const dy = mouseY - headY;

      headX += dx * 0.15; // Inertia factor (lower = smoother comet delay)
      headY += dy * 0.15;

      // Update comet head position
      cometHead.style.transform = `translate3d(${headX}px, ${headY}px, 0) translate(-50%, -50%)`;

      // Check distance from last particle spawn to create beautiful tail spacing
      const dist = Math.hypot(headX - lastSpawnX, headY - lastSpawnY);
      if (dist > 8 && hasMoved) {
        createTailParticle(headX, headY);
        lastSpawnX = headX;
        lastSpawnY = headY;
      }

      requestAnimationFrame(updateCursor);
    }

    updateCursor();
  }

  initCustomCursor();

  // ============================================================
  // 11. COMING SOON POPUP MODAL
  // ============================================================
  function initPopupModal() {
    const modal = document.getElementById('appStoreModal');
    const closeBtn = document.getElementById('closeModalBtn');
    const okBtn = document.getElementById('modalOkBtn');
    const badgeLinks = document.querySelectorAll('#hero-cta-primary, #download-store-link');

    if (!modal || !okBtn) return;

    function openModal(e) {
      e.preventDefault();
      modal.classList.add('open');
      document.body.style.overflow = 'hidden'; // prevent scrolling behind modal
    }

    function closeModal() {
      modal.classList.remove('open');
      document.body.style.overflow = ''; // restore scrolling
    }

    badgeLinks.forEach(link => {
      link.addEventListener('click', openModal);
    });

    if (closeBtn) {
      closeBtn.addEventListener('click', closeModal);
    }
    okBtn.addEventListener('click', closeModal);

    // Close on click outside modal card
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeModal();
      }
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.classList.contains('open')) {
        closeModal();
      }
    });
  }

  initPopupModal();

  // ============================================================
  // 12. WORD HOVER HIGHLIGHT EFFECT & PROXIMITY GLOW
  // ============================================================
  function initWordHoverEffect() {
    const textBodies = document.querySelectorAll('.feature-info .text-body, .feature-info .heading-feature');

    textBodies.forEach(p => {
      const text = p.textContent;
      const words = text.split(/\s+/);
      p.innerHTML = words.map(word => {
        return `<span class="hover-word">${word}</span>`;
      }).join(' ');
    });

    const hoverWords = [];
    document.querySelectorAll('.hover-word').forEach(wordSpan => {
      hoverWords.push({
        element: wordSpan,
        rect: null
      });
    });

    const cards = document.querySelectorAll('.glass-card, .feature-info');

    cards.forEach(card => {
      card.addEventListener('mouseenter', () => {
        // Caches coordinates on hover start to prevent layout thrashing on mousemove
        hoverWords.forEach(item => {
          if (card.contains(item.element)) {
            const rect = item.element.getBoundingClientRect();
            item.rect = {
              x: rect.left + rect.width / 2 + window.scrollX,
              y: rect.top + rect.height / 2 + window.scrollY
            };
          }
        });
      });

      card.addEventListener('mousemove', (e) => {
        const mouseX = e.pageX;
        const mouseY = e.pageY;
        const radius = 100; // Highlight radius in pixels

        hoverWords.forEach(item => {
          if (!item.rect) return;
          const dx = mouseX - item.rect.x;
          const dy = mouseY - item.rect.y;
          const dist = Math.hypot(dx, dy);

          if (dist < radius) {
            const factor = 1 - dist / radius; // 1 at center, 0 at border
            item.element.style.color = `color-mix(in srgb, var(--somnio-purple) ${Math.round(factor * 100)}%, rgba(255, 255, 255, 0.8))`;
            item.element.style.transform = `scale(${1 + factor * 0.06})`;
          } else {
            item.element.style.color = '';
            item.element.style.transform = '';
          }
        });
      });

      card.addEventListener('mouseleave', () => {
        hoverWords.forEach(item => {
          if (card.contains(item.element)) {
            item.element.style.color = '';
            item.element.style.transform = '';
            item.rect = null;
          }
        });
      });
    });
  }

  initWordHoverEffect();
})();

