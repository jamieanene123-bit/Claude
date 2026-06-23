/* =========================================================
   NOIR CUTS Zürich — Interaction Layer
   GSAP + ScrollTrigger with graceful IntersectionObserver fallback
   ========================================================= */
(function () {
  "use strict";

  var root = document.documentElement;
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Mark JS available (drives initial hidden states in CSS)
  if (!reduceMotion) root.classList.add("js");

  document.addEventListener("DOMContentLoaded", init);

  function init() {
    setYear();
    buildGallery();
    splitTitles();
    setupNav();
    setupMobileMenu();
    setupScrollProgress();
    setupPreloader();
  }

  /* ---------- Footer year ---------- */
  function setYear() {
    var y = document.getElementById("year");
    if (y) y.textContent = new Date().getFullYear();
  }

  /* ---------- Gallery (built in JS to keep HTML lean) ---------- */
  function buildGallery() {
    var grid = document.getElementById("galleryGrid");
    if (!grid) return;
    // Curated Unsplash barbershop / grooming imagery (varied ratios → masonry)
    var ids = [
      "1585747860715-2ba37e788b70",
      "1605497788044-5a32c7078486",
      "1622286342621-4bd786c2447c",
      "1503951914875-452162b0f3f1",
      "1599351431202-1e0f0137899a",
      "1621607512214-68297480165e",
      "1620331317314-4be79a2b9b66",
      "1517832606299-7ae9b720a186",
      "1596728325488-58c87691e9af",
      "1503443207922-dff7d543fd0e"
    ];
    var alts = [
      "Detailarbeit am Haaransatz",
      "Klassischer Barbierstuhl",
      "Bartpflege mit Klinge",
      "Atmosphäre im Atelier",
      "Barber bei der Arbeit",
      "Präziser Schnitt",
      "Werkzeuge des Handwerks",
      "Finish und Styling",
      "Heisse Tuchbehandlung",
      "Portrait nach dem Schnitt"
    ];
    var frag = document.createDocumentFragment();
    ids.forEach(function (id, i) {
      var fig = document.createElement("figure");
      fig.className = "gallery__item";
      fig.setAttribute("data-reveal", "fade");
      var img = document.createElement("img");
      img.loading = "lazy";
      img.decoding = "async";
      img.alt = alts[i] || "NOIR CUTS";
      img.src = "https://images.unsplash.com/photo-" + id +
        "?auto=format&fit=crop&w=800&q=80";
      fig.appendChild(img);
      frag.appendChild(fig);
    });
    grid.appendChild(frag);
  }

  /* ---------- Split section titles into masked words ---------- */
  function splitTitles() {
    if (reduceMotion) return;
    var titles = document.querySelectorAll('[data-reveal="lines"]');
    titles.forEach(function (el) {
      var html = el.innerHTML;
      // Preserve <em> wrappers while splitting words
      var temp = document.createElement("div");
      temp.innerHTML = html;
      el.innerHTML = "";
      wrapWords(temp, el);
    });
  }

  function wrapWords(source, target) {
    Array.prototype.forEach.call(source.childNodes, function (node) {
      if (node.nodeType === 3) {
        // text node → split into words
        var words = node.textContent.split(/(\s+)/);
        words.forEach(function (w) {
          if (w.trim() === "") {
            target.appendChild(document.createTextNode(w));
            return;
          }
          var mask = document.createElement("span");
          mask.className = "word-mask";
          var inner = document.createElement("span");
          inner.textContent = w;
          mask.appendChild(inner);
          target.appendChild(mask);
        });
      } else if (node.nodeType === 1) {
        var clone = node.cloneNode(false); // keep <em>
        target.appendChild(clone);
        wrapWords(node, clone);
      }
    });
  }

  /* ---------- Navigation scroll state ---------- */
  function setupNav() {
    var nav = document.getElementById("nav");
    if (!nav) return;
    var onScroll = function () {
      if (window.scrollY > 40) nav.classList.add("is-scrolled");
      else nav.classList.remove("is-scrolled");
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    // Smooth anchor scrolling + close mobile menu
    document.querySelectorAll('a[href^="#"]').forEach(function (a) {
      a.addEventListener("click", function (e) {
        var id = a.getAttribute("href");
        if (id.length < 2) return;
        var t = document.querySelector(id);
        if (!t) return;
        e.preventDefault();
        closeMenu();
        t.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
      });
    });
  }

  /* ---------- Mobile menu ---------- */
  var menuOpen = false;
  function setupMobileMenu() {
    var burger = document.getElementById("navBurger");
    var menu = document.getElementById("mobileMenu");
    var nav = document.getElementById("nav");
    if (!burger || !menu) return;
    burger.addEventListener("click", function () {
      menuOpen = !menuOpen;
      menu.classList.toggle("is-open", menuOpen);
      nav.classList.toggle("is-open", menuOpen);
      document.body.classList.toggle("is-locked", menuOpen);
      burger.setAttribute("aria-expanded", String(menuOpen));
      menu.setAttribute("aria-hidden", String(!menuOpen));
    });
  }
  function closeMenu() {
    if (!menuOpen) return;
    menuOpen = false;
    var menu = document.getElementById("mobileMenu");
    var nav = document.getElementById("nav");
    var burger = document.getElementById("navBurger");
    if (menu) { menu.classList.remove("is-open"); menu.setAttribute("aria-hidden", "true"); }
    if (nav) nav.classList.remove("is-open");
    if (burger) burger.setAttribute("aria-expanded", "false");
    document.body.classList.remove("is-locked");
  }

  /* ---------- Scroll progress bar ---------- */
  function setupScrollProgress() {
    var bar = document.getElementById("scrollProgress");
    if (!bar) return;
    var update = function () {
      var h = document.documentElement;
      var scrolled = h.scrollTop / (h.scrollHeight - h.clientHeight || 1);
      bar.style.width = (scrolled * 100).toFixed(2) + "%";
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
  }

  /* ---------- Preloader → then start hero / animations ---------- */
  function setupPreloader() {
    var pre = document.getElementById("preloader");
    var bar = pre ? pre.querySelector(".preloader__bar span") : null;
    if (bar) requestAnimationFrame(function () { bar.style.width = "100%"; });

    var done = function () {
      if (pre) pre.classList.add("is-done");
      startAnimations();
    };
    // Wait for window load (images/fonts) but cap the wait so it never hangs
    var fired = false;
    var go = function () { if (fired) return; fired = true; setTimeout(done, 350); };
    window.addEventListener("load", go);
    setTimeout(go, 1600); // safety cap
  }

  /* ---------- Animation orchestration ---------- */
  function startAnimations() {
    var hasGSAP = window.gsap && window.ScrollTrigger;
    if (hasGSAP && !reduceMotion) {
      gsapAnimations();
    } else {
      fallbackReveals();
    }
  }

  function gsapAnimations() {
    gsap.registerPlugin(ScrollTrigger);

    /* Hero intro timeline */
    gsap.set(".hero__title .line > span", { yPercent: 100 });
    var tl = gsap.timeline({ defaults: { ease: "power3.out" } });
    tl.fromTo(".hero__img", { scale: 1.25 }, { scale: 1.12, duration: 1.8, ease: "power2.out" }, 0)
      .to(".hero__eyebrow", { opacity: 1, y: 0, duration: 0.9 }, 0.2)
      .to(".hero__title .line > span", { yPercent: 0, duration: 1.1, stagger: 0.12 }, 0.3)
      .to(".hero__sub", { opacity: 1, y: 0, duration: 0.9 }, 0.7)
      .to(".hero__actions", { opacity: 1, y: 0, duration: 0.9 }, 0.9);

    /* Hero parallax on scroll */
    gsap.to(".hero__img", {
      yPercent: 18,
      ease: "none",
      scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true }
    });

    /* Generic reveals */
    gsap.utils.toArray('[data-reveal="fade"]').forEach(function (el) {
      gsap.to(el, {
        opacity: 1, y: 0, duration: 1, ease: "power3.out",
        scrollTrigger: { trigger: el, start: "top 88%" }
      });
    });
    gsap.utils.toArray('[data-reveal="scale"]').forEach(function (el) {
      gsap.to(el, {
        opacity: 1, scale: 1, duration: 1.3, ease: "power3.out",
        scrollTrigger: { trigger: el, start: "top 90%" }
      });
    });
    gsap.utils.toArray('[data-reveal="card"]').forEach(function (el, i) {
      gsap.to(el, {
        opacity: 1, y: 0, duration: 1, ease: "power3.out",
        scrollTrigger: { trigger: el, start: "top 90%" }
      });
    });
    /* Stagger cards within a grid */
    gsap.utils.toArray(".services__grid, .reviews__grid").forEach(function (grid) {
      gsap.to(grid.querySelectorAll('[data-reveal="card"]'), {
        opacity: 1, y: 0, duration: 1, ease: "power3.out", stagger: 0.14,
        scrollTrigger: { trigger: grid, start: "top 82%" }
      });
    });
    gsap.utils.toArray('[data-reveal="row"]').forEach(function (el) {
      gsap.to(el, {
        opacity: 1, y: 0, duration: 1, ease: "power3.out",
        scrollTrigger: { trigger: el, start: "top 88%" }
      });
    });

    /* Title word reveals */
    gsap.utils.toArray('[data-reveal="lines"]').forEach(function (el) {
      var words = el.querySelectorAll(".word-mask > span");
      if (!words.length) return;
      gsap.to(words, {
        yPercent: 0, duration: 1, ease: "power4.out", stagger: 0.08,
        scrollTrigger: { trigger: el, start: "top 86%" }
      });
    });

    /* Section parallax (art image, cta media) */
    gsap.utils.toArray("[data-parallax]").forEach(function (el) {
      var amount = parseFloat(el.getAttribute("data-parallax")) || 0.1;
      gsap.fromTo(el, { yPercent: -amount * 100 }, {
        yPercent: amount * 100, ease: "none",
        scrollTrigger: { trigger: el.closest("section") || el, start: "top bottom", end: "bottom top", scrub: true }
      });
    });

    ScrollTrigger.refresh();
  }

  /* ---------- Fallback: IntersectionObserver reveals ---------- */
  function fallbackReveals() {
    // Reveal hero immediately
    document.querySelectorAll(".reveal-line").forEach(function (el) {
      el.style.opacity = "1"; el.style.transform = "none";
    });
    document.querySelectorAll(".hero__title .line > span").forEach(function (el) {
      el.style.transform = "none";
    });

    var items = document.querySelectorAll("[data-reveal]");
    if (!("IntersectionObserver" in window) || reduceMotion) {
      items.forEach(showNow);
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var el = entry.target;
          el.style.transition = "opacity 1s var(--ease), transform 1s var(--ease)";
          showNow(el);
          io.unobserve(el);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    items.forEach(function (el) { io.observe(el); });
  }

  function showNow(el) {
    el.style.opacity = "1";
    el.style.transform = "none";
    var words = el.querySelectorAll ? el.querySelectorAll(".word-mask > span") : [];
    Array.prototype.forEach.call(words, function (w) { w.style.transform = "none"; });
  }
})();
