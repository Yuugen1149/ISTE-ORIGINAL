// ISTE Society Website - Main JavaScript

// Handles smooth scrolling for anchor links and sets session flags for navigation.
const NavigationHandler = (() => {
    // Sets a session storage item.
    const setSessionFlag = (key, value) => {
        try { 
            sessionStorage.setItem(key, value); 
        } catch (e) { 
            console.warn('SessionStorage is not available.'); 
        }
    };

    // Handles clicks on anchor links for smooth scrolling.
    const handleAnchorClick = (e) => {
        const anchor = e.target.closest('a[href^="#"]');
        if (!anchor) return;
        
        e.preventDefault();
        const target = document.querySelector(anchor.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    // Initializes the navigation handlers.
    const init = () => {
        document.addEventListener('click', handleAnchorClick);
    };

    return { init };
})();

// Initializes the mobile menu functionality.
const MobileMenuHandler = (() => {
    const hamburger = document.querySelector('.hamburger-menu');
    const closeBtn = document.querySelector('.mobile-menu-overlay .close-btn');
    const overlay = document.querySelector('.mobile-menu-overlay');
    const navLinks = document.querySelectorAll('.mobile-nav-menu a');

    // Toggles the mobile menu's visibility.
    const toggleMenu = () => {
        overlay.classList.toggle('open');
        document.body.style.overflow = overlay.classList.contains('open') ? 'hidden' : '';
    };

    // Closes the mobile menu.
    const closeMenu = () => {
        overlay.classList.remove('open');
        document.body.style.overflow = '';
    };

    // Initializes the mobile menu event listeners.
    const init = () => {
        if (hamburger && closeBtn && overlay) {
            hamburger.addEventListener('click', toggleMenu);
            closeBtn.addEventListener('click', closeMenu);
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) closeMenu();
            });
            navLinks.forEach(link => link.addEventListener('click', closeMenu));
        }
    };

    return { init };
})();

// Creates an interactive starfield background.
function createInteractiveStarfield() {
    const container = document.querySelector('.meteors');
    if (!container) return;

    const starCount = window.matchMedia('(max-width: 768px)').matches ? 100 : 300;
    container.innerHTML = '';
    let stars = [];

    for (let i = 0; i < starCount; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        const x = Math.random() * window.innerWidth;
        const y = Math.random() * window.innerHeight;
        star.style.left = `${x}px`;
        star.style.top = `${y}px`;

        // Assign size and animations.
        const sizeRand = Math.random();
        if (sizeRand < 0.5) star.classList.add('tiny');
        else if (sizeRand < 0.8) star.classList.add('small');
        else if (sizeRand < 0.95) star.classList.add('medium');
        else star.classList.add('large');

        if (Math.random() < 0.3) {
            star.classList.add('twinkle');
            star.style.setProperty('--twinkle-duration', `${2 + Math.random() * 3}s`);
        }

        star.style.setProperty('--float-duration', `${8 + Math.random() * 8}s`);
        star.style.setProperty('--float-delay', `${Math.random() * 5}s`);
        star.style.setProperty('--base-opacity', 0.7 + Math.random() * 0.3);

        container.appendChild(star);
    }
}

// Sets up Intersection Observer to reveal elements on scroll.
function observeElements() {
    const elements = document.querySelectorAll('.reveal');
    if (elements.length === 0) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            const delay = entry.target.dataset.revealDelay ? Number(entry.target.dataset.revealDelay) : 0;
            if (entry.isIntersecting) {
                if (delay) entry.target.style.transitionDelay = `${delay}ms`;
                entry.target.classList.add('in-view');
            } else {
                entry.target.classList.remove('in-view');
                setTimeout(() => { entry.target.style.transitionDelay = ''; }, 180);
            }
        });
    }, { threshold: 0.12, rootMargin: '0px 0px -80px 0px' });

    elements.forEach((el, i) => {
        if (!el.dataset.revealDelay) el.dataset.revealDelay = i * 20;
        observer.observe(el);
    });
}

// Controls the header's visibility on scroll.
function setupHeaderScrollHide() {
    const header = document.querySelector('.header');
    if (!header) return;

    let lastScroll = window.pageYOffset || 0;
    const delta = 10;

    window.addEventListener('scroll', () => {
        const current = window.pageYOffset || 0;
        if (current <= 40) {
            header.classList.remove('header-hidden');
        } else if (Math.abs(current - lastScroll) > delta) {
            if (current > lastScroll) header.classList.add('header-hidden');
            else header.classList.remove('header-hidden');
        }
        lastScroll = current;
    }, { passive: true });
}

// Manages the 'More' menu dropdown.
function setupMoreMenu() {
    document.querySelectorAll('.more-menu').forEach(menu => {
        const button = menu.querySelector('.more-button');
        const dropdown = menu.querySelector('.more-dropdown');
        if (!button || !dropdown) return;

        const openMenu = () => {
            dropdown.classList.add('show');
            button.setAttribute('aria-expanded', 'true');
        };
        const closeMenu = () => {
            dropdown.classList.remove('show');
            button.setAttribute('aria-expanded', 'false');
        };

        button.addEventListener('click', (e) => {
            e.stopPropagation();
            dropdown.classList.contains('show') ? closeMenu() : openMenu();
        });

        document.addEventListener('click', (ev) => {
            if (!menu.contains(ev.target)) closeMenu();
        });

        document.addEventListener('keydown', (ev) => {
            if (ev.key === 'Escape') closeMenu();
        });

        dropdown.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
    });
}

// Typewriter effect for the hero title.
function setupTypewriter() {
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

    const typeSpeed = Number(hero.dataset.typeSpeed) || 40;
    let i = 0;

    const typeNext = () => {
        if (i <= text.length) {
            typedSpan.textContent = text.slice(0, i++);
            setTimeout(typeNext, typeSpeed);
        } else {
            setTimeout(() => { if(caret) caret.style.display = 'none'; }, 800);
        }
    };

    setTimeout(typeNext, Number(hero.dataset.startDelay) || 200);
}

// General initialization on DOMContentLoaded.
document.addEventListener('DOMContentLoaded', () => {
    NavigationHandler.init();
    MobileMenuHandler.init();
    createInteractiveStarfield();
    observeElements();
    setupHeaderScrollHide();
    setupMoreMenu();
    setupTypewriter();
    
    console.log('%cISTE SCTCE Website', 'background: linear-gradient(135deg, #667eea, #764ba2); color: #fff; font-size: 1.2rem; font-weight: bold; padding: 5px;');
});

// Re-create starfield on window resize.
window.addEventListener('resize', () => {
    clearTimeout(window.resizeTimeout);
    window.resizeTimeout = setTimeout(createInteractiveStarfield, 500);
});
