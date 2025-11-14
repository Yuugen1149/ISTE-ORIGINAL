// ============================================
// ISTE Society Website - Main JavaScript (Optimized)
// ============================================

// Optimized event delegation for better performance
const NavigationHandler = (() => {
    const setSessionFlag = (key, value) => {
        try { sessionStorage.setItem(key, value); } catch (e) { console.warn('SessionStorage unavailable'); }
    };

    const handleAnchorClick = (e) => {
        const anchor = e.target.closest('a[href^="#"]');
        if (!anchor) return;
        
        e.preventDefault();
        const target = document.querySelector(anchor.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            if (anchor.classList.contains('nav-link')) {
                document.querySelectorAll('.nav-link').forEach(nl => nl.classList.remove('active'));
                anchor.classList.add('active');
            }
        }
    };

    const handleForumClick = (e) => {
        const link = e.target.closest('.forum-link, .forum-card-link, a[href*="forum-"]');
        if (link) {
            setSessionFlag('iste_skip_intro', '1');
            if (link.classList.contains('forum-card-link')) {
                setSessionFlag('iste_from_forum', '1');
            }
        }
    };

    const init = () => {
        document.addEventListener('click', handleAnchorClick);
        document.addEventListener('click', handleForumClick);
    };

    return { init };
})();

// Initialize navigation on DOM load
document.addEventListener('DOMContentLoaded', () => {
    NavigationHandler.init();
    MobileMenuHandler.init();
});

// ============================================
// Mobile Menu Handler
// ============================================
const MobileMenuHandler = (() => {
    const hamburger = document.querySelector('.hamburger-menu');
    const closeBtn = document.querySelector('.mobile-menu-overlay .close-btn');
    const overlay = document.querySelector('.mobile-menu-overlay');
    const navLinks = document.querySelectorAll('.mobile-nav-menu a');

    const toggleMenu = () => {
        overlay.classList.toggle('open');
        document.body.style.overflow = overlay.classList.contains('open') ? 'hidden' : '';
    };

    const closeMenu = () => {
        overlay.classList.remove('open');
        document.body.style.overflow = '';
    };

    const handleLinkClick = (e) => {
        if (e.target.closest('a')) {
            closeMenu();
        }
    };

    const init = () => {
        if (hamburger && closeBtn && overlay) {
            hamburger.addEventListener('click', toggleMenu);
            closeBtn.addEventListener('click', closeMenu);
            overlay.addEventListener('click', (e) => {
                // Close if clicking outside the menu content, but inside the overlay
                if (e.target === overlay) {
                    closeMenu();
                }
            });
            navLinks.forEach(link => {
                link.addEventListener('click', handleLinkClick);
            });
        }
    };

    return { init };
})();

// Create interactive dense starfield
let stars = [];
let mouseX = 0;
let mouseY = 0;
let isMouseMoving = false;
let mouseTimeout;
let scrollY = 0;

