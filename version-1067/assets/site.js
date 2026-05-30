(function () {
    function ready(fn) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", fn);
        } else {
            fn();
        }
    }

    function norm(value) {
        return (value || "").toString().trim().toLowerCase();
    }

    ready(function () {
        var toggle = document.querySelector("[data-menu-toggle]");
        var nav = document.querySelector("[data-site-nav]");
        if (toggle && nav) {
            toggle.addEventListener("click", function () {
                nav.classList.toggle("is-open");
            });
        }

        document.querySelectorAll("[data-hero-carousel]").forEach(function (carousel) {
            var slides = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-slide]"));
            var dots = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-dot]"));
            var current = 0;
            var timer = null;
            function show(index) {
                if (!slides.length) return;
                current = (index + slides.length) % slides.length;
                slides.forEach(function (slide, i) {
                    slide.classList.toggle("is-active", i === current);
                });
                dots.forEach(function (dot, i) {
                    dot.classList.toggle("is-active", i === current);
                });
            }
            function start() {
                if (timer) window.clearInterval(timer);
                timer = window.setInterval(function () {
                    show(current + 1);
                }, 5200);
            }
            dots.forEach(function (dot) {
                dot.addEventListener("click", function () {
                    show(parseInt(dot.getAttribute("data-hero-dot"), 10) || 0);
                    start();
                });
            });
            show(0);
            start();
        });

        document.querySelectorAll("[data-hero-search-form]").forEach(function (form) {
            form.addEventListener("submit", function (event) {
                event.preventDefault();
                var input = form.querySelector("input[name='q']");
                var q = input ? input.value.trim() : "";
                var target = "./search.html" + (q ? "?q=" + encodeURIComponent(q) : "");
                window.location.href = target;
            });
        });

        document.querySelectorAll("[data-filter-scope]").forEach(function (scope) {
            var search = scope.querySelector("[data-filter-search]");
            var region = scope.querySelector("[data-filter-region]");
            var year = scope.querySelector("[data-filter-year]");
            var category = scope.querySelector("[data-filter-category]");
            var grid = scope.querySelector("[data-card-grid]") || scope.parentElement.querySelector("[data-card-grid]");
            var empty = scope.querySelector("[data-empty-state]");
            var cards = grid ? Array.prototype.slice.call(grid.querySelectorAll("[data-card]")) : [];
            var params = new URLSearchParams(window.location.search);
            var q = params.get("q");
            if (q && search) {
                search.value = q;
            }
            function apply() {
                var s = norm(search && search.value);
                var r = norm(region && region.value);
                var y = norm(year && year.value);
                var c = norm(category && category.value);
                var shown = 0;
                cards.forEach(function (card) {
                    var text = norm([
                        card.getAttribute("data-title"),
                        card.getAttribute("data-region"),
                        card.getAttribute("data-year"),
                        card.getAttribute("data-category"),
                        card.getAttribute("data-tags")
                    ].join(" "));
                    var ok = true;
                    if (s && text.indexOf(s) === -1) ok = false;
                    if (r && norm(card.getAttribute("data-region")).indexOf(r) === -1) ok = false;
                    if (y && norm(card.getAttribute("data-year")).indexOf(y) === -1) ok = false;
                    if (c && norm(card.getAttribute("data-category")) !== c) ok = false;
                    card.classList.toggle("is-hidden", !ok);
                    if (ok) shown += 1;
                });
                if (empty) {
                    empty.classList.toggle("is-visible", shown === 0);
                }
            }
            [search, region, year, category].forEach(function (input) {
                if (input) input.addEventListener("input", apply);
                if (input && input.tagName === "SELECT") input.addEventListener("change", apply);
            });
            apply();
        });

        document.querySelectorAll("[data-player]").forEach(function (player) {
            var video = player.querySelector("video");
            var button = player.querySelector("[data-play-button]");
            if (!video || !button) return;
            var stream = video.getAttribute("data-stream");
            var loaded = false;
            function load() {
                if (loaded || !stream) return;
                loaded = true;
                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = stream;
                } else if (window.Hls && window.Hls.isSupported()) {
                    var hls = new window.Hls({
                        maxBufferLength: 60,
                        enableWorker: true
                    });
                    hls.loadSource(stream);
                    hls.attachMedia(video);
                } else {
                    video.src = stream;
                }
            }
            function play() {
                load();
                video.controls = true;
                button.classList.add("is-hidden");
                var result = video.play();
                if (result && result.catch) {
                    result.catch(function () {
                        button.classList.remove("is-hidden");
                    });
                }
            }
            button.addEventListener("click", play);
            video.addEventListener("click", function () {
                if (video.paused) {
                    play();
                } else {
                    video.pause();
                }
            });
            video.addEventListener("play", function () {
                button.classList.add("is-hidden");
            });
            video.addEventListener("pause", function () {
                if (!video.ended) button.classList.remove("is-hidden");
            });
        });
    });
})();
