/* =========================================================
   Studio Kreatif — interaksi global
   ========================================================= */
(function () {
  "use strict";

  const SITE = window.SITE || {};
  const $ = (sel, ctx) => (ctx || document).querySelector(sel);
  const $$ = (sel, ctx) => Array.from((ctx || document).querySelectorAll(sel));
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Isi teks dari config ---------- */
  function applyConfig() {
    $$("[data-brand]").forEach((el) => (el.textContent = SITE.brand || "Studio Kreatif"));
    $$("[data-email]").forEach((el) => {
      el.textContent = SITE.email || "";
      if (el.tagName === "A") el.href = "mailto:" + (SITE.email || "");
    });
    $$("[data-address]").forEach((el) => (el.textContent = SITE.address || ""));
    $$("[data-phone]").forEach((el) => (el.textContent = SITE.whatsappDisplay || ""));
    $$("[data-phone-link]").forEach((el) => {
      el.href = "tel:" + (SITE.whatsapp || "").replace(/[^\d+]/g, "");
    });
    $$("[data-year]").forEach((el) => (el.textContent = new Date().getFullYear()));

    $$("[data-social]").forEach((el) => {
      const key = el.getAttribute("data-social");
      if (SITE.socials && SITE.socials[key]) el.href = SITE.socials[key];
    });

    const hoursList = $("#hoursList");
    if (hoursList && Array.isArray(SITE.hours)) {
      hoursList.innerHTML = SITE.hours
        .map(
          (h) =>
            '<li><span class="day">' +
            h.day +
            '</span><span class="time">' +
            h.time +
            "</span></li>"
        )
        .join("");
    }

    const map = $("#locationMap");
    if (map && SITE.mapsQuery) {
      map.src =
        "https://www.google.com/maps?q=" +
        encodeURIComponent(SITE.mapsQuery) +
        "&output=embed";
    }
  }

  /* ---------- Tautan WhatsApp ---------- */
  function applyWhatsApp() {
    const number = String(SITE.whatsapp || "").replace(/[^\d]/g, "");
    if (!number) return;
    const fallback = SITE.whatsappMessage || "Halo, saya ingin bertanya.";

    $$("[data-wa]").forEach((el) => {
      const text = el.getAttribute("data-wa-text") || fallback;
      el.href = "https://wa.me/" + number + "?text=" + encodeURIComponent(text);
      el.target = "_blank";
      el.rel = "noopener noreferrer";
    });
  }

  /* ---------- Header & tombol kembali ke atas ---------- */
  function initScrollUI() {
    const header = $("#siteHeader");
    const topBtn = $("#scrollTop");

    const update = () => {
      const y = window.scrollY || window.pageYOffset;
      if (header) {
        if (header.classList.contains("site-header--overlay")) {
          header.classList.toggle("is-solid", y > 30);
        } else {
          header.classList.add("is-solid");
        }
      }
      if (topBtn) topBtn.classList.toggle("is-visible", y > 420);
    };

    window.addEventListener("scroll", update, { passive: true });
    update();

    if (topBtn) {
      topBtn.addEventListener("click", () => {
        window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
      });
    }
  }

  /* ---------- Animasi saat scroll ---------- */
  function initReveal() {
    const items = $$(".reveal");
    if (!items.length) return;

    if (reduceMotion || !("IntersectionObserver" in window)) {
      items.forEach((el) => el.classList.add("is-visible"));
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );

    items.forEach((el) => io.observe(el));
  }

  /* ---------- Tema gelap / terang ---------- */
  function initTheme() {
    const toggle = $("#themeToggle");
    const root = document.documentElement;

    if (toggle) {
      toggle.addEventListener("click", () => {
        const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
        root.setAttribute("data-theme", next);
        try {
          localStorage.setItem("sk-theme", next);
        } catch (e) {
          /* localStorage bisa diblokir di beberapa browser */
        }
        toggle.setAttribute(
          "aria-label",
          next === "dark" ? "Aktifkan mode terang" : "Aktifkan mode gelap"
        );
      });
    }
  }

  /* ---------- Filter katalog ---------- */
  function initCatalogFilter() {
    const buttons = $$("[data-filter]");
    const items = $$("[data-category]");
    if (!buttons.length || !items.length) return;

    const apply = (value) => {
      buttons.forEach((b) => b.classList.toggle("is-active", b.dataset.filter === value));
      items.forEach((item) => {
        const show = value === "all" || item.dataset.category === value;
        item.classList.toggle("d-none", !show);
      });
    };

    buttons.forEach((btn) => {
      btn.addEventListener("click", () => apply(btn.dataset.filter));
    });

    const params = new URLSearchParams(window.location.search);
    const requested = params.get("kategori");
    const target = buttons.find((b) => b.dataset.filter === requested);
    apply(target ? requested : "all");
  }

  /* ---------- Form demo + toast ---------- */
  function showToast(message) {
    const toastEl = $("#siteToast");
    if (!toastEl || typeof bootstrap === "undefined") {
      window.alert(message);
      return;
    }
    const body = $(".toast-body", toastEl);
    if (body) body.textContent = message;
    bootstrap.Toast.getOrCreateInstance(toastEl).show();
  }

  function initForms() {
    $$("[data-demo-form]").forEach((form) => {
      form.addEventListener("submit", (event) => {
        event.preventDefault();
        event.stopPropagation();
        if (!form.checkValidity()) {
          form.classList.add("was-validated");
          return;
        }
        form.classList.remove("was-validated");
        form.reset();
        showToast(
          form.getAttribute("data-success") ||
            "Terima kasih! Pesan Anda sudah kami terima (demo)."
        );
      });
    });
  }

  /* ---------- Tutup offcanvas setelah klik tautan ---------- */
  function initOffcanvas() {
    const menu = $("#mobileMenu");
    if (!menu || typeof bootstrap === "undefined") return;
    $$("a", menu).forEach((link) => {
      link.addEventListener("click", () => {
        const instance = bootstrap.Offcanvas.getInstance(menu);
        if (instance) instance.hide();
      });
    });
  }

  /* ---------- Jalankan ---------- */
  document.addEventListener("DOMContentLoaded", () => {
    applyConfig();
    applyWhatsApp();
    initScrollUI();
    initReveal();
    initTheme();
    initCatalogFilter();
    initForms();
    initOffcanvas();
  });
})();
