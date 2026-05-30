(function () {
  var menuButton = document.querySelector('[data-menu-button]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  var currentSlide = 0;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    currentSlide = (index + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('is-active', slideIndex === currentSlide);
    });
  }

  var nextButton = document.querySelector('[data-hero-next]');
  var prevButton = document.querySelector('[data-hero-prev]');

  if (nextButton) {
    nextButton.addEventListener('click', function () {
      showSlide(currentSlide + 1);
    });
  }

  if (prevButton) {
    prevButton.addEventListener('click', function () {
      showSlide(currentSlide - 1);
    });
  }

  if (slides.length > 1) {
    window.setInterval(function () {
      showSlide(currentSlide + 1);
    }, 5200);
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function bindCardSearch(input) {
    var targetSelector = input.getAttribute('data-target') || '.movie-card';
    var cards = Array.prototype.slice.call(document.querySelectorAll(targetSelector));
    var noResults = document.querySelector('[data-no-results]');
    var yearFilter = document.querySelector('[data-year-filter]');
    var typeFilter = document.querySelector('[data-type-filter]');

    function filterCards() {
      var query = normalize(input.value);
      var year = yearFilter ? normalize(yearFilter.value) : '';
      var type = typeFilter ? normalize(typeFilter.value) : '';
      var visibleCount = 0;

      cards.forEach(function (card) {
        var text = normalize(card.getAttribute('data-search-text'));
        var cardYear = normalize(card.getAttribute('data-year'));
        var cardType = normalize(card.getAttribute('data-type'));
        var matched = (!query || text.indexOf(query) !== -1) && (!year || cardYear === year) && (!type || cardType === type);

        card.classList.toggle('hidden-card', !matched);

        if (matched) {
          visibleCount += 1;
        }
      });

      if (noResults) {
        noResults.style.display = visibleCount ? 'none' : 'block';
      }
    }

    input.addEventListener('input', filterCards);

    if (yearFilter) {
      yearFilter.addEventListener('change', filterCards);
    }

    if (typeFilter) {
      typeFilter.addEventListener('change', filterCards);
    }

    var params = new URLSearchParams(window.location.search);
    var incomingQuery = params.get('q');

    if (incomingQuery && !input.value) {
      input.value = incomingQuery;
    }

    filterCards();
  }

  Array.prototype.slice.call(document.querySelectorAll('[data-card-search]')).forEach(bindCardSearch);

  Array.prototype.slice.call(document.querySelectorAll('[data-search-form]')).forEach(function (form) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var input = form.querySelector('input[name="q"]');
      var query = input ? input.value.trim() : '';
      var target = form.getAttribute('action') || 'search.html';
      window.location.href = query ? target + '?q=' + encodeURIComponent(query) : target;
    });
  });
})();
