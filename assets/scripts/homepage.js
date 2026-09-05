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

    const createPartnerSlide = ({ src, name, width, height }) => {
        const item = document.createElement('li');
        const content = document.createElement('div');
        const image = document.createElement('img');
        const link = document.createElement('a');
        const icon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        const use = document.createElementNS('http://www.w3.org/2000/svg', 'use');

        item.className = 'swiper-slide group';
        content.className =
            'flex min-h-[148px] flex-col items-center justify-center gap-4 px-1 text-center sm:min-h-[160px]';

        image.className = 'h-16 w-full max-w-[150px] object-contain sm:h-18';
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

    const createPartnerControls = (carousel) => {
        const controls = document.createElement('div');
        const previousButton = document.createElement('button');
        const nextButton = document.createElement('button');
        const createArrow = (isPrevious = false) => {
            const arrow = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            const arrowUse = document.createElementNS('http://www.w3.org/2000/svg', 'use');

            arrow.setAttribute('class', `size-3.5${isPrevious ? ' rotate-180' : ''}`);
            arrow.setAttribute('aria-hidden', 'true');
            arrowUse.setAttribute('href', 'assets/images/sprite.svg#arrow-right');
            arrow.append(arrowUse);
            return arrow;
        };

        controls.className = 'mt-4 flex justify-end gap-2';

        previousButton.type = 'button';
        previousButton.className =
            'inline-flex size-10 items-center justify-center rounded-full bg-c-orange/10 text-c-orange transition-colors hover:bg-c-teal/15 hover:text-c-teal disabled:pointer-events-none disabled:opacity-30';
        previousButton.setAttribute('aria-label', 'Previous partner');
        previousButton.append(createArrow(true));

        nextButton.type = 'button';
        nextButton.className =
            'inline-flex size-10 items-center justify-center rounded-full bg-c-orange/10 text-c-orange transition-colors hover:bg-c-teal/15 hover:text-c-teal disabled:pointer-events-none disabled:opacity-30';
        nextButton.setAttribute('aria-label', 'Next partner');
        nextButton.append(createArrow());

        controls.append(previousButton, nextButton);
        carousel.append(controls);

        return { previousButton, nextButton };
    };

    const initPartnersCarousel = (carousel) => {
        if (carousel.dataset.uiReady === 'true' || typeof window.Swiper !== 'function') return;

        const viewport = carousel.querySelector('[data-partners-viewport]');
        const track = carousel.querySelector('[data-partners-track]');
        if (!viewport || !track) return;

        const fragment = document.createDocumentFragment();
        partners.forEach((partner) => fragment.append(createPartnerSlide(partner)));
        track.replaceChildren(fragment);

        const controls = createPartnerControls(carousel);
        const autoplayDelay = Number(carousel.dataset.carouselInterval) || 3000;
        const swiper = new window.Swiper(viewport, {
            slidesPerView: 2,
            spaceBetween: 12,
            loop: true,
            speed: 650,
            grabCursor: false,
            watchOverflow: true,
            autoplay: motionPreference.matches
                ? false
                : {
                      delay: autoplayDelay,
                      disableOnInteraction: false,
                      pauseOnMouseEnter: true,
                  },
            navigation: {
                prevEl: controls.previousButton,
                nextEl: controls.nextButton,
            },
            keyboard: {
                enabled: true,
                onlyInViewport: true,
            },
            a11y: {
                enabled: true,
            },
            breakpoints: {
                640: {
                    slidesPerView: 3,
                    spaceBetween: 16,
                },
            },
        });

        carousel.swiper = swiper;
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
        root.querySelectorAll('[data-partners-carousel]').forEach(initPartnersCarousel);
    };

    window.HomepageUI = { init, initRotator, initPartnersCarousel };
    init();
})();
