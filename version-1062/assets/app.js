(function () {
    function ready(fn) {
        if (document.readyState !== 'loading') {
            fn();
        } else {
            document.addEventListener('DOMContentLoaded', fn);
        }
    }

    function text(value) {
        return String(value || '').toLowerCase();
    }

    function escapeHtml(value) {
        return String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    ready(function () {
        var navButton = document.querySelector('.nav-toggle');
        var nav = document.querySelector('.main-nav');
        if (navButton && nav) {
            navButton.addEventListener('click', function () {
                nav.classList.toggle('open');
            });
        }

        var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
        if (slides.length > 1) {
            var current = 0;
            var show = function (index) {
                current = index;
                slides.forEach(function (slide, i) {
                    slide.classList.toggle('active', i === index);
                });
                dots.forEach(function (dot, i) {
                    dot.classList.toggle('active', i === index);
                });
            };
            dots.forEach(function (dot, i) {
                dot.addEventListener('click', function () {
                    show(i);
                });
            });
            setInterval(function () {
                show((current + 1) % slides.length);
            }, 5600);
        }

        var filterInput = document.querySelector('[data-filter-input]');
        var yearSelect = document.querySelector('[data-filter-year]');
        var typeSelect = document.querySelector('[data-filter-type]');
        var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));
        var applyFilter = function () {
            var q = text(filterInput && filterInput.value);
            var year = yearSelect && yearSelect.value;
            var type = typeSelect && typeSelect.value;
            cards.forEach(function (card) {
                var matchedText = !q || text(card.dataset.title + ' ' + card.dataset.region + ' ' + card.dataset.genre + ' ' + card.dataset.type).indexOf(q) !== -1;
                var matchedYear = !year || card.dataset.year === year;
                var matchedType = !type || card.dataset.type === type;
                card.classList.toggle('hidden-card', !(matchedText && matchedYear && matchedType));
            });
        };
        if (filterInput || yearSelect || typeSelect) {
            [filterInput, yearSelect, typeSelect].forEach(function (el) {
                if (el) {
                    el.addEventListener('input', applyFilter);
                    el.addEventListener('change', applyFilter);
                }
            });
            applyFilter();
        }

        var searchPage = document.querySelector('[data-search-page]');
        if (searchPage && window.SEARCH_INDEX) {
            var searchInput = document.querySelector('[data-search-input]');
            var searchYear = document.querySelector('[data-search-year]');
            var searchType = document.querySelector('[data-search-type]');
            var resultBox = document.querySelector('[data-search-results]');
            var params = new URLSearchParams(window.location.search);
            if (searchInput && params.get('q')) {
                searchInput.value = params.get('q');
            }
            var render = function () {
                var q = text(searchInput && searchInput.value);
                var year = searchYear && searchYear.value;
                var type = searchType && searchType.value;
                var results = window.SEARCH_INDEX.filter(function (item) {
                    var matchedText = !q || text(item.title + ' ' + item.region + ' ' + item.genre + ' ' + item.tags).indexOf(q) !== -1;
                    var matchedYear = !year || item.year === year;
                    var matchedType = !type || item.type === type;
                    return matchedText && matchedYear && matchedType;
                }).slice(0, 240);
                if (!results.length) {
                    resultBox.innerHTML = '<div class="empty-state">没有找到匹配内容，换一个关键词试试。</div>';
                    return;
                }
                resultBox.innerHTML = results.map(function (item) {
                    return '<a class="movie-card" href="./' + escapeHtml(item.file) + '">' +
                        '<div class="poster"><img src="' + escapeHtml(item.image) + '" alt="' + escapeHtml(item.title) + '" loading="lazy"><div class="poster-glow"></div></div>' +
                        '<div class="card-info"><div class="card-line"><span>' + escapeHtml(item.year) + '</span><span>' + escapeHtml(item.region) + '</span></div>' +
                        '<h3>' + escapeHtml(item.title) + '</h3><p>' + escapeHtml(item.oneLine) + '</p><div class="tag-row"><span>' + escapeHtml(item.type) + '</span><span>' + escapeHtml(item.genre.split(/[\/，,]/)[0]) + '</span></div></div></a>';
                }).join('');
            };
            [searchInput, searchYear, searchType].forEach(function (el) {
                if (el) {
                    el.addEventListener('input', render);
                    el.addEventListener('change', render);
                }
            });
            render();
        }

        var player = document.querySelector('[data-stream]');
        if (player) {
            var video = player.querySelector('video');
            var overlay = player.querySelector('.play-overlay');
            var streamUrl = player.getAttribute('data-stream');
            var started = false;
            var startVideo = function () {
                if (!video || !streamUrl) {
                    return;
                }
                if (!started) {
                    if (video.canPlayType('application/vnd.apple.mpegurl')) {
                        video.src = streamUrl;
                    } else if (window.Hls && window.Hls.isSupported()) {
                        var hls = new window.Hls({ enableWorker: true });
                        hls.loadSource(streamUrl);
                        hls.attachMedia(video);
                    } else {
                        video.src = streamUrl;
                    }
                    started = true;
                }
                if (overlay) {
                    overlay.classList.add('is-hidden');
                }
                video.controls = true;
                var attempt = video.play();
                if (attempt && typeof attempt.catch === 'function') {
                    attempt.catch(function () {
                        video.controls = true;
                    });
                }
            };
            if (overlay) {
                overlay.addEventListener('click', startVideo);
            }
            if (video) {
                video.addEventListener('click', function () {
                    if (!started) {
                        startVideo();
                    }
                });
            }
        }
    });
})();
