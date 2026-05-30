(function () {
  'use strict';

  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function initMobileNav() {
    var toggle = qs('[data-mobile-toggle]');
    var nav = qs('[data-mobile-nav]');

    if (!toggle || !nav) {
      return;
    }

    toggle.addEventListener('click', function () {
      nav.classList.toggle('open');
    });
  }

  function initHero() {
    var hero = qs('[data-hero]');

    if (!hero) {
      return;
    }

    var slides = qsa('[data-hero-slide]', hero);
    var dots = qsa('[data-hero-dot]', hero);
    var next = qs('[data-hero-next]', hero);
    var prev = qs('[data-hero-prev]', hero);
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === index);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === index);
      });
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        start();
      });
    });

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        start();
      });
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        start();
      });
    }

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function initCardFilters() {
    var search = qs('[data-card-search]');
    var grids = qsa('[data-filter-grid]');

    if (!search || !grids.length) {
      return;
    }

    var typeFilter = qs('[data-card-filter="type"]');
    var yearFilter = qs('[data-card-filter="year"]');
    var count = qs('[data-filter-count]');

    function apply() {
      var query = normalize(search.value);
      var type = normalize(typeFilter && typeFilter.value);
      var year = normalize(yearFilter && yearFilter.value);
      var visible = 0;

      grids.forEach(function (grid) {
        qsa('[data-movie-card]', grid).forEach(function (card) {
          var haystack = normalize([
            card.getAttribute('data-title'),
            card.getAttribute('data-tags'),
            card.getAttribute('data-region'),
            card.getAttribute('data-type'),
            card.getAttribute('data-year')
          ].join(' '));
          var matchesQuery = !query || haystack.indexOf(query) !== -1;
          var matchesType = !type || haystack.indexOf(type) !== -1;
          var matchesYear = !year || haystack.indexOf(year) !== -1;
          var isVisible = matchesQuery && matchesType && matchesYear;

          card.classList.toggle('hidden-by-filter', !isVisible);

          if (isVisible) {
            visible += 1;
          }
        });
      });

      if (count) {
        count.textContent = '当前显示 ' + visible + ' 部';
      }
    }

    search.addEventListener('input', apply);

    if (typeFilter) {
      typeFilter.addEventListener('change', apply);
    }

    if (yearFilter) {
      yearFilter.addEventListener('change', apply);
    }

    apply();
  }

  function initGlobalSearch() {
    var input = qs('#global-search-input');
    var button = qs('#global-search-button');
    var typeFilter = qs('#global-type-filter');
    var categoryFilter = qs('#global-category-filter');
    var results = qs('#global-search-results');
    var count = qs('#global-result-count');

    if (!input || !results || !window.MOVIE_SEARCH_DATA) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q') || '';

    if (initialQuery) {
      input.value = initialQuery;
    }

    function card(movie) {
      return [
        '<article class="movie-card" data-movie-card>',
        '  <a class="poster-wrap" href="' + movie.url + '" aria-label="观看 ' + movie.title + '">',
        '    <span class="poster-gradient"></span>',
        '    <img src="' + movie.cover + '" alt="' + movie.title + '" loading="lazy">',
        '    <span class="score-badge">' + movie.score + '</span>',
        '    <span class="duration-badge">' + movie.duration + '</span>',
        '    <span class="poster-play">▶</span>',
        '  </a>',
        '  <div class="movie-card-body">',
        '    <div class="card-meta"><span>' + movie.year + '</span><span>' + movie.type + '</span><span>' + movie.region + '</span></div>',
        '    <h3><a href="' + movie.url + '">' + movie.title + '</a></h3>',
        '    <p>' + movie.oneLine + '</p>',
        '    <div class="tag-row"><span>' + movie.category + '</span><span>' + movie.genre + '</span></div>',
        '  </div>',
        '</article>'
      ].join('');
    }

    function apply() {
      var query = normalize(input.value);
      var type = normalize(typeFilter && typeFilter.value);
      var category = normalize(categoryFilter && categoryFilter.value);
      var items = window.MOVIE_SEARCH_DATA.filter(function (movie) {
        var haystack = normalize([
          movie.title,
          movie.region,
          movie.type,
          movie.year,
          movie.genre,
          movie.category,
          movie.tags,
          movie.oneLine
        ].join(' '));
        var matchesQuery = !query || haystack.indexOf(query) !== -1;
        var matchesType = !type || haystack.indexOf(type) !== -1;
        var matchesCategory = !category || normalize(movie.category) === category;
        return matchesQuery && matchesType && matchesCategory;
      }).slice(0, 120);

      results.innerHTML = items.map(card).join('');

      if (count) {
        count.textContent = '显示 ' + items.length + ' 条结果（最多展示 120 条，可继续输入关键词缩小范围）';
      }

      initImageFallbacks(results);
    }

    input.addEventListener('input', apply);

    if (button) {
      button.addEventListener('click', apply);
    }

    if (typeFilter) {
      typeFilter.addEventListener('change', apply);
    }

    if (categoryFilter) {
      categoryFilter.addEventListener('change', apply);
    }

    apply();
  }

  function initPlayer() {
    var video = qs('#movie-player');
    var button = qs('[data-player-start]');

    if (!video) {
      return;
    }

    var source = video.getAttribute('data-src');
    var started = false;

    function startPlayer() {
      if (started) {
        video.play();
        return;
      }

      started = true;

      if (button) {
        button.classList.add('hidden');
      }

      if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });

        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          video.play().catch(function () {});
        });
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            console.warn('HLS playback error:', data);
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        video.addEventListener('loadedmetadata', function () {
          video.play().catch(function () {});
        }, { once: true });
      } else {
        video.src = source;
        video.play().catch(function () {
          if (button) {
            button.classList.remove('hidden');
            button.querySelector('strong').textContent = '浏览器需要 HLS 支持';
            button.querySelector('em').textContent = '请使用 Safari 或允许加载 hls.js 后播放';
          }
        });
      }
    }

    if (button) {
      button.addEventListener('click', startPlayer);
    }

    video.addEventListener('click', function () {
      if (!started) {
        startPlayer();
      }
    });
  }

  function initImageFallbacks(root) {
    qsa('img', root || document).forEach(function (img) {
      img.addEventListener('error', function () {
        img.classList.add('image-error');
        var wrapper = img.closest('.poster-wrap, .hero-poster, .category-card, .category-cover, .compact-item, .poster-detail');

        if (wrapper) {
          wrapper.classList.add('image-missing');
        }
      }, { once: true });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initMobileNav();
    initHero();
    initCardFilters();
    initGlobalSearch();
    initPlayer();
    initImageFallbacks(document);
  });
})();
