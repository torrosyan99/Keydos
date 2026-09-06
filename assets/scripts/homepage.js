(() => {
    'use strict';

    const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const partners = [
        { src: 'assets/images/clients/ingresos.png', name: 'Ingresos', width: 183, height: 52 },
        { src: 'assets/images/clients/flycorpo.png', name: 'Flycorpo', width: 193, height: 75 },
        {
            src: 'assets/images/clients/black-koffee.png',
            name: 'Black Koffee',
            width: 605,
            height: 209,
        },
        {
            src: 'assets/images/clients/got-leads-365.jpg',
            name: 'Got Leads 365',
            width: 300,
            height: 200,
        },
        {
            src: 'assets/images/clients/347041762586222.png',
            name: 'Neurocruit',
            width: 300,
            height: 200,
        },
        {
            src: 'assets/images/clients/351791620208194.png',
            name: 'Blue Fence Systems',
            width: 300,
            height: 200,
        },
        {
            src: 'assets/images/clients/648341620208279.png',
            name: 'Felora',
            width: 300,
            height: 200,
        },
        {
            src: 'assets/images/clients/903061762586430.png',
            name: 'The Pure Hearts',
            width: 300,
            height: 200,
        },
    ];

    const createPartnerItem = ({ src, name, width, height }) => {
        const item = document.createElement('li');
        const content = document.createElement('div');
        const image = document.createElement('img');
        const link = document.createElement('a');
        const icon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        const use = document.createElementNS('http://www.w3.org/2000/svg', 'use');

        item.className =
            'group flex w-[160px] shrink-0 justify-center md:w-[190px] min-[992px]:w-[210px]';
        item.dataset.partnerItem = '';
        content.className =
            'flex min-h-[145px] flex-col items-center justify-center gap-5 px-1 text-center md:min-h-[170px] lg:min-h-[190px]';

        image.className = 'h-[86px] w-[130px] max-w-none object-contain md:h-[100px] md:w-[150px]';
        image.src = src;
        image.alt = name;
        image.width = width;
        image.height = height;
        image.loading = 'lazy';
        image.decoding = 'async';

        link.className =
            'inline-flex items-center gap-1.5 self-center text-[9px] font-semibold uppercase tracking-[0.08em] text-c-orange transition-colors hover:text-c-teal lg:translate-y-1 lg:opacity-0 lg:transition-[color,opacity,translate] lg:duration-200 lg:group-hover:translate-y-0 lg:group-hover:opacity-100 lg:group-focus-within:translate-y-0 lg:group-focus-within:opacity-100';
        link.href = '#';
        link.setAttribute('aria-label', `Read case study: ${name}`);
        link.append('READ CASE STUDY');
        icon.setAttribute('class', 'size-3 shrink-0');
        icon.setAttribute('aria-hidden', 'true');
        use.setAttribute('href', 'assets/images/sprite.svg#arrow-right');
        icon.append(use);
        link.append(icon);

        content.append(image, link);
        item.append(content);
        return item;
    };

    const waitForImages = (images) =>
        Promise.all(
            images.map(
                (image) =>
                    new Promise((resolve) => {
                        if (image.complete) {
                            resolve();
                            return;
                        }

                        image.addEventListener('load', resolve, { once: true });
                        image.addEventListener('error', resolve, { once: true });
                    }),
            ),
        );

    const initPartnersMarquee = async (carousel) => {
        if (carousel.dataset.uiReady || typeof window.marquee6k !== 'function') return;

        const marquee = carousel.querySelector('[data-partners-marquee]');
        const track = carousel.querySelector('[data-partners-track]');
        if (!marquee || !track) return;

        carousel.dataset.uiReady = 'loading';

        const fragment = document.createDocumentFragment();
        partners.forEach((partner) => fragment.append(createPartnerItem(partner)));
        track.replaceChildren(fragment);

        await Promise.all([
            waitForImages([...track.querySelectorAll('img')]),
            document.fonts?.ready || Promise.resolve(),
        ]);

        if (motionPreference.matches) {
            carousel.dataset.uiReady = 'true';
            return;
        }

        window.marquee6k.init({ selector: 'partners-marquee' });

        const pixelsPerSecond = Number(carousel.dataset.carouselSpeed) || 100;
        const instanceIndex = window.MARQUEES?.findIndex(
            (instance) => instance.element === marquee,
        );
        if (instanceIndex < 0) return;

        const instance = window.MARQUEES[instanceIndex];
        const mobileMarquee = window.matchMedia('(max-width: 767px)');
        let previousFrame = performance.now();
        instance.animate = () => {
            const currentFrame = performance.now();
            const elapsed = Math.min(currentFrame - previousFrame, 32);
            previousFrame = currentFrame;
            if (instance.paused || !instance.contentWidth) return;

            const distance = pixelsPerSecond * (elapsed / 1000);
            instance.offset += instance.reverse ? distance : -distance;

            if (instance.reverse && instance.offset >= 0) {
                instance.offset -= instance.contentWidth;
            } else if (!instance.reverse && instance.offset <= -instance.contentWidth) {
                instance.offset += instance.contentWidth;
            }

            instance.wrapper.style.transform = `translate3d(${instance.offset}px, 0, 0)`;
        };

        const syncMotionMode = () => {
            previousFrame = performance.now();
            instance.paused = mobileMarquee.matches;
        };

        marquee.addEventListener('pointerover', (event) => {
            if (event.target.closest('[data-partner-item]')) instance.paused = true;
        });
        marquee.addEventListener('pointerout', (event) => {
            const currentItem = event.target.closest('[data-partner-item]');
            if (!currentItem) return;

            const nextItem =
                event.relatedTarget instanceof Element
                    ? event.relatedTarget.closest('[data-partner-item]')
                    : null;
            if (currentItem === nextItem) return;
            instance.paused = mobileMarquee.matches || Boolean(nextItem);
        });
        marquee.addEventListener('focusin', (event) => {
            if (event.target.closest('[data-partner-item]')) instance.paused = true;
        });
        marquee.addEventListener('focusout', () => {
            window.requestAnimationFrame(() => {
                if (!marquee.contains(document.activeElement)) {
                    instance.paused = mobileMarquee.matches;
                }
            });
        });

        mobileMarquee.addEventListener('change', syncMotionMode);
        syncMotionMode();

        const syncDimensions = () => {
            window.marquee6k.refresh(instanceIndex);
        };

        syncDimensions();
        if ('ResizeObserver' in window) {
            let resizeFrame;
            new ResizeObserver(() => {
                window.cancelAnimationFrame(resizeFrame);
                resizeFrame = window.requestAnimationFrame(syncDimensions);
            }).observe(carousel);
        }

        carousel.dataset.uiReady = 'true';
    };
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

    const init = (root = document) => {
        root.querySelectorAll('[data-text-rotator]').forEach(initRotator);
        root.querySelectorAll('[data-partners-carousel]').forEach(initPartnersMarquee);
    };

    window.HomepageUI = { init, initRotator, initPartnersMarquee };
    init();
})();
