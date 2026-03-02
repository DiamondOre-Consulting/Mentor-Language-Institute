/**
 * scrollReveal.js
 * Automatically animates elements that have [data-sr] attribute when they
 * enter the viewport. Call initScrollReveal() once on app mount.
 *
 * Usage in JSX:
 *   <div data-sr="fade-up">...</div>
 *   <div data-sr="fade-left" data-sr-delay="100">...</div>
 *
 * Animation values: fade-up | fade-down | fade-left | fade-right | zoom | flip
 */

const ANIMATION_MAP = {
    'fade-up': 'sr-fade-up',
    'fade-down': 'sr-fade-down',
    'fade-left': 'sr-fade-left',
    'fade-right': 'sr-fade-right',
    'zoom': 'sr-zoom',
    'flip': 'sr-flip',
};

export function initScrollReveal() {
    if (typeof window === 'undefined') return;

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    const el = entry.target;
                    const type = el.dataset.sr || 'fade-up';
                    const delay = el.dataset.srDelay || '0';
                    const cls = ANIMATION_MAP[type] || 'sr-fade-up';

                    el.style.animationDelay = `${delay}ms`;
                    el.classList.add('sr-visible', cls);
                    observer.unobserve(el);
                }
            });
        },
        { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );

    const observe = () => {
        document.querySelectorAll('[data-sr]').forEach((el) => {
            if (!el.classList.contains('sr-visible')) {
                el.classList.add('sr-hidden');
                observer.observe(el);
            }
        });
    };

    // Run once on init
    observe();

    // Re-observe after route changes (soft navigation)
    const mutationObs = new MutationObserver(() => observe());
    mutationObs.observe(document.body, { childList: true, subtree: true });

    return () => {
        observer.disconnect();
        mutationObs.disconnect();
    };
}
