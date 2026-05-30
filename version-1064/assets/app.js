document.addEventListener("DOMContentLoaded", function () {
  var navToggle = document.querySelector("[data-nav-toggle]");
  var navLinks = document.querySelector("[data-nav-links]");

  if (navToggle && navLinks) {
    navToggle.addEventListener("click", function () {
      navLinks.classList.toggle("is-open");
    });
  }

  var slides = Array.from(document.querySelectorAll(".hero-slide"));
  var dots = Array.from(document.querySelectorAll(".hero-dot"));
  var slideIndex = 0;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    slideIndex = (index + slides.length) % slides.length;

    slides.forEach(function (slide, current) {
      slide.classList.toggle("is-active", current === slideIndex);
    });

    dots.forEach(function (dot, current) {
      dot.classList.toggle("is-active", current === slideIndex);
    });
  }

  dots.forEach(function (dot, index) {
    dot.addEventListener("click", function () {
      showSlide(index);
    });
  });

  if (slides.length > 1) {
    setInterval(function () {
      showSlide(slideIndex + 1);
    }, 5200);
  }

  var searchForms = Array.from(document.querySelectorAll("[data-search-form]"));

  searchForms.forEach(function (form) {
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var input = form.querySelector("input");
      var target = form.getAttribute("data-search-target") || "./categories.html";
      var keyword = input ? input.value.trim() : "";

      if (keyword) {
        window.location.href = target + "?q=" + encodeURIComponent(keyword);
      }
    });
  });

  var filters = Array.from(document.querySelectorAll("[data-filter-input], [data-filter-year], [data-filter-region]"));
  var cards = Array.from(document.querySelectorAll(".movie-card"));
  var emptyState = document.querySelector("[data-empty-state]");

  function applyFilters() {
    var keywordInput = document.querySelector("[data-filter-input]");
    var yearSelect = document.querySelector("[data-filter-year]");
    var regionSelect = document.querySelector("[data-filter-region]");
    var keyword = keywordInput ? keywordInput.value.trim().toLowerCase() : "";
    var year = yearSelect ? yearSelect.value : "";
    var region = regionSelect ? regionSelect.value : "";
    var visibleCount = 0;

    cards.forEach(function (card) {
      var text = [
        card.getAttribute("data-title") || "",
        card.getAttribute("data-region") || "",
        card.getAttribute("data-tags") || ""
      ].join(" ").toLowerCase();
      var cardYear = card.getAttribute("data-year") || "";
      var cardRegion = card.getAttribute("data-region") || "";
      var matched = true;

      if (keyword && text.indexOf(keyword) === -1) {
        matched = false;
      }

      if (year && cardYear !== year) {
        matched = false;
      }

      if (region && cardRegion !== region) {
        matched = false;
      }

      card.style.display = matched ? "" : "none";

      if (matched) {
        visibleCount += 1;
      }
    });

    if (emptyState) {
      emptyState.style.display = visibleCount ? "none" : "block";
    }
  }

  filters.forEach(function (field) {
    field.addEventListener("input", applyFilters);
    field.addEventListener("change", applyFilters);
  });

  var query = new URLSearchParams(window.location.search).get("q");
  var filterInput = document.querySelector("[data-filter-input]");

  if (query && filterInput) {
    filterInput.value = query;
    applyFilters();
  }

  Array.from(document.querySelectorAll("[data-player]" )).forEach(function (box) {
    var video = box.querySelector("video");
    var cover = box.querySelector("[data-video-cover]");
    var source = box.getAttribute("data-source");
    var attached = false;

    function attachAndPlay() {
      if (!video || !source) {
        return;
      }

      if (!attached) {
        if (window.Hls && window.Hls.isSupported()) {
          var hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(source);
          hls.attachMedia(video);
        } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = source;
        } else {
          video.src = source;
        }

        attached = true;
      }

      if (cover) {
        cover.classList.add("is-hidden");
      }

      video.play().catch(function () {});
    }

    if (cover) {
      cover.addEventListener("click", attachAndPlay);
    }

    if (video) {
      video.addEventListener("click", function () {
        if (video.paused) {
          attachAndPlay();
        } else {
          video.pause();
        }
      });
    }
  });
});
