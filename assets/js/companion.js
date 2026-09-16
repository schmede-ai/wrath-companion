/* WRATH Companion — the whole of the site's JavaScript.
   Four jobs: the nav drawer, scroll-spy, the plate viewer, click-to-play video.
   No dependencies, no tracking, no third-party request until a video is clicked. */
(function () {
  "use strict";

  var nav = document.getElementById("wc-nav");
  var toggle = document.querySelector(".wc-navtoggle");
  var scrim = document.getElementById("wc-scrim");
  var runhead = document.getElementById("wc-runhead");
  var topBtn = document.getElementById("wc-top");

  /* ——— nav drawer (mobile) ——— */
  function setNav(open) {
    if (!nav) return;
    nav.classList.toggle("is-open", open);
    if (scrim) scrim.hidden = !open;
    if (toggle) toggle.setAttribute("aria-expanded", open ? "true" : "false");
    document.body.classList.toggle("wc-locked", open);
  }
  if (toggle) toggle.addEventListener("click", function () { setNav(!nav.classList.contains("is-open")); });
  if (scrim) scrim.addEventListener("click", function () { setNav(false); });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") setNav(false);
  });

  /* ——— scroll-spy: highlight the current section, update the running head ——— */
  var links = {};
  Array.prototype.forEach.call(document.querySelectorAll(".cw-nav-item[data-anchor]"), function (a) {
    links[a.getAttribute("data-anchor")] = a;
    a.addEventListener("click", function () {
      // On mobile the drawer covers the page; close it so the jump is visible.
      if (window.matchMedia("(max-width: 1080px)").matches) setNav(false);
    });
  });

  var sections = Array.prototype.slice.call(document.querySelectorAll(".wc-sec"));
  var active = null;

  function markActive(id) {
    if (id === active) return;
    if (active && links[active]) links[active].classList.remove("is-active");
    active = id;
    var a = links[id];
    if (!a) return;
    a.classList.add("is-active");
    var sec = document.getElementById(id);
    if (runhead && sec) runhead.textContent = sec.getAttribute("data-label") || "";
    // Keep the active item visible in a long sidebar, without yanking the page.
    if (!window.matchMedia("(max-width: 1080px)").matches && nav) {
      var r = a.getBoundingClientRect(), n = nav.getBoundingClientRect();
      if (r.top < n.top + 60 || r.bottom > n.bottom - 60) {
        nav.scrollTop += r.top - n.top - n.height / 2;
      }
    }
  }

  function spy() {
    var best = null, bestTop = -Infinity;
    var line = 140; // a little below the sticky topbar
    for (var i = 0; i < sections.length; i++) {
      var t = sections[i].getBoundingClientRect().top;
      if (t <= line && t > bestTop) { bestTop = t; best = sections[i]; }
    }
    if (!best && sections.length) best = sections[0];
    if (best) markActive(best.id);
    if (topBtn) topBtn.hidden = window.scrollY < 900;
  }

  var ticking = false;
  window.addEventListener("scroll", function () {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(function () { spy(); ticking = false; });
  }, { passive: true });
  window.addEventListener("resize", spy, { passive: true });
  spy();

  if (topBtn) {
    topBtn.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  /* ——— plate viewer ——— */
  var viewer = document.getElementById("wc-viewer");
  if (viewer) {
    var vImg = viewer.querySelector("img");
    var vCap = viewer.querySelector(".cw-viewer-cap");
    var close = function () { viewer.hidden = true; vImg.src = ""; document.body.classList.remove("wc-locked"); };

    Array.prototype.forEach.call(document.querySelectorAll(".cw-plate"), function (fig) {
      fig.addEventListener("click", function () {
        var img = fig.querySelector("img");
        var cap = fig.querySelector("figcaption");
        if (!img) return;
        vImg.src = img.src;
        vImg.alt = img.alt || "";
        vCap.textContent = cap ? cap.textContent : "";
        viewer.hidden = false;
        document.body.classList.add("wc-locked");
      });
    });
    viewer.addEventListener("click", close);
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && !viewer.hidden) close();
    });
  }

  /* ——— click-to-play video (no YouTube request until asked) ——— */
  function play(tile) {
    var id = tile.getAttribute("data-yt");
    if (!id || tile.dataset.playing) return;
    tile.dataset.playing = "1";
    var f = document.createElement("iframe");
    f.src = "https://www.youtube-nocookie.com/embed/" + id + "?autoplay=1&rel=0";
    f.setAttribute("allow", "autoplay; encrypted-media; fullscreen; picture-in-picture");
    f.setAttribute("allowfullscreen", "true");
    f.setAttribute("title", tile.getAttribute("aria-label") || "WRATH");
    var thumb = tile.querySelector(".wc-yt-thumb");
    if (thumb) thumb.replaceWith(f);
  }

  Array.prototype.forEach.call(document.querySelectorAll(".wc-yt[data-yt]"), function (tile) {
    tile.addEventListener("click", function () { play(tile); });
    tile.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); play(tile); }
    });
  });
})();