function createInteractiveStarfield() {
    const container = document.querySelector('.meteors');
    if (!container) return;

    const isMobile = window.matchMedia('(max-width: 768px)').matches;
    const starCount = isMobile ? 100 : 300; // Reduced star count for mobile performance

    // Clear existing stars
    container.innerHTML = '';
    stars = [];

    for (let i = 0; i < starCount; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        
        // Random position
        const x = Math.random() * window.innerWidth;
        const y = Math.random() * window.innerHeight;
        star.style.left = x + 'px';
        star.style.top = y + 'px';
        
        // Random size class
        const sizeRand = Math.random();
        if (sizeRand < 0.5) {
            star.classList.add('tiny');
        } else if (sizeRand < 0.8) {
            star.classList.add('small');
        } else if (sizeRand < 0.95) {
            star.classList.add('medium');
        } else {
            star.classList.add('large');
        }
        
        // Some stars twinkle
        if (Math.random() < 0.3) {
            star.classList.add('twinkle');
            star.style.setProperty('--twinkle-duration', (2 + Math.random() * 3) + 's');
        }
        
        // Add subtle color variations to some stars (15% colored)
        if (Math.random() < 0.15) {
            const colors = ['color-blue', 'color-purple', 'color-cyan', 'color-pink'];
            const randomColor = colors[Math.floor(Math.random() * colors.length)];
            star.classList.add(randomColor);
        }
        
        // Random float animation properties
        star.style.setProperty('--float-duration', (8 + Math.random() * 8) + 's');
        star.style.setProperty('--float-delay', (Math.random() * 5) + 's');
        star.style.setProperty('--base-opacity', (0.7 + Math.random() * 0.3));
        
        container.appendChild(star);
        
        // Store star data for interaction
        // Different parallax speeds based on star size (depth)
        let parallaxSpeed;
        if (star.classList.contains('tiny')) {
            parallaxSpeed = 0.1; // Slowest - furthest away
        } else if (star.classList.contains('small')) {
            parallaxSpeed = 0.25;
        } else if (star.classList.contains('medium')) {
            parallaxSpeed = 0.4;
        } else {
            parallaxSpeed = 0.6; // Fastest - closest
        }
        
        stars.push({
            element: star,
            x: x,
            y: y,
            originalX: x,
            originalY: y,
            vx: 0,
            vy: 0,
            parallaxSpeed: parallaxSpeed,
            interactionScale: 1
        });
    }
    
    // Start interaction loop
    setupStarInteraction();
}

// Setup mouse/touch interaction
function setupStarInteraction() {
    const container = document.querySelector('.space-background');
    if (!container) return;

    // Mouse move handler - track across entire background
    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        isMouseMoving = true;
        
        clearTimeout(mouseTimeout);
        mouseTimeout = setTimeout(() => {
            isMouseMoving = false;
        }, 100);
    });
    
    // Touch move handler - track across entire document
    document.addEventListener('touchmove', (e) => {
        if (e.touches.length > 0) {
            mouseX = e.touches[0].clientX;
            mouseY = e.touches[0].clientY;
            isMouseMoving = true;
            
            clearTimeout(mouseTimeout);
            mouseTimeout = setTimeout(() => {
                isMouseMoving = false;
            }, 100);
        }
    }, { passive: true });
    
    // Initialize scroll position immediately
    scrollY = window.pageYOffset || window.scrollY;
    
    // Track scroll position continuously
    window.addEventListener('scroll', () => {
        scrollY = window.pageYOffset || window.scrollY;
    }, { passive: true });
    
    // Animation loop for star interaction and parallax
    function animateStars() {
        // Global mouse parallax - all stars follow mouse subtly
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;
        const mouseOffsetX = (mouseX - centerX) / centerX;
        const mouseOffsetY = (mouseY - centerY) / centerY;
        
        if (isMouseMoving) {
            stars.forEach(star => {
                const dx = star.x - mouseX;
                const dy = star.y - mouseY;
                const distance = Math.sqrt(dx * dx + dy * dy);
                const maxDistance = 50; // Interaction radius (minimal)
                
                if (distance < maxDistance) {
                    // Push stars away from cursor (minimal intensity)
                    const force = (maxDistance - distance) / maxDistance;
                    const angle = Math.atan2(dy, dx);
                    const pushX = Math.cos(angle) * force * 15;
                    const pushY = Math.sin(angle) * force * 15;
                    
                    star.vx += pushX * 0.05;
                    star.vy += pushY * 0.05;
                    
                    // Enhance glow when interacting (reduced intensity)
                    const glowIntensity = 1 + force * 0.8;
                    star.interactionScale = glowIntensity;
                    star.element.style.opacity = Math.min(1, 0.8 + force * 0.2);
                }
            });
        }
        
        // Apply physics and return to original position
        stars.forEach(star => {
            // Damping
            star.vx *= 0.95;
            star.vy *= 0.95;
            
            // Spring back to original position
            const returnForce = 0.05;
            star.vx += (star.originalX - star.x) * returnForce;
            star.vy += (star.originalY - star.y) * returnForce;
            
            // Update position
            star.x += star.vx;
            star.y += star.vy;
            
            // Calculate parallax offset based on scroll position
            const parallaxOffsetY = -scrollY * star.parallaxSpeed;
            
            // Global mouse parallax - stars follow mouse movement (minimal ripple)
            const mouseParallaxX = mouseOffsetX * star.parallaxSpeed * 5;
            const mouseParallaxY = mouseOffsetY * star.parallaxSpeed * 5;
            
            // Calculate final position with interaction, scroll parallax, and mouse parallax
            const offsetX = star.x - star.originalX + mouseParallaxX;
            const offsetY = star.y - star.originalY + parallaxOffsetY + mouseParallaxY;
            
            // Apply transform with scale
            const scale = star.interactionScale || 1;
            star.element.style.transform = `translate(${offsetX}px, ${offsetY}px) scale(${scale})`;
            
            // Gradually return opacity and scale to normal
            const currentOpacity = parseFloat(star.element.style.opacity) || parseFloat(star.element.style.getPropertyValue('--base-opacity')) || 0.8;
            const targetOpacity = parseFloat(star.element.style.getPropertyValue('--base-opacity')) || 0.8;
            star.element.style.opacity = currentOpacity * 0.98 + targetOpacity * 0.02;
            
            if (star.interactionScale && star.interactionScale > 1) {
                star.interactionScale *= 0.95;
                if (star.interactionScale < 1.01) star.interactionScale = 1;
            }
        });
        
        requestAnimationFrame(animateStars);
    }
    
    animateStars();
}

