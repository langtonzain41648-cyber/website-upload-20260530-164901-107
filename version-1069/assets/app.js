(function () {
  var toggle = document.querySelector('.menu-toggle');
  var mobileNav = document.querySelector('.mobile-nav');

  if (toggle && mobileNav) {
    toggle.addEventListener('click', function () {
      var isOpen = toggle.classList.toggle('is-open');
      mobileNav.classList.toggle('is-open', isOpen);
      toggle.setAttribute('aria-expanded', String(isOpen));
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var active = 0;
    var timer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }

      active = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === active);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === active);
      });
    }

    function startHero() {
      timer = window.setInterval(function () {
        showSlide(active + 1);
      }, 5200);
    }

    function restartHero() {
      window.clearInterval(timer);
      startHero();
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
        restartHero();
      });
    });

    startHero();
  }

  var searchInput = document.querySelector('.js-search-input');
  var typeSelect = document.querySelector('.js-filter-type');
  var yearSelect = document.querySelector('.js-filter-year');
  var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card'));
  var empty = document.querySelector('.filter-empty');

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function filterCards() {
    if (!cards.length) {
      return;
    }

    var keyword = normalize(searchInput && searchInput.value);
    var type = normalize(typeSelect && typeSelect.value);
    var year = normalize(yearSelect && yearSelect.value);
    var visible = 0;

    cards.forEach(function (card) {
      var haystack = normalize([
        card.getAttribute('data-title'),
        card.getAttribute('data-type'),
        card.getAttribute('data-region'),
        card.getAttribute('data-year'),
        card.getAttribute('data-genre'),
        card.textContent
      ].join(' '));
      var cardType = normalize(card.getAttribute('data-type'));
      var cardYear = normalize(card.getAttribute('data-year'));
      var matchKeyword = !keyword || haystack.indexOf(keyword) !== -1;
      var matchType = !type || cardType.indexOf(type) !== -1;
      var matchYear = !year || cardYear.indexOf(year) !== -1;
      var isVisible = matchKeyword && matchType && matchYear;

      card.hidden = !isVisible;

      if (isVisible) {
        visible += 1;
      }
    });

    if (empty) {
      empty.hidden = visible !== 0;
    }
  }

  [searchInput, typeSelect, yearSelect].forEach(function (control) {
    if (control) {
      control.addEventListener('input', filterCards);
      control.addEventListener('change', filterCards);
    }
  });

  var query = new URLSearchParams(window.location.search).get('q');

  if (query && searchInput) {
    searchInput.value = query;
    filterCards();
  }

  function prepareVideo(video) {
    if (!video || video.dataset.ready === 'true') {
      return Promise.resolve();
    }

    var src = video.getAttribute('data-src');

    if (!src) {
      var source = video.querySelector('source');
      src = source ? source.getAttribute('src') : '';
    }

    if (!src) {
      return Promise.resolve();
    }

    video.dataset.ready = 'true';

    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });

      hls.loadSource(src);
      hls.attachMedia(video);
      video._hls = hls;

      return new Promise(function (resolve) {
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          resolve();
        });

        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (!data || !data.fatal) {
            return;
          }

          if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
            hls.startLoad();
          } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
            hls.recoverMediaError();
          } else {
            hls.destroy();
          }

          resolve();
        });
      });
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = src;
    }

    return Promise.resolve();
  }

  function playVideo(video, overlay) {
    prepareVideo(video).then(function () {
      var attempt = video.play();

      if (attempt && typeof attempt.catch === 'function') {
        attempt.catch(function () {});
      }

      if (overlay) {
        overlay.classList.add('is-hidden');
      }
    });
  }

  document.querySelectorAll('.player-card').forEach(function (card) {
    var video = card.querySelector('.js-video');
    var overlay = card.querySelector('.js-play-button');

    if (overlay && video) {
      overlay.addEventListener('click', function () {
        playVideo(video, overlay);
      });
    }

    if (video) {
      video.addEventListener('play', function () {
        if (overlay) {
          overlay.classList.add('is-hidden');
        }
      });

      video.addEventListener('pause', function () {
        if (overlay && video.currentTime === 0) {
          overlay.classList.remove('is-hidden');
        }
      });

      video.addEventListener('click', function () {
        if (video.paused) {
          playVideo(video, overlay);
        }
      });
    }
  });
})();
