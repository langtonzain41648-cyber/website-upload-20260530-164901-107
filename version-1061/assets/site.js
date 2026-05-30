(function () {
    var toggle = document.querySelector('[data-menu-toggle]');
    var menu = document.querySelector('[data-mobile-menu]');

    if (toggle && menu) {
        toggle.addEventListener('click', function () {
            menu.classList.toggle('is-open');
        });
    }

    var hero = document.querySelector('[data-hero-carousel]');

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var current = 0;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }

            current = (index + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                showSlide(index);
            });
        });

        showSlide(0);

        if (slides.length > 1) {
            setInterval(function () {
                showSlide(current + 1);
            }, 5200);
        }
    }

    var filterRoot = document.querySelector('[data-search-page]');

    if (filterRoot) {
        var input = filterRoot.querySelector('[data-search-input]');
        var cards = Array.prototype.slice.call(filterRoot.querySelectorAll('[data-card]'));
        var count = filterRoot.querySelector('[data-search-count]');
        var buttons = Array.prototype.slice.call(filterRoot.querySelectorAll('[data-filter]'));
        var params = new URLSearchParams(window.location.search);
        var filterValue = 'all';

        if (input) {
            input.value = params.get('q') || '';
        }

        function updateCards() {
            var query = input ? input.value.trim().toLowerCase() : '';
            var visible = 0;

            cards.forEach(function (card) {
                var haystack = card.getAttribute('data-search') || '';
                var type = card.getAttribute('data-type') || '';
                var region = card.getAttribute('data-region') || '';
                var genre = card.getAttribute('data-genre') || '';
                var matchesQuery = !query || haystack.indexOf(query) !== -1;
                var matchesFilter = filterValue === 'all' || type === filterValue || region === filterValue || genre === filterValue;
                var shouldShow = matchesQuery && matchesFilter;

                card.hidden = !shouldShow;

                if (shouldShow) {
                    visible += 1;
                }
            });

            if (count) {
                count.textContent = visible + ' 部影片';
            }
        }

        buttons.forEach(function (button) {
            button.addEventListener('click', function () {
                filterValue = button.getAttribute('data-filter') || 'all';

                buttons.forEach(function (item) {
                    item.classList.toggle('is-active', item === button);
                });

                updateCards();
            });
        });

        if (input) {
            input.addEventListener('input', updateCards);
        }

        updateCards();
    }

    var video = document.querySelector('[data-player-video]');

    if (video) {
        var source = video.getAttribute('data-src');
        var cover = document.querySelector('[data-player-cover]');
        var button = document.querySelector('[data-player-button]');
        var hasBound = false;

        function bindSource() {
            if (hasBound || !source) {
                return;
            }

            hasBound = true;

            if (window.Hls && window.Hls.isSupported()) {
                var hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });

                hls.loadSource(source);
                hls.attachMedia(video);
            } else {
                video.src = source;
            }
        }

        function playVideo() {
            bindSource();
            var result = video.play();

            if (result && typeof result.catch === 'function') {
                result.catch(function () {});
            }
        }

        if (cover) {
            cover.addEventListener('click', playVideo);
        }

        if (button) {
            button.addEventListener('click', function (event) {
                event.stopPropagation();
                playVideo();
            });
        }

        video.addEventListener('click', function () {
            if (video.paused) {
                playVideo();
            }
        });

        video.addEventListener('play', function () {
            if (cover) {
                cover.classList.add('is-hidden');
            }
        });
    }
}());