// Create starfield on page load
window.addEventListener('DOMContentLoaded', () => {
    // Initialize scroll position
    scrollY = window.pageYOffset || window.scrollY;
    createInteractiveStarfield();
});

// Recreate stars on window resize
let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        createInteractiveStarfield();
    }, 500);
});

// Active navigation link highlighting
function updateActiveNavLink() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    
    if (sections.length === 0 || navLinks.length === 0) return;
    
    window.addEventListener('scroll', () => {
        let current = '';
        const scrollY = window.pageYOffset;
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (scrollY >= (sectionTop - 200)) {
                current = section.getAttribute('id');
            }
        });
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    });
}

// Initialize active nav link highlighting
updateActiveNavLink();

// Smooth horizontal scrolling for news and events
function setupHorizontalScroll() {
    const scrollContainers = document.querySelectorAll('.news-scroll, .events-scroll');
    
    scrollContainers.forEach(container => {
        let isDown = false;
        let startX;
        let scrollLeft;
        
        container.addEventListener('mousedown', (e) => {
            isDown = true;
            container.style.cursor = 'grabbing';
            startX = e.pageX - container.offsetLeft;
            scrollLeft = container.scrollLeft;
        });
        
        container.addEventListener('mouseleave', () => {
            isDown = false;
            container.style.cursor = 'grab';
        });
        
        container.addEventListener('mouseup', () => {
            isDown = false;
            container.style.cursor = 'grab';
        });
        
        container.addEventListener('mousemove', (e) => {
            if (!isDown) return;
            e.preventDefault();
            const x = e.pageX - container.offsetLeft;
            const walk = (x - startX) * 2;
            container.scrollLeft = scrollLeft - walk;
        });
        
        // Touch support for mobile
        let touchStartX = 0;
        let touchScrollLeft = 0;
        
        container.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].pageX - container.offsetLeft;
            touchScrollLeft = container.scrollLeft;
        });
        
        container.addEventListener('touchmove', (e) => {
            const x = e.touches[0].pageX - container.offsetLeft;
            const walk = (x - touchStartX) * 2;
            container.scrollLeft = touchScrollLeft - walk;
        });
    });
}

// Initialize horizontal scrolling after DOM loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupHorizontalScroll);
} else {
    setupHorizontalScroll();
}

