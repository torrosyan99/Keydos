(() => {
    'use strict';

    const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');

    const initRotator = (rotator) => {
        if (rotator.dataset.uiReady === 'true') return;

        const items = [...rotator.querySelectorAll('[data-rotator-item]')];
        if (items.length < 2) return;

        const scope = rotator.closest('[data-rotator-scope]') || rotator.parentElement;
        const previousButton = scope?.querySelector('[data-rotator-previous]');
        const nextButton = scope?.querySelector('[data-rotator-next]');
        const currentLabel = scope?.querySelector('[data-rotator-current]');
        const totalLabel = scope?.querySelector('[data-rotator-total]');
        const interval = Number(rotator.dataset.rotatorInterval) || 3200;
        let activeIndex = Math.max(
            0,
            items.findIndex((item) => item.classList.contains('is-current')),
        );
        let timer;
        let animations = [];
        let paused = false;

        const formatIndex = (index) => String(index + 1).padStart(2, '0');

        const render = () => {
            items.forEach((item, index) => {
                const isCurrent = index === activeIndex;
                item.classList.toggle('is-current', isCurrent);
                item.setAttribute('aria-hidden', String(!isCurrent));
            });
            if (currentLabel) currentLabel.textContent = formatIndex(activeIndex);
            if (totalLabel) totalLabel.textContent = formatIndex(items.length - 1);
        };

        const stopAnimations = () => {
            animations.forEach((animation) => animation.cancel());
            animations = [];
        };

        const schedule = () => {
            window.clearTimeout(timer);
            if (paused || motionPreference.matches || document.hidden) return;
            timer = window.setTimeout(() => change(activeIndex + 1), interval);
        };

        const change = (nextIndex, direction = 1) => {
            window.clearTimeout(timer);
            stopAnimations();

            const outgoing = items[activeIndex];
            activeIndex = (nextIndex + items.length) % items.length;
            const incoming = items[activeIndex];

            if (motionPreference.matches) {
                render();
                schedule();
                return;
            }

            const timing = {
                duration: 560,
                easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
                fill: 'both',
            };
            animations = [
                outgoing.animate(
                    [
                        { transform: 'translateY(0)', opacity: 1 },
                        { transform: `translateY(${-90 * direction}%)`, opacity: 0 },
                    ],
                    timing,
                ),
                incoming.animate(
                    [
                        { transform: `translateY(${90 * direction}%)`, opacity: 0 },
                        { transform: 'translateY(0)', opacity: 1 },
                    ],
                    timing,
                ),
            ];
            render();
            animations[1].onfinish = schedule;
        };

        previousButton?.addEventListener('click', () => change(activeIndex - 1, -1));
        nextButton?.addEventListener('click', () => change(activeIndex + 1, 1));
        scope?.addEventListener('mouseenter', () => {
            paused = true;
            window.clearTimeout(timer);
        });
        scope?.addEventListener('mouseleave', () => {
            paused = false;
            schedule();
        });
        scope?.addEventListener('focusin', () => {
            paused = true;
            window.clearTimeout(timer);
        });
        scope?.addEventListener('focusout', (event) => {
            if (scope.contains(event.relatedTarget)) return;
            paused = false;
            schedule();
        });

        const syncRotator = () => {
            stopAnimations();
            render();
            schedule();
        };

        motionPreference.addEventListener('change', syncRotator);
        document.addEventListener('visibilitychange', syncRotator);
        rotator.dataset.uiReady = 'true';
        render();
        schedule();
    };

    const initCarousel = (carousel) => {
        if (carousel.dataset.uiReady === 'true') return;

        const viewport = carousel.querySelector('[data-carousel-viewport]');
        const track = carousel.querySelector('[data-carousel-track]');
        const list = carousel.querySelector('[data-carousel-list]');
        const toggle = carousel.querySelector('[data-carousel-toggle]');
        if (!viewport || !track || !list) return;

        const duplicate = list.cloneNode(true);
        duplicate.removeAttribute('data-carousel-list');
        duplicate.removeAttribute('aria-label');
        duplicate.setAttribute('aria-hidden', 'true');
        duplicate.classList.add('clients-list--duplicate');
        duplicate
            .querySelectorAll('a, button')
            .forEach((item) => item.setAttribute('tabindex', '-1'));
        track.append(duplicate);

        const speed = Number(carousel.dataset.carouselSpeed) || 34;
        let manual = false;
        let pausedByUser = false;

        const updateToggle = () => {
            if (!toggle) return;
            toggle.dataset.paused = String(pausedByUser);
            toggle.setAttribute('aria-pressed', String(pausedByUser));
            toggle.setAttribute(
                'aria-label',
                pausedByUser ? 'Resume client carousel' : 'Pause client carousel',
            );
        };

        const syncCarousel = () => {
            const animated = !motionPreference.matches && !manual;
            viewport.classList.toggle('is-animated', animated);
            viewport.classList.toggle('is-paused', document.hidden || pausedByUser);
            updateToggle();
        };

        const sizeAnimation = () => {
            const listWidth = list.getBoundingClientRect().width;
            if (listWidth) track.style.setProperty('--carousel-duration', `${listWidth / speed}s`);
        };

        toggle?.addEventListener('click', () => {
            pausedByUser = !pausedByUser;
            syncCarousel();
        });

        viewport.addEventListener('focusin', (event) => {
            const focusable = event.target.closest('a, button');
            if (!focusable || !list.contains(focusable) || !focusable.matches(':focus-visible'))
                return;
            manual = true;
            syncCarousel();
            const itemBox = focusable.getBoundingClientRect();
            const viewportBox = viewport.getBoundingClientRect();
            viewport.scrollLeft +=
                itemBox.left - viewportBox.left - (viewport.clientWidth - itemBox.width) / 2;
        });

        viewport.addEventListener(
            'pointerdown',
            (event) => {
                if (event.pointerType !== 'touch' || !viewport.classList.contains('is-animated'))
                    return;
                const offset = -new DOMMatrixReadOnly(getComputedStyle(track).transform).m41;
                manual = true;
                syncCarousel();
                viewport.scrollLeft = offset;
            },
            { passive: true },
        );

        if ('ResizeObserver' in window) new ResizeObserver(sizeAnimation).observe(list);
        else window.addEventListener('resize', sizeAnimation);

        motionPreference.addEventListener('change', syncCarousel);
        document.addEventListener('visibilitychange', syncCarousel);
        carousel.dataset.uiReady = 'true';
        sizeAnimation();
        syncCarousel();
    };

    const init = (root = document) => {
        root.querySelectorAll('[data-text-rotator]').forEach(initRotator);
        root.querySelectorAll('[data-carousel]').forEach(initCarousel);
    };

    window.HomepageUI = { init, initRotator, initCarousel };
    init();
})();
