(function () {
  function setupMoviePlayer(videoId, buttonId, coverId, mediaUrl) {
    var video = document.getElementById(videoId);
    var button = document.getElementById(buttonId);
    var cover = document.getElementById(coverId);
    var started = false;
    var hls = null;

    if (!video || !button || !cover || !mediaUrl) {
      return;
    }

    function attachSource() {
      if (started) {
        return;
      }

      started = true;
      cover.classList.add('is-hidden');

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = mediaUrl;
        var nativePlay = video.play();

        if (nativePlay && nativePlay.catch) {
          nativePlay.catch(function () {
            cover.classList.remove('is-hidden');
            started = false;
          });
        }

        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({ enableWorker: true });
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MEDIA_ATTACHED, function () {
          hls.loadSource(mediaUrl);
          var hlsPlay = video.play();

          if (hlsPlay && hlsPlay.catch) {
            hlsPlay.catch(function () {});
          }
        });
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          var parsedPlay = video.play();

          if (parsedPlay && parsedPlay.catch) {
            parsedPlay.catch(function () {});
          }
        });
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal && hls) {
            hls.destroy();
            hls = null;
            video.src = mediaUrl;
            video.play().catch(function () {
              cover.classList.remove('is-hidden');
              started = false;
            });
          }
        });
        return;
      }

      video.src = mediaUrl;
      var directPlay = video.play();

      if (directPlay && directPlay.catch) {
        directPlay.catch(function () {
          cover.classList.remove('is-hidden');
          started = false;
        });
      }
    }

    cover.addEventListener('click', function (event) {
      event.preventDefault();
      attachSource();
    });

    button.addEventListener('click', function (event) {
      event.preventDefault();
      event.stopPropagation();
      attachSource();
    });

    video.addEventListener('click', function () {
      if (!started) {
        attachSource();
      }
    });
  }

  window.setupMoviePlayer = setupMoviePlayer;
}());