// Add mouse wheel horizontal scrolling for events
function setupWheelScrolling() {
    const scrollContainers = document.querySelectorAll('.news-scroll, .events-scroll');
    
    if (scrollContainers.length === 0) {
        console.log('No scroll containers found');
        return;
    }
    
    scrollContainers.forEach(container => {
        container.addEventListener('wheel', (e) => {
            // Check if scrolling horizontally is possible
            if (container.scrollWidth > container.clientWidth) {
                const scrollLeft = container.scrollLeft;
                const maxScrollLeft = container.scrollWidth - container.clientWidth;
                
                // Determine scroll direction
                const scrollingRight = e.deltaY > 0;
                const scrollingLeft = e.deltaY < 0;
                
                // Check if we can scroll in the intended direction
                const atRightEdge = scrollLeft >= maxScrollLeft - 1; // -1 for rounding tolerance
                const atLeftEdge = scrollLeft <= 1; // 1 for rounding tolerance
                
                // Only prevent vertical scroll if horizontal scroll is available
                if ((scrollingRight && !atRightEdge) || (scrollingLeft && !atLeftEdge)) {
                    e.preventDefault();
                    container.scrollLeft += e.deltaY * 2;
                }
                // When at edge, allow vertical scrolling by not preventing default
            }
        }, { passive: false });
    });
}

// Initialize wheel scrolling after DOM loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupWheelScrolling);
} else {
    setupWheelScrolling();
}

// Add parallax effect to hero section
function addParallaxEffect() {
    const hero = document.querySelector('.hero');
    if (!hero) return;
    
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        if (hero) {
            hero.style.transform = `translateY(${scrolled * 0.5}px)`;
            hero.style.opacity = 1 - (scrolled / 500);
        }
    });
}

// Initialize parallax effect
addParallaxEffect();

// Card hover animations enhancement
document.querySelectorAll('.stat-card, .news-card, .event-card, .member-card').forEach(card => {
    card.addEventListener('mouseenter', function() {
        this.style.transition = 'all 0.3s ease';
    });
});

// Join button click handler - allow navigation to join.html
// Navigation is handled by href attributes, no need to intercept clicks

// Add reveal-on-scroll animations (uses classes .reveal and .in-view)
function observeElements() {
    const selectors = [
        '.hero-content',
        '.hero-title',
        '.hero-subtitle',
        '.about-box',
        '.about-text',
        '.stat-card',
        '.news-card',
        '.event-card',
        '.member-card',
        '.forum-card',
        '.overview-card',
        '.learn-item',
        '.visual-card',
        '.workshop-hero-content',
        '.workshop-cta',
        '.section-header-center',
        '.forums-grid .forum-card',
        '.news-card-link',
        '.events-scroll',
        '.iste-info-box',
        '.iste-text',
        '.iste-section-title',
        '.iste-stats-grid',
        '.iste-stat-item',
        '.iste-activities-list li',
        '.page-title',
        '.page-subtitle',
        '.section-title',
        '.hero-buttons',
    ];

    const elements = document.querySelectorAll(selectors.join(', '));
    if (!elements || elements.length === 0) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            const el = entry.target;
            // Use any data attribute for custom delay (ms)
            const delay = el.dataset.revealDelay ? Number(el.dataset.revealDelay) : 0;
            if (entry.isIntersecting) {
                if (delay) el.style.transitionDelay = `${delay}ms`;
                // add visible class so CSS transition runs
                el.classList.add('in-view');
            } else {
                // remove visible class so the animation can run again when re-entering
                el.classList.remove('in-view');
                // force reflow to ensure the animation can retrigger on next add
                void el.offsetWidth;
                // clear inline transitionDelay after the element has left to avoid stacking delays
                // (kept short to let the exit transition complete)
                setTimeout(() => {
                    el.style.transitionDelay = '';
                }, 180);
            }
        });
    }, { threshold: 0.12, rootMargin: '0px 0px -80px 0px' });

    elements.forEach((el, i) => {
        // add base class and a small stagger by default
        if (!el.classList.contains('reveal')) el.classList.add('reveal');
        if (!el.dataset.revealDelay) el.dataset.revealDelay = i * 20;

        // Alternate slide direction: even = left, odd = right — but respect any existing slide-* class
        if (!el.classList.contains('slide-left') && !el.classList.contains('slide-right')) {
            if (i % 2 === 0) el.classList.add('slide-left');
            else el.classList.add('slide-right');
        }

        observer.observe(el);
    });
}

