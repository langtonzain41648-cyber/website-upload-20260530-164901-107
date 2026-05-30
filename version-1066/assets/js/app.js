(function () {
  function resolveUrl(path) {
    if (!path || /^(https?:|mailto:|tel:|#)/.test(path)) {
      return path;
    }
    var inMovieFolder = /\/movies\//.test(window.location.pathname) || /\\movies\\/.test(window.location.pathname);
    if (inMovieFolder && !path.startsWith('../')) {
      return '../' + path;
    }
    return path;
  }

  function hideBrokenImages() {
    document.querySelectorAll('img').forEach(function (image) {
      image.addEventListener('error', function () {
        image.style.opacity = '0';
        image.style.visibility = 'hidden';
      });
    });
  }

  function setupMenu() {
    var button = document.querySelector('[data-menu-toggle]');
    var menu = document.querySelector('[data-mobile-menu]');
    if (!button || !menu) {
      return;
    }
    button.addEventListener('click', function () {
      menu.classList.toggle('is-open');
    });
  }

  function setupHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
    if (!slides.length) {
      return;
    }
    var current = 0;
    var timer;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function start() {
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        window.clearInterval(timer);
        show(index);
        start();
      });
    });

    show(0);
    start();
  }

  function setupSearch() {
    var index = window.searchIndex || [];
    document.querySelectorAll('[data-site-search]').forEach(function (form) {
      var input = form.querySelector('input[type="search"]');
      var panel = form.querySelector('[data-search-results]');
      if (!input || !panel) {
        return;
      }

      function render() {
        var keyword = input.value.trim().toLowerCase();
        if (!keyword) {
          panel.classList.remove('is-open');
          panel.innerHTML = '';
          return;
        }
        var results = index.filter(function (item) {
          return [item.title, item.region, item.type, item.year, item.genre, item.tags, item.oneLine]
            .join(' ')
            .toLowerCase()
            .indexOf(keyword) !== -1;
        }).slice(0, 10);

        if (!results.length) {
          panel.innerHTML = '<div class="search-empty">没有找到匹配影片</div>';
          panel.classList.add('is-open');
          return;
        }

        panel.innerHTML = results.map(function (item) {
          var imagePath = resolveUrl(item.image);
          var linkPath = resolveUrl(item.url);
          return '<a class="search-result" href="' + linkPath + '">' +
            '<img src="' + imagePath + '" alt="' + escapeHtml(item.title) + '">' +
            '<span><strong>' + escapeHtml(item.title) + '</strong><span>' + escapeHtml(item.region + ' · ' + item.year + ' · ' + item.type) + '</span></span>' +
            '</a>';
        }).join('');
        panel.classList.add('is-open');
        hideBrokenImages();
      }

      input.addEventListener('input', render);
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        render();
      });
      document.addEventListener('click', function (event) {
        if (!form.contains(event.target)) {
          panel.classList.remove('is-open');
        }
      });
    });
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function setupPlayer() {
    var video = document.querySelector('#movie-player');
    var button = document.querySelector('[data-play-button]');
    var status = document.querySelector('[data-play-status]');
    if (!video || !button) {
      return;
    }
    var streamUrl = video.getAttribute('data-stream');
    var hlsInstance = null;

    function setStatus(message) {
      if (status) {
        status.textContent = message;
      }
    }

    function attachStream() {
      if (!streamUrl) {
        setStatus('播放源暂不可用');
        return false;
      }
      if (video.getAttribute('data-ready') === 'yes') {
        return true;
      }
      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({ enableWorker: true });
        hlsInstance.loadSource(streamUrl);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
          setStatus('已准备播放');
        });
        hlsInstance.on(window.Hls.Events.ERROR, function () {
          setStatus('播放加载中');
        });
      } else {
        video.src = streamUrl;
      }
      video.setAttribute('data-ready', 'yes');
      return true;
    }

    function playVideo() {
      if (!attachStream()) {
        return;
      }
      var promise = video.play();
      if (promise && typeof promise.then === 'function') {
        promise.then(function () {
          setStatus('正在播放');
        }).catch(function () {
          setStatus('点击视频控件继续播放');
        });
      }
    }

    button.addEventListener('click', playVideo);
    video.addEventListener('click', playVideo);
    video.addEventListener('play', function () {
      setStatus('正在播放');
    });
    video.addEventListener('pause', function () {
      setStatus('已暂停');
    });
    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    hideBrokenImages();
    setupMenu();
    setupHero();
    setupSearch();
    setupPlayer();
  });
})();
