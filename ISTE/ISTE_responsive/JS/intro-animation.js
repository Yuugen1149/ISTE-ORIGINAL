// Optimized intro animation with better performance
const IntroAnimation = (() => {
    const DURATION = 5000;
    const LOGO_SRC = '../IMAGES/istelogofinal-removebg-preview.png';
    
    const createIntroElement = () => {
        const wrapper = document.createElement('div');
        wrapper.className = 'intro-animation';
        const container = document.createElement('div');
        container.className = 'intro-logo-container';
        const img = document.createElement('img');
        img.src = LOGO_SRC;
        img.alt = 'ISTE Logo';
        img.className = 'intro-logo';
        img.loading = 'eager'; // Prioritize loading
        container.appendChild(img);
        wrapper.appendChild(container);
        return wrapper;
    };

    const showIntro = (duration = DURATION) => {
        // Remove existing intro if present
        const existing = document.querySelector('.intro-animation');
        if (existing) existing.remove();

        const el = createIntroElement();
        const prevOverflow = document.body.style.overflow;
        
        // Use requestAnimationFrame for smoother rendering
        requestAnimationFrame(() => {
            document.body.appendChild(el);
            document.body.style.overflow = 'hidden';
        });

        // Cleanup after duration
        setTimeout(() => {
            requestAnimationFrame(() => {
                const intro = document.querySelector('.intro-animation');
                if (intro) intro.remove();
                document.body.style.overflow = prevOverflow || '';
                window._introEnded = true;
                window.dispatchEvent(new Event('intro:ended'));
            });
        }, duration);
    };

    return { showIntro };
})();

function showIntro(duration) {
    IntroAnimation.showIntro(duration);
}

// Expose globally so other scripts can call it (e.g., when clicking Home)
window.showIntro = showIntro;

// Play on first load
document.addEventListener('DOMContentLoaded', () => {
    // Check if user is returning from a forum or execom page
    let fromForum = false;
    try { fromForum = sessionStorage.getItem('iste_from_forum') === '1'; } catch (e) { fromForum = false; }
    
    // Only auto-play intro on a plain initial load (no hash target) OR when returning from forum/execom
    // If the URL includes a hash (e.g. index.html#events or #contact), skip the intro (unless from forum)
    let skip = false;
    try { skip = sessionStorage.getItem('iste_skip_intro') === '1'; } catch (e) { skip = false; }
    
    // Play intro if: no hash OR returning from forum/execom
    if ((!window.location.hash && !skip) || fromForum) {
        showIntro(5000);
    }
    
    // clear the flags so they only affect the immediate next load/navigation
    try { sessionStorage.removeItem('iste_skip_intro'); } catch (e) {}
    try { sessionStorage.removeItem('iste_from_forum'); } catch (e) {}
    
    // If we skipped the intro, immediately notify listeners so dependent animations can start
    if ((skip || window.location.hash) && !fromForum) {
        try { window._introEnded = true; } catch (e) {}
        try { window.dispatchEvent(new Event('intro:ended')); } catch (e) {}
    }
});