// Initialize scroll animations after DOM is ready (also handle case where DOMContentLoaded already fired)
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', observeElements);
} else {
    // DOM already ready
    observeElements();
}

// Play a quick pop-in for forum cards if returning from a department page
function playForumsReturnAnimationIfNeeded() {
    try {
        const cameFromForum = sessionStorage.getItem('iste_from_forum') === '1';
        const grid = document.querySelector('.forums-grid');
        if (!cameFromForum || !grid) return;

        const cards = grid.querySelectorAll('.forum-card');
        cards.forEach((card, i) => {
            // add the helper class and stagger via animationDelay
            card.style.animationDelay = `${i * 80}ms`;
            card.classList.add('forums-return');
        });

        // Clear the flag so this only happens once per click/navigation
        try { sessionStorage.removeItem('iste_from_forum'); } catch (e) {}

        // Cleanup animation classes after they finish so they can replay later
        setTimeout(() => {
            cards.forEach(card => {
                card.classList.remove('forums-return');
                card.style.animationDelay = '';
            });
        }, 1000 + (cards.length * 80));
    } catch (e) {
        // ignore errors
    }
}

// Run on initial load and on pageshow (to handle back-forward cache restores)
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', playForumsReturnAnimationIfNeeded);
} else {
    playForumsReturnAnimationIfNeeded();
}
window.addEventListener('pageshow', playForumsReturnAnimationIfNeeded);

// Responsive navigation menu (for mobile)
function setupMobileMenu() {
    const navMenu = document.querySelector('.nav-menu');
    if (!navMenu) return;
    
    // Add mobile menu toggle if needed in future
    // For now, navigation is handled via CSS media queries
}

// Initialize mobile menu
setupMobileMenu();

// Header hide/show on scroll (hide when scrolling down, show when scrolling up)
function setupHeaderScrollHide() {
    const header = document.querySelector('.header');
    if (!header) return;

    let lastScroll = window.pageYOffset || 0;
    let ticking = false;
    const delta = 10; // minimum px change to trigger

    function onScroll() {
        const current = window.pageYOffset || 0;
        // when near top, always show header
        if (current <= 40) {
            header.classList.remove('header-hidden');
            lastScroll = current;
            return;
        }

        if (Math.abs(current - lastScroll) <= delta) {
            // ignore tiny scrolls
            return;
        }

        if (current > lastScroll && current > 60) {
            // scrolling down
            header.classList.add('header-hidden');
        } else if (current < lastScroll) {
            // scrolling up
            header.classList.remove('header-hidden');
        }

        lastScroll = current;
    }

    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                onScroll();
                ticking = false;
            });
            ticking = true;
        }
    }, { passive: true });
}

// Initialize header scroll hide
setupHeaderScrollHide();

// More menu toggle and accessibility
function setupMoreMenu() {
    const menus = document.querySelectorAll('.more-menu');
    if (!menus || menus.length === 0) return;

    menus.forEach(menu => {
        const button = menu.querySelector('.more-button');
        const dropdown = menu.querySelector('.more-dropdown');

        if (!button || !dropdown) return;

        function openMenu() {
            dropdown.classList.add('show');
            button.setAttribute('aria-expanded', 'true');
        }

        function closeMenu() {
            dropdown.classList.remove('show');
            button.setAttribute('aria-expanded', 'false');
        }

        button.addEventListener('click', (e) => {
            e.stopPropagation();
            if (dropdown.classList.contains('show')) closeMenu();
            else openMenu();
        });

        // Close when clicking outside
        document.addEventListener('click', (ev) => {
            if (!menu.contains(ev.target)) closeMenu();
        });

        // Close on Escape
        document.addEventListener('keydown', (ev) => {
            if (ev.key === 'Escape') closeMenu();
        });

        // Close when any dropdown link is clicked (allow normal navigation)
        dropdown.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                closeMenu();
            });
        });
    });
}

