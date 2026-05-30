(function () {
  var toggle = document.querySelector('[data-nav-toggle]');
  var panel = document.querySelector('[data-mobile-panel]');

  if (toggle && panel) {
    toggle.addEventListener('click', function () {
      panel.classList.toggle('open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var tabs = Array.prototype.slice.call(document.querySelectorAll('[data-hero-tab]'));
  var activeIndex = 0;

  function setHero(index) {
    if (!slides.length) {
      return;
    }

    activeIndex = (index + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('active', slideIndex === activeIndex);
    });

    tabs.forEach(function (tab, tabIndex) {
      tab.classList.toggle('active', tabIndex === activeIndex);
    });
  }

  tabs.forEach(function (tab, tabIndex) {
    tab.addEventListener('click', function () {
      setHero(tabIndex);
    });
  });

  if (slides.length > 1) {
    setHero(0);
    window.setInterval(function () {
      setHero(activeIndex + 1);
    }, 5200);
  }

  var input = document.querySelector('[data-search-input]');
  var sortSelect = document.querySelector('[data-sort-select]');
  var count = document.querySelector('[data-search-count]');
  var grids = Array.prototype.slice.call(document.querySelectorAll('[data-filter-grid]'));
  var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function sortCards() {
    if (!sortSelect || !grids.length) {
      return;
    }

    var mode = sortSelect.value;

    grids.forEach(function (grid) {
      var gridCards = Array.prototype.slice.call(grid.querySelectorAll('[data-card]'));

      gridCards.sort(function (a, b) {
        if (mode === 'year') {
          return Number(b.dataset.year || 0) - Number(a.dataset.year || 0);
        }

        if (mode === 'title') {
          return String(a.dataset.title || '').localeCompare(String(b.dataset.title || ''), 'zh-Hans-CN');
        }

        return Number(b.dataset.hot || 0) - Number(a.dataset.hot || 0);
      });

      gridCards.forEach(function (card) {
        grid.appendChild(card);
      });
    });
  }

  function filterCards() {
    var keyword = normalize(input ? input.value : '');
    var visible = 0;

    cards.forEach(function (card) {
      var haystack = normalize([
        card.dataset.title,
        card.dataset.year,
        card.dataset.genre,
        card.dataset.region
      ].join(' '));

      var matched = !keyword || haystack.indexOf(keyword) !== -1;
      card.style.display = matched ? '' : 'none';

      if (matched) {
        visible += 1;
      }
    });

    if (count) {
      count.textContent = '当前显示 ' + visible + ' 条内容';
    }
  }

  if (input) {
    input.addEventListener('input', filterCards);
  }

  if (sortSelect) {
    sortSelect.addEventListener('change', function () {
      sortCards();
      filterCards();
    });
  }

  sortCards();
  filterCards();

  function initPlayer(button) {
    var shell = button.closest('[data-player-shell]');

    if (!shell) {
      return;
    }

    var video = shell.querySelector('video');
    var overlay = shell.querySelector('[data-player-overlay]');
    var source = shell.getAttribute('data-m3u8');

    if (!video || !source) {
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: false
      });

      hls.loadSource(source);
      hls.attachMedia(video);
      hls.on(window.Hls.Events.ERROR, function (event, data) {
        if (data && data.fatal) {
          if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
            hls.startLoad();
          } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
            hls.recoverMediaError();
          } else {
            hls.destroy();
          }
        }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
    } else {
      video.src = source;
    }

    if (overlay) {
      overlay.classList.add('hidden');
    }

    var playPromise = video.play();

    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(function () {
        video.controls = true;
      });
    }
  }

  document.querySelectorAll('[data-player-button]').forEach(function (button) {
    button.addEventListener('click', function () {
      initPlayer(button);
    });
  });
})();
