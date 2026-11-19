/* Brides Right Hand | Services Page Interactive Features
   Handles accessible image slideshow, touch gestures, keyboard controls, and timeline progress. */
(() => {
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ==========================================================================
     SECTION D: Wedding Image Slideshow
     ========================================================================== */
  const slideshow = document.querySelector('#wedding-slideshow');
  if (slideshow) {
    const slides = Array.from(slideshow.querySelectorAll('.slideshow-slide'));
    const dots = Array.from(slideshow.querySelectorAll('.slideshow-dot'));
    const prevBtn = slideshow.querySelector('.slideshow-prev');
    const nextBtn = slideshow.querySelector('.slideshow-next');
    const counter = slideshow.querySelector('#slideshow-counter');
    const total = slides.length;
    const CYCLE_DURATION = 4000; // 4 seconds per photograph
    let currentIndex = 0;
    let autoTimer = null;
    let isGalleryInView = false;

    function preloadNextSlide(index) {
      const nextIndex = (index + 1) % total;
      const nextImg = slides[nextIndex]?.querySelector('img');
      if (nextImg && nextImg.loading === 'lazy') {
        nextImg.loading = 'eager';
        if (nextImg.decode) {
          nextImg.decode().catch(() => {});
        }
      }
    }

    function stopAutoCycle() {
      if (autoTimer) {
        clearTimeout(autoTimer);
        autoTimer = null;
      }
    }

    function startAutoCycle() {
      stopAutoCycle();
      if (!isGalleryInView || reducedMotion) return;
      autoTimer = setTimeout(() => {
        updateSlideshow(currentIndex + 1);
      }, CYCLE_DURATION);
    }

    function updateSlideshow(newIndex, isManual = false) {
      if (newIndex < 0) newIndex = total - 1;
      if (newIndex >= total) newIndex = 0;

      const isSameSlide = (newIndex === currentIndex && isManual);
      currentIndex = newIndex;

      slides.forEach((slide, i) => {
        const isActive = i === currentIndex;
        if (isActive) {
          if (isSameSlide) {
            // Force re-trigger animation on same slide
            slide.classList.remove('active');
            void slide.offsetWidth;
          }
          slide.classList.add('active');
          slide.setAttribute('aria-hidden', 'false');
        } else {
          slide.classList.remove('active');
          slide.setAttribute('aria-hidden', 'true');
        }
      });

      dots.forEach((dot, i) => {
        const isActive = i === currentIndex;
        dot.classList.toggle('active', isActive);
        dot.setAttribute('aria-pressed', isActive ? 'true' : 'false');
      });

      if (counter) {
        counter.textContent = `${String(currentIndex + 1).padStart(2, '0')} / ${String(total).padStart(2, '0')}`;
      }

      preloadNextSlide(currentIndex);

      // Reset auto timer for the next 4s cycle
      startAutoCycle();
    }

    // Manual controls: Previous / Next
    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        updateSlideshow(currentIndex - 1, true);
      });
    }
    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        updateSlideshow(currentIndex + 1, true);
      });
    }

    // Manual controls: Dots
    dots.forEach((dot, i) => {
      dot.addEventListener('click', () => {
        updateSlideshow(i, true);
      });
    });

    // Keyboard navigation (ArrowLeft & ArrowRight)
    slideshow.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        updateSlideshow(currentIndex - 1, true);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        updateSlideshow(currentIndex + 1, true);
      }
    });

    // Touch Swipe Support
    let startX = 0;
    let startY = 0;
    let isSwiping = false;

    slideshow.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
        isSwiping = true;
      }
    }, { passive: true });

    slideshow.addEventListener('touchmove', (e) => {
      if (!isSwiping || e.touches.length !== 1) return;
      const currentX = e.touches[0].clientX;
      const currentY = e.touches[0].clientY;
      const diffX = currentX - startX;
      const diffY = currentY - startY;

      if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 45) {
        if (diffX < 0) {
          updateSlideshow(currentIndex + 1, true);
        } else {
          updateSlideshow(currentIndex - 1, true);
        }
        isSwiping = false;
      }
    }, { passive: true });

    slideshow.addEventListener('touchend', () => {
      isSwiping = false;
    });

    // Viewport IntersectionObserver: start when visible, pause when scrolled away
    const slideshowObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          isGalleryInView = true;
          startAutoCycle();
        } else {
          isGalleryInView = false;
          stopAutoCycle();
        }
      });
    }, { threshold: 0.25 });

    slideshowObserver.observe(slideshow);

    // Pause when page visibility is lost (e.g. tab switch), resume when visible
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        stopAutoCycle();
      } else if (isGalleryInView) {
        startAutoCycle();
      }
    });

    // Initialize slide 0 display and preload next
    preloadNextSlide(0);
  }

  /* ==========================================================================
     SECTION E: The Planning Journey Connector Animation
     ========================================================================== */
  const journeySection = document.querySelector('.planning-journey');
  if (journeySection) {
    const journeyObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          journeySection.classList.add('in-view');
          journeyObserver.unobserve(journeySection);
        }
      });
    }, { threshold: 0.15 });
    journeyObserver.observe(journeySection);
  }
})();
