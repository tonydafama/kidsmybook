(function ($) {
  "use strict";

  function initPreview(config) {
    const root = document.getElementById(config.id);
    if (!root) return;

    const book = root.querySelector(".mybook-3d-book");
    const counter = root.querySelector(".mybook-counter");
    const prevBtn = root.querySelector(".mybook-btn.prev");
    const nextBtn = root.querySelector(".mybook-btn.next");
    const fullscreenBtn = root.querySelector(".mybook-btn.fullscreen");

    if (!book || typeof $(book).turn !== "function") return;

    $(book).turn({
      width: Math.min(860, root.clientWidth - 16),
      height: 520,
      autoCenter: true,
      elevation: 50,
      gradients: true,
      when: {
        turned: function (_event, page) {
          if (counter) counter.textContent = page + " / " + config.pageCount;
        },
      },
    });

    if (prevBtn) {
      prevBtn.addEventListener("click", function () {
        $(book).turn("previous");
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener("click", function () {
        $(book).turn("next");
      });
    }

    if (fullscreenBtn) {
      fullscreenBtn.addEventListener("click", function () {
        if (!document.fullscreenElement) {
          root.requestFullscreen().catch(function () {});
        } else {
          document.exitFullscreen().catch(function () {});
        }
      });
    }
  }

  function boot() {
    const queue = window.MyBookPreviewQueue || [];
    queue.forEach(initPreview);
    window.MyBookPreviewQueue = [];
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})(jQuery);
