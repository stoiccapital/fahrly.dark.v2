// Load navbar HTML and init sticky header
function loadNavbar() {
  fetch('components/navbar.html')
    .then(response => response.text())
    .then(data => {
      document.getElementById('navbar-container').innerHTML = data;
      // Initialize sticky header scroll effect after navbar is loaded
      initStickyHeader();
    })
    .catch(error => console.error('Error loading navbar:', error));
}

// Load footer HTML
function loadFooter() {
  fetch('components/footer.html')
    .then(response => response.text())
    .then(data => {
      document.getElementById('footer-container').innerHTML = data;
    })
    .catch(error => console.error('Error loading footer:', error));
}

// Initialize sticky header scroll effect
function initStickyHeader() {
  window.addEventListener('scroll', function() {
    const header = document.querySelector('.site-header');
    if (header && window.scrollY > 50) {
      header.classList.add('site-header--scrolled');
    } else if (header) {
      header.classList.remove('site-header--scrolled');
    }
  });
}

// Initialize FAQ accordion
function initFAQ() {
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    question.addEventListener('click', function() {
      const isActive = item.classList.contains('active');
      // Close all items
      faqItems.forEach(i => i.classList.remove('active'));
      // Open clicked item if it wasn't active
      if (!isActive) {
        item.classList.add('active');
      }
    });
  });
}

// Initialize scroll animations with IntersectionObserver
function initScrollAnimations() {
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        // Only observe once to prevent re-triggering
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  // Observe only major containers, not individual cards
  const containersToAnimate = document.querySelectorAll(
    '#hero .hero-visual, ' +
    '#features .feature-stack, ' +
    '#pricing .pricing-grid, ' +
    '#testimonials .testimonials-grid, ' +
    '#security .security-grid, ' +
    '#faq .faq-list'
  );
  containersToAnimate.forEach(el => {
    el.classList.add('fade-in');
    observer.observe(el);
  });
}

// Initialize testimonial carousel
function initTestimonialCarousel() {
  const testimonialSection = document.querySelector('.testimonial-section');
  if (!testimonialSection) return;

  const track = testimonialSection.querySelector('.testimonial-track');
  const cards = testimonialSection.querySelectorAll('.testimonial-card');
  const prevBtn = testimonialSection.querySelector('.testimonial-nav--prev');
  const nextBtn = testimonialSection.querySelector('.testimonial-nav--next');
  
  if (!track || !cards.length || !prevBtn || !nextBtn) return;

  let currentIndex = 0;
  let isTransitioning = false;
  let autoplayInterval = null;
  const autoplayDelay = 6500; // 6.5 seconds
  
  function getCardsPerView() {
    return window.innerWidth <= 768 ? 1 : 2;
  }
  
  function getTotalSlides() {
    return Math.ceil(cards.length / getCardsPerView());
  }

  function updateCarouselPosition() {
    const cardsPerView = getCardsPerView();
    
    // Wait for cards to have width
    if (!cards[0] || cards[0].offsetWidth === 0) {
      setTimeout(updateCarouselPosition, 50);
      return;
    }
    
    const cardWidth = cards[0].offsetWidth;
    const gap = parseFloat(getComputedStyle(track).gap) || 24;
    const slideWidth = (cardWidth + gap) * cardsPerView;
    const translateX = -(currentIndex * slideWidth);
    
    track.style.transition = 'transform 600ms cubic-bezier(0.22, 0.61, 0.36, 1)';
    track.style.transform = `translateX(${translateX}px)`;
    updateNavButtons();
  }

  function updateNavButtons() {
    const totalSlides = getTotalSlides();
    // Use opacity instead of disabled to allow looping
    prevBtn.style.opacity = '1';
    nextBtn.style.opacity = '1';
    prevBtn.removeAttribute('disabled');
    nextBtn.removeAttribute('disabled');
  }

  function goToSlide(index) {
    if (isTransitioning) return;
    
    const totalSlides = getTotalSlides();
    currentIndex = Math.max(0, Math.min(index, totalSlides - 1));
    isTransitioning = true;
    
    updateCarouselPosition();
    
    setTimeout(() => {
      isTransitioning = false;
    }, 600);
  }

  function nextSlide() {
    const totalSlides = getTotalSlides();
    if (currentIndex < totalSlides - 1) {
      goToSlide(currentIndex + 1);
    } else {
      goToSlide(0); // Loop back to start
    }
  }

  function prevSlide() {
    const totalSlides = getTotalSlides();
    if (currentIndex > 0) {
      goToSlide(currentIndex - 1);
    } else {
      goToSlide(totalSlides - 1); // Loop to end
    }
  }

  function startAutoplay() {
    stopAutoplay();
    autoplayInterval = setInterval(() => {
      nextSlide();
    }, autoplayDelay);
  }

  function stopAutoplay() {
    if (autoplayInterval) {
      clearInterval(autoplayInterval);
      autoplayInterval = null;
    }
  }

  // Button event listeners
  nextBtn.addEventListener('click', function(e) {
    e.preventDefault();
    e.stopPropagation();
    nextSlide();
    stopAutoplay();
    startAutoplay();
  });

  prevBtn.addEventListener('click', function(e) {
    e.preventDefault();
    e.stopPropagation();
    prevSlide();
    stopAutoplay();
    startAutoplay();
  });

  // Keyboard navigation
  testimonialSection.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      prevSlide();
      stopAutoplay();
      startAutoplay();
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      nextSlide();
      stopAutoplay();
      startAutoplay();
    }
  });

  // Pause autoplay on hover
  testimonialSection.addEventListener('mouseenter', stopAutoplay);
  testimonialSection.addEventListener('mouseleave', startAutoplay);

  // Handle window resize
  let resizeTimeout;
  let lastCardsPerView = getCardsPerView();
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      const newCardsPerView = getCardsPerView();
      if (newCardsPerView !== lastCardsPerView) {
        lastCardsPerView = newCardsPerView;
        currentIndex = 0;
        updateCarouselPosition();
      }
    }, 250);
  });

  // Initialize after a short delay to ensure layout is ready
  setTimeout(() => {
    updateCarouselPosition();
    startAutoplay();
  }, 100);
}

// Initialize all functionality when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  loadNavbar();
  loadFooter();
  initFAQ();
  initScrollAnimations();
  initTestimonialCarousel();
});