// Initialize more menu
setupMoreMenu();

// Show/hide "Join us now!" button based on scroll position
// Only show after scrolling past the about section
function setupJoinButtonVisibility() {
    const joinButtonFixed = document.querySelector('.join-button-fixed');
    const aboutSection = document.querySelector('.about-section');
    
    if (!joinButtonFixed || !aboutSection) return;
    
    // Initially hide the button
    joinButtonFixed.style.opacity = '0';
    joinButtonFixed.style.pointerEvents = 'none';
    joinButtonFixed.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
    
    let ticking = false;
    
    function checkScrollPosition() {
        const scrollY = window.pageYOffset || window.scrollY;
        const aboutSectionBottom = aboutSection.offsetTop + aboutSection.offsetHeight;
        
        if (scrollY >= aboutSectionBottom) {
            // Show the button after scrolling past about section
            joinButtonFixed.style.opacity = '1';
            joinButtonFixed.style.pointerEvents = 'auto';
        } else {
            // Hide the button if not past about section
            joinButtonFixed.style.opacity = '0';
            joinButtonFixed.style.pointerEvents = 'none';
        }
    }
    
    // Check on scroll
    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                checkScrollPosition();
                ticking = false;
            });
            ticking = true;
        }
    }, { passive: true });
    
    // Check on initial load
    checkScrollPosition();
}

// Initialize join button visibility
setupJoinButtonVisibility();

// Console welcome message
console.log('%c ISTE SCTCE Website ', 'background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #fff; font-size: 20px; font-weight: bold; padding: 10px;');
console.log('%c Welcome to ISTE Student Chapter Website! ', 'color: #a8a8ff; font-size: 14px;');

// Typewriter effect for hero title
window.addEventListener('DOMContentLoaded', () => {
    const hero = document.querySelector('.hero-title');
    if (!hero) return;

    const text = hero.getAttribute('data-text') || hero.textContent.trim();
    hero.textContent = '';

    const typedSpan = document.createElement('span');
    typedSpan.className = 'typed';
    hero.appendChild(typedSpan);

    const caret = document.createElement('span');
    caret.className = 'caret';
    hero.appendChild(caret);

    // Typing timing (configurable via data attributes on .hero-title)
    // Example: <h1 class="hero-title" data-text="ISTE" data-start-delay="300" data-type-speed="50"></h1>
    // Make the defaults snappier — still overridable via data attributes
    const defaultStartDelay = 200; // ms after intro ends
    const defaultTypeSpeed = 40; // ms per character
    const startDelay = Number(hero.dataset.startDelay) || defaultStartDelay;
    const typeSpeed = Number(hero.dataset.typeSpeed) || defaultTypeSpeed;

    function runTypewriter() {
        let i = 0;
        function typeNext() {
            if (i <= text.length) {
                typedSpan.textContent = text.slice(0, i);
                i++;
                setTimeout(typeNext, typeSpeed);
            } else {
                // Keep caret blinking for a short time then stop (optional)
                setTimeout(() => { try { caret.style.display = 'none'; } catch (e) {} }, 800);
            }
        }
        typeNext();
    }

    // Start the typewriter once the intro has ended. Intro script will dispatch 'intro:ended'.
    function onIntroEnded() {
        // small delay to let intro settle visually
        setTimeout(runTypewriter, startDelay);
        window.removeEventListener('intro:ended', onIntroEnded);
    }

    window.addEventListener('intro:ended', onIntroEnded);

    // If the intro already ended before we added the listener, start immediately
    if (window._introEnded) onIntroEnded();
});

