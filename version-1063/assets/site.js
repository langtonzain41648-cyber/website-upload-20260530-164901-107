(function () {
  var menuButton = document.querySelector('.menu-toggle');
  var mobileNav = document.querySelector('.mobile-nav');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      var isOpen = mobileNav.classList.toggle('open');
      menuButton.setAttribute('aria-expanded', String(isOpen));
      menuButton.textContent = isOpen ? '×' : '☰';
    });
  }

  var heroSlides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var heroDots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  var heroPrev = document.querySelector('[data-hero-prev]');
  var heroNext = document.querySelector('[data-hero-next]');
  var heroIndex = 0;
  var heroTimer = null;

  function showHeroSlide(index) {
    if (!heroSlides.length) {
      return;
    }

    heroIndex = (index + heroSlides.length) % heroSlides.length;

    heroSlides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('active', slideIndex === heroIndex);
    });

    heroDots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('active', dotIndex === heroIndex);
    });
  }

  function startHeroTimer() {
    if (!heroSlides.length) {
      return;
    }

    window.clearInterval(heroTimer);
    heroTimer = window.setInterval(function () {
      showHeroSlide(heroIndex + 1);
    }, 5200);
  }

  if (heroSlides.length) {
    heroDots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showHeroSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
        startHeroTimer();
      });
    });

    if (heroPrev) {
      heroPrev.addEventListener('click', function () {
        showHeroSlide(heroIndex - 1);
        startHeroTimer();
      });
    }

    if (heroNext) {
      heroNext.addEventListener('click', function () {
        showHeroSlide(heroIndex + 1);
        startHeroTimer();
      });
    }

    startHeroTimer();
  }

  var filterPanel = document.querySelector('.library-filter');

  if (filterPanel) {
    var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card'));
    var emptyState = document.querySelector('[data-empty-state]');
    var searchInput = filterPanel.querySelector('[data-filter="search"]');
    var genreSelect = filterPanel.querySelector('[data-filter="genre"]');
    var yearSelect = filterPanel.querySelector('[data-filter="year"]');
    var regionSelect = filterPanel.querySelector('[data-filter="region"]');
    var typeSelect = filterPanel.querySelector('[data-filter="type"]');
    var categorySelect = filterPanel.querySelector('[data-filter="category"]');
    var params = new URLSearchParams(window.location.search);
    var initialSearch = params.get('search') || '';

    if (searchInput && initialSearch) {
      searchInput.value = initialSearch;
    }

    function getValue(control) {
      return control ? control.value.trim().toLowerCase() : '';
    }

    function cardText(card) {
      return [
        card.getAttribute('data-title'),
        card.getAttribute('data-genre'),
        card.getAttribute('data-main-genre'),
        card.getAttribute('data-year'),
        card.getAttribute('data-region'),
        card.getAttribute('data-type'),
        card.textContent
      ].join(' ').toLowerCase();
    }

    function applyFilters() {
      var keyword = getValue(searchInput);
      var genre = getValue(genreSelect);
      var year = getValue(yearSelect);
      var region = getValue(regionSelect);
      var type = getValue(typeSelect);
      var category = getValue(categorySelect);
      var visibleCount = 0;

      cards.forEach(function (card) {
        var text = cardText(card);
        var matchesKeyword = !keyword || text.indexOf(keyword) !== -1;
        var matchesGenre = !genre || text.indexOf(genre) !== -1;
        var matchesYear = !year || (card.getAttribute('data-year') || '').toLowerCase() === year;
        var matchesRegion = !region || text.indexOf(region) !== -1;
        var matchesType = !type || text.indexOf(type) !== -1;
        var matchesCategory = !category || text.indexOf(category) !== -1;
        var visible = matchesKeyword && matchesGenre && matchesYear && matchesRegion && matchesType && matchesCategory;

        card.style.display = visible ? '' : 'none';

        if (visible) {
          visibleCount += 1;
        }
      });

      if (emptyState) {
        emptyState.classList.toggle('show', visibleCount === 0);
      }
    }

    [searchInput, genreSelect, yearSelect, regionSelect, typeSelect, categorySelect].forEach(function (control) {
      if (control) {
        control.addEventListener('input', applyFilters);
        control.addEventListener('change', applyFilters);
      }
    });

    applyFilters();
  }
}());
