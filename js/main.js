/* =========================================================
   KINETIC DIGITAL ATELIER — Muhammad Ibrahim Khalid
   Part A: core features (work without GSAP / with reduced motion)
   Part B: motion layer (GSAP + ScrollTrigger), desktop effects gated
   ========================================================= */
(function () {
  "use strict";

  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const root = document.documentElement;

  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  // heavy effects (canvas, magnetic, mouse parallax, hover movement) only on real pointer desktops
  const fine = window.matchMedia("(min-width: 901px) and (hover: hover) and (pointer: fine)").matches;
  const hasGsap = typeof window.gsap !== "undefined" && typeof window.ScrollTrigger !== "undefined";
  const animate = hasGsap && !reduce;

  /* =======================================================
     PART A — CORE
     ======================================================= */

  /* ---------- Navigation ---------- */
  const Nav = {
    init() {
      this.nav = $("#nav");
      this.btn = $("#menuBtn");
      this.links = $$(".nl");
      this.ind = $("#navInd");
      this.list = $("#navList");
      this.active = null;
      this.lastY = window.scrollY;

      // mobile menu
      this.btn.addEventListener("click", () => this.toggle());
      this.links.forEach((l) => l.addEventListener("click", () => this.toggle(false)));
      document.addEventListener("keydown", (e) => { if (e.key === "Escape" && this.nav.classList.contains("nav-open")) this.toggle(false); });

      // scrolled / hide-on-scroll-down
      let ticking = false;
      window.addEventListener("scroll", () => {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(() => {
          const y = window.scrollY, dy = y - this.lastY;
          this.nav.classList.toggle("is-scrolled", y > 40);
          if (!this.nav.classList.contains("nav-open")) {
            if (y > 300 && dy > 8) this.nav.classList.add("is-hidden");
            else if (dy < -4 || y <= 300) this.nav.classList.remove("is-hidden");
          }
          this.lastY = y;
          ticking = false;
        });
      }, { passive: true });

      // active section + sliding indicator
      this.sections = this.links.map((l) => $(l.getAttribute("href"))).filter(Boolean);
      if ("IntersectionObserver" in window) {
        const io = new IntersectionObserver((entries) => {
          entries.forEach((en) => {
            if (en.isIntersecting) this.setActive(`#${en.target.id}`);
          });
        }, { rootMargin: "-45% 0px -50% 0px" });
        this.sections.forEach((s) => io.observe(s));
        const hero = $("#hero");
        if (hero) new IntersectionObserver((en) => { if (en[0].isIntersecting) this.setActive(null); }, { threshold: 0.6 }).observe(hero);
      }
      this.links.forEach((l) => {
        l.addEventListener("mouseenter", () => this.moveTo(l));
        l.addEventListener("focus", () => this.moveTo(l));
        l.addEventListener("mouseleave", () => this.moveTo(this.active));
        l.addEventListener("blur", () => this.moveTo(this.active));
      });
      window.addEventListener("resize", () => this.moveTo(this.active));
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => this.moveTo(this.active));
    },
    toggle(force) {
      const open = typeof force === "boolean" ? force : !this.nav.classList.contains("nav-open");
      this.nav.classList.toggle("nav-open", open);
      this.btn.setAttribute("aria-expanded", String(open));
      this.btn.querySelector(".mb-label").textContent = open ? "Close" : "Menu";
      document.body.style.overflow = open ? "hidden" : "";
    },
    setActive(hash) {
      const link = hash ? this.links.find((l) => l.getAttribute("href") === hash) : null;
      this.active = link || null;
      this.links.forEach((l) => l.classList.toggle("is-active", l === this.active));
      this.moveTo(this.active);
    },
    moveTo(link) {
      if (!this.ind) return;
      if (!link) { this.ind.classList.remove("is-on"); return; }
      this.ind.classList.add("is-on");
      this.ind.style.transform = `translateX(${link.offsetLeft}px) scaleX(${link.offsetWidth})`;
    },
  };

  /* ---------- Theme toggle (dark / light) ---------- */
  const Theme = {
    init() {
      this.btn = $("#themeBtn");
      if (!this.btn) return;
      this.meta = $('meta[name="theme-color"]');
      this.sync();
      this.btn.addEventListener("click", (e) => this.toggle(e));
    },
    current() { return root.getAttribute("data-theme") === "light" ? "light" : "dark"; },
    sync() {
      const light = this.current() === "light";
      this.btn.setAttribute("aria-pressed", String(light));
      this.btn.setAttribute("aria-label", light ? "Switch to dark theme" : "Switch to light theme");
      if (this.meta) this.meta.setAttribute("content", light ? "#F2F0E9" : "#101110");
    },
    apply(t) {
      root.setAttribute("data-theme", t);
      try { localStorage.setItem("theme", t); } catch (e) { /* storage unavailable */ }
      this.sync();
      window.dispatchEvent(new Event("themechange"));
    },
    toggle(e) {
      const next = this.current() === "light" ? "dark" : "light";
      if (reduce) { this.apply(next); return; }
      // circular reveal from the button where supported, otherwise a soft colour cross-fade
      if (document.startViewTransition) {
        const r = this.btn.getBoundingClientRect();
        const x = r.left + r.width / 2, y = r.top + r.height / 2;
        const end = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
        const vt = document.startViewTransition(() => this.apply(next));
        vt.ready.then(() => {
          root.animate(
            { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${end}px at ${x}px ${y}px)`] },
            { duration: 850, easing: "cubic-bezier(.16,1,.3,1)", pseudoElement: "::view-transition-new(root)" }
          );
        }).catch(() => {});
      } else {
        root.classList.add("theme-fade");
        this.apply(next);
        setTimeout(() => root.classList.remove("theme-fade"), 700);
      }
    },
  };

  /* ---------- Scroll progress bar ---------- */
  function initProgress() {
    const bar = $("#progress");
    if (!bar) return;
    let t = false;
    const upd = () => {
      const max = document.documentElement.scrollHeight - innerHeight;
      bar.style.transform = `scaleX(${max > 0 ? Math.min(1, scrollY / max) : 0})`;
      t = false;
    };
    window.addEventListener("scroll", () => { if (!t) { t = true; requestAnimationFrame(upd); } }, { passive: true });
    window.addEventListener("resize", upd);
    upd();
  }

  /* ---------- Eased anchor scrolling ---------- */
  function initAnchorScroll() {
    if (reduce) return; // native jump for reduced motion
    let raf = 0;
    const stop = () => { if (raf) { cancelAnimationFrame(raf); raf = 0; root.style.scrollBehavior = ""; } };
    ["wheel", "touchstart", "keydown"].forEach((ev) => window.addEventListener(ev, stop, { passive: true }));
    document.addEventListener("click", (e) => {
      const a = e.target.closest('a[href^="#"]');
      if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey) return;
      const id = a.getAttribute("href");
      const target = id.length > 1 ? $(id) : null;
      if (!target && id !== "#top") return;
      e.preventDefault();
      const navH = parseFloat(getComputedStyle(root).getPropertyValue("--nav-h")) || 76;
      const to = target && id !== "#top" ? Math.max(0, target.getBoundingClientRect().top + scrollY - navH + 1) : 0;
      const from = scrollY, dist = to - from;
      if (Math.abs(dist) < 2) return;
      const dur = Math.min(1400, 600 + Math.abs(dist) * 0.22);
      const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
      stop();
      root.style.scrollBehavior = "auto";
      const t0 = performance.now();
      const step = (now) => {
        const k = Math.min(1, (now - t0) / dur);
        window.scrollTo(0, from + dist * ease(k));
        if (k < 1) raf = requestAnimationFrame(step); else { raf = 0; root.style.scrollBehavior = ""; }
      };
      raf = requestAnimationFrame(step);
      try { history.pushState(null, "", id); } catch (err) { /* file:// */ }
    });
  }

  /* ---------- Optional images (placeholder until the file exists) ---------- */
  const OptionalImages = {
    init() {
      $$("img[data-optional]").forEach((img) => {
        const wrap = img.closest(".optional-media");
        if (!wrap) return;
        const probe = new Image(); // probing separately avoids false "missing" with lazy loading
        probe.onload = () => wrap.classList.add("is-loaded");
        probe.onerror = () => wrap.classList.add("is-missing");
        probe.src = img.getAttribute("src");
      });
    },
  };

  /* ---------- Certificate lightbox ---------- */
  const Lightbox = {
    init() {
      this.box = $("#lightbox");
      if (!this.box) return;
      this.img = $("#lbImg"); this.caption = $("#lbCaption");
      this.items = []; this.index = 0; this.lastFocus = null;

      document.addEventListener("click", (e) => {
        const t = e.target.closest("[data-lightbox]");
        if (!t) return;
        e.preventDefault();
        const wrap = t.closest(".optional-media");
        if (wrap && !wrap.classList.contains("is-loaded")) return;
        this.open(t);
      });
      $("#lbClose").addEventListener("click", () => this.close());
      $("#lbPrev").addEventListener("click", () => this.step(-1));
      $("#lbNext").addEventListener("click", () => this.step(1));
      this.box.addEventListener("click", (e) => { if (e.target === this.box || e.target.classList.contains("lb-figure")) this.close(); });
      document.addEventListener("keydown", (e) => {
        if (this.box.hidden) return;
        if (e.key === "Escape") this.close();
        else if (e.key === "ArrowLeft") this.step(-1);
        else if (e.key === "ArrowRight") this.step(1);
        else if (e.key === "Tab") this.trap(e);
      });
    },
    available() {
      return $$("[data-lightbox]").filter((a) => { const w = a.closest(".optional-media"); return !w || w.classList.contains("is-loaded"); });
    },
    open(t) {
      this.items = this.available();
      this.index = Math.max(0, this.items.indexOf(t));
      this.lastFocus = document.activeElement;
      this.show();
      this.box.hidden = false;
      document.body.style.overflow = "hidden";
      $("#lbClose").focus();
    },
    show() {
      const a = this.items[this.index]; if (!a) return;
      this.img.src = a.getAttribute("href");
      this.img.alt = (a.querySelector("img") || {}).alt || a.dataset.title || "Certificate";
      this.caption.textContent = a.dataset.title || "";
      const multi = this.items.length > 1;
      $("#lbPrev").style.display = multi ? "" : "none";
      $("#lbNext").style.display = multi ? "" : "none";
    },
    step(d) { if (this.items.length < 2) return; this.index = (this.index + d + this.items.length) % this.items.length; this.show(); },
    close() { this.box.hidden = true; this.img.src = ""; document.body.style.overflow = ""; if (this.lastFocus) this.lastFocus.focus(); },
    trap(e) {
      const f = $$("button", this.box).filter((b) => b.style.display !== "none");
      if (!f.length) return;
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    },
  };

  /* ---------- Contact form (EmailJS, with mailto fallback) ---------- */
  const ContactForm = {
    SERVICE_ID: "YOUR_EMAILJS_SERVICE_ID",
    TEMPLATE_ID: "YOUR_EMAILJS_TEMPLATE_ID",
    PUBLIC_KEY: "YOUR_EMAILJS_PUBLIC_KEY", // public (browser-safe) key; not a secret
    TO_EMAIL: "Ibrahimkhalid4111@gmail.com", // used by the mailto fallback

    init() {
      this.form = $("#contactForm"); this.status = $("#formStatus"); this.btn = $("#submitBtn");
      if (!this.form) return;
      this.configured = typeof window.emailjs !== "undefined" && this.PUBLIC_KEY !== "YOUR_EMAILJS_PUBLIC_KEY";
      if (this.configured) window.emailjs.init({ publicKey: this.PUBLIC_KEY });
      this.form.addEventListener("submit", (e) => this.submit(e));
    },
    submit(e) {
      e.preventDefault();
      if (!this.form.checkValidity()) { this.form.reportValidity(); return; }
      const f = this.form;
      if (!this.configured) {
        const body = `Name: ${f.name.value}\nEmail: ${f.email.value}\n\n${f.message.value}`;
        window.location.href = `mailto:${this.TO_EMAIL}?subject=${encodeURIComponent(f.subject.value)}&body=${encodeURIComponent(body)}`;
        this.setStatus("Opening your email app with your message ready to send…", "success");
        return;
      }
      const label = this.btn.querySelector(".btn-label");
      const original = label.textContent;
      label.textContent = "Sending…"; this.btn.disabled = true;
      window.emailjs.sendForm(this.SERVICE_ID, this.TEMPLATE_ID, f)
        .then(() => { this.setStatus("Message sent — thank you! I'll get back to you soon.", "success"); f.reset(); })
        .catch(() => this.setStatus("Something went wrong sending your message. Please email me directly.", "error"))
        .finally(() => { label.textContent = original; this.btn.disabled = false; });
    },
    setStatus(msg, type) { this.status.textContent = msg; this.status.className = "form-status " + type; },
  };

  function setFinalStats() { $$(".stat").forEach((s) => { $(".stat-n", s).textContent = s.dataset.target; }); }

  /* =======================================================
     PART B — MOTION (GSAP + ScrollTrigger)
     ======================================================= */
  const esc = (s) => s.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]));

  function splitWords(el) {
    const text = el.textContent.trim().replace(/\s+/g, " ");
    el.innerHTML = `<span class="sr-only">${esc(text)}</span><span aria-hidden="true">` +
      text.split(" ").map((w) => `<span class="w"><span class="wi">${esc(w)}</span></span>`).join(" ") + "</span>";
    return $$(".wi", el);
  }
  function splitChars(el) {
    const text = el.textContent.trim();
    el.innerHTML = [...text].map((c) => `<span class="ch">${esc(c)}</span>`).join("");
    return $$(".ch", el);
  }

  /* ---------- Hero: interactive dot-field canvas ---------- */
  function initField() {
    const cv = $("#heroCanvas"), hero = $("#hero");
    if (!cv || !cv.getContext) return;
    const ctx = cv.getContext("2d");
    const gap = 48, R = 190;
    let w = 0, h = 0, dpr = 1, raf = 0, visible = true;
    const m = { x: -999, y: -999, tx: -999, ty: -999, s: 0, ts: 0 };
    let inkRgb = "242,240,233", accRgb = "213,255,85";
    const readTheme = () => { const light = root.getAttribute("data-theme") === "light"; inkRgb = light ? "16,17,16" : "242,240,233"; accRgb = light ? "75,102,0" : "213,255,85"; };
    readTheme();
    window.addEventListener("themechange", () => { readTheme(); draw(); });

    function size() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = cv.clientWidth; h = cv.clientHeight;
      cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      draw();
    }
    function plus(x, y, r) { ctx.moveTo(x - r, y); ctx.lineTo(x + r, y); ctx.moveTo(x, y - r); ctx.lineTo(x, y + r); }
    function draw() {
      ctx.clearRect(0, 0, w, h);
      const near = [];
      ctx.beginPath();
      for (let x = gap / 2; x < w + gap; x += gap) {
        for (let y = gap / 2; y < h + gap; y += gap) {
          const dx = x - m.x, dy = y - m.y, d2 = dx * dx + dy * dy;
          if (m.s > 0.01 && d2 < R * R) {
            const d = Math.sqrt(d2) || 1, t = (1 - d / R) * m.s;
            near.push(x + (dx / d) * t * 16, y + (dy / d) * t * 16, t);
          } else plus(x, y, 2.5);
        }
      }
      ctx.strokeStyle = `rgba(${inkRgb},.18)`; ctx.lineWidth = 1; ctx.stroke();
      for (let i = 0; i < near.length; i += 3) {
        const t = near[i + 2];
        ctx.beginPath(); plus(near[i], near[i + 1], 2.5 + t * 6);
        ctx.strokeStyle = `rgba(${accRgb},${0.25 + t * 0.75})`; ctx.lineWidth = 1 + t * 0.8; ctx.stroke();
      }
    }
    function tick() {
      m.x += (m.tx - m.x) * 0.14; m.y += (m.ty - m.y) * 0.14; m.s += (m.ts - m.s) * 0.1;
      draw();
      if (visible && (m.ts > 0 || m.s > 0.01)) raf = requestAnimationFrame(tick); else raf = 0;
    }
    const kick = () => { if (!raf && visible) raf = requestAnimationFrame(tick); };

    hero.addEventListener("mousemove", (e) => {
      const r = cv.getBoundingClientRect();
      if (m.s < 0.02) { m.x = e.clientX - r.left; m.y = e.clientY - r.top; }
      m.tx = e.clientX - r.left; m.ty = e.clientY - r.top; m.ts = 1; kick();
    });
    hero.addEventListener("mouseleave", () => { m.ts = 0; kick(); });
    new IntersectionObserver((en) => { visible = en[0].isIntersecting; if (visible) kick(); }, { threshold: 0 }).observe(hero);
    let rt; window.addEventListener("resize", () => { clearTimeout(rt); rt = setTimeout(size, 150); });
    size();
  }

  /* ---------- Magnetic buttons ---------- */
  function initMagnetic() {
    $$("[data-magnetic]").forEach((el) => {
      const xTo = gsap.quickTo(el, "x", { duration: 0.7, ease: "power3" });
      const yTo = gsap.quickTo(el, "y", { duration: 0.7, ease: "power3" });
      el.addEventListener("mousemove", (e) => {
        const r = el.getBoundingClientRect();
        xTo((e.clientX - (r.left + r.width / 2)) * 0.28);
        yTo((e.clientY - (r.top + r.height / 2)) * 0.28);
      });
      el.addEventListener("mouseleave", () => { xTo(0); yTo(0); });
    });
  }

  /* ---------- Hero geometry: mouse parallax + slow ring ---------- */
  function initGeo() {
    const hero = $("#hero");
    const layers = $$(".geo-l").map((g) => ({
      x: gsap.quickTo(g, "x", { duration: 1.2, ease: "power3" }),
      y: gsap.quickTo(g, "y", { duration: 1.2, ease: "power3" }),
      d: parseFloat(g.dataset.depth) || 10,
    }));
    hero.addEventListener("mousemove", (e) => {
      const nx = e.clientX / window.innerWidth - 0.5, ny = e.clientY / window.innerHeight - 0.5;
      layers.forEach((l) => { l.x(-nx * l.d * 1.8); l.y(-ny * l.d * 1.8); });
    });
    hero.addEventListener("mouseleave", () => layers.forEach((l) => { l.x(0); l.y(0); }));
    const spin = gsap.to(".geo-ticks", { rotation: 360, svgOrigin: "300 300", duration: 160, ease: "none", repeat: -1 });
    ScrollTrigger.create({ trigger: hero, start: "top bottom", end: "bottom top", onToggle: (s) => (s.isActive ? spin.play() : spin.pause()) });
  }

  /* ---------- Project hover: subtle image movement ---------- */
  function initProjectHover() {
    $$(".p-media").forEach((media) => {
      const inners = $$(".p-inner", media);
      const q = inners.map((el) => ({
        x: gsap.quickTo(el, "x", { duration: 0.9, ease: "power3" }),
        y: gsap.quickTo(el, "y", { duration: 0.9, ease: "power3" }),
        s: gsap.quickTo(el, "scale", { duration: 1, ease: "power3" }),
      }));
      media.addEventListener("mouseenter", () => q.forEach((o) => o.s(1.07)));
      media.addEventListener("mousemove", (e) => {
        const r = media.getBoundingClientRect();
        const nx = (e.clientX - r.left) / r.width - 0.5, ny = (e.clientY - r.top) / r.height - 0.5;
        q.forEach((o) => { o.x(-nx * 22); o.y(-ny * 16); });
      });
      media.addEventListener("mouseleave", () => q.forEach((o) => { o.x(0); o.y(0); o.s(1); }));
    });
  }

  /* ---------- Main animation setup ---------- */
  function initMotion() {
    gsap.registerPlugin(ScrollTrigger);
    root.classList.add("anim");
    document.body.classList.add("is-loading");

    // split text
    const heroChars = $$("[data-chars]").flatMap(splitChars);
    $(".hero-title").setAttribute("aria-label", "Muhammad Ibrahim Khalid");
    $$("[data-chars]").forEach((el) => el.setAttribute("aria-hidden", "true"));
    $$("[data-split]").forEach((el) => { el._words = splitWords(el); gsap.set(el._words, { yPercent: 115 }); });

    // initial hidden states (behind loader)
    gsap.set(heroChars, { yPercent: 118 });
    gsap.set(".hero-meta > *, .hero [data-fade]", { opacity: 0, y: 22 });
    gsap.set("#nav", { yPercent: -100 });
    gsap.set("#hero .hero-geo", { opacity: 0, scale: 0.88, rotation: -10 });
    gsap.set("#heroCanvas", { opacity: 0 });

    // ---- loader + intro timeline
    const num = $("#ldNum"), bar = $("#ldBar"), loader = $("#loader"), counter = { v: 0 };
    const finish = () => {
      if (loader) loader.remove();
      document.body.classList.remove("is-loading");
      ScrollTrigger.refresh();
    };
    const tl = gsap.timeline({ onComplete: finish });
    tl.to(counter, { v: 100, duration: 1.5, ease: "power2.inOut", onUpdate: () => { num.textContent = String(Math.round(counter.v)).padStart(3, "0"); } }, 0)
      .to(bar, { scaleX: 1, duration: 1.5, ease: "power2.inOut" }, 0)
      .to("#loader .ld-count, #loader .ld-top, #loader .ld-bot", { opacity: 0, y: -24, duration: 0.5, ease: "power2.in", stagger: 0.04 }, 1.55)
      .fromTo(loader, { clipPath: "inset(0% 0% 0% 0%)" }, { clipPath: "inset(0% 0% 100% 0%)", duration: 1.05, ease: "expo.inOut" }, 1.75)
      .to("#nav", { yPercent: 0, duration: 1.1, ease: "expo.out", clearProps: "transform" }, 2.3)
      .to(heroChars, { yPercent: 0, duration: 1.4, ease: "expo.out", stagger: 0.045 }, 2.0)
      .to("#heroCanvas", { opacity: 1, duration: 1.6, ease: "power2.out" }, 2.2)
      .to("#hero .hero-geo", { opacity: 1, scale: 1, rotation: 0, duration: 2, ease: "expo.out" }, 2.1)
      .to(".hero-meta > *, .hero [data-fade]", { opacity: 1, y: 0, duration: 1.1, ease: "expo.out", stagger: 0.09 }, 2.55);
    setTimeout(() => { if (document.getElementById("loader")) { tl.progress(1); } }, 8000); // failsafe

    // ---- scroll reveals
    $$("[data-split]").forEach((el) => {
      gsap.to(el._words, { yPercent: 0, duration: 1.15, ease: "expo.out", stagger: 0.05, scrollTrigger: { trigger: el, start: "top 88%", once: true } });
    });
    $$("[data-reveal], [data-fade]").forEach((el) => {
      if (el.closest(".hero")) return;
      gsap.fromTo(el, { opacity: 0, y: 38 }, { opacity: 1, y: 0, duration: 1.1, ease: "expo.out", clearProps: "transform", scrollTrigger: { trigger: el, start: "top 90%", once: true } });
    });
    $$(".rule").forEach((el) => {
      gsap.fromTo(el, { scaleX: 0 }, { scaleX: 1, duration: 1.5, ease: "expo.inOut", scrollTrigger: { trigger: el, start: "top 94%", once: true } });
    });

    // stat counters
    $$(".stat").forEach((s) => {
      const out = $(".stat-n", s), target = parseInt(s.dataset.target, 10) || 0, o = { v: 0 };
      ScrollTrigger.create({ trigger: s, start: "top 90%", once: true, onEnter: () => gsap.to(o, { v: target, duration: 1.6, ease: "power3.out", onUpdate: () => { out.textContent = Math.round(o.v); } }) });
    });

    // process rail fills as you scroll
    if (window.matchMedia("(min-width: 1001px)").matches) {
      gsap.to("#prFill", { scaleX: 1, ease: "none", scrollTrigger: { trigger: ".pr-steps", start: "top 85%", end: "bottom 60%", scrub: true } });
    } else { gsap.set("#prFill", { scaleX: 1 }); }

    // project media: clip reveal + settle
    $$(".proj .p-media").forEach((media) => {
      const imgs = $$("img", media);
      gsap.fromTo(media, { clipPath: "inset(100% 0% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 1.4, ease: "expo.inOut", clearProps: "clipPath", scrollTrigger: { trigger: media, start: "top 85%", once: true } });
      gsap.from(imgs, { scale: 1.22, duration: 1.8, ease: "expo.out", scrollTrigger: { trigger: media, start: "top 85%", once: true } });
    });
    $$(".ph-strip figure").forEach((f, i) => {
      gsap.fromTo(f, { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 1.2, ease: "expo.out", delay: i * 0.08, clearProps: "transform", scrollTrigger: { trigger: f, start: "top 92%", once: true } });
    });


    // skill chips, services and learning cards: batched stagger
    ScrollTrigger.batch(".chip", { start: "top 94%", once: true,
      onEnter: (b) => gsap.fromTo(b, { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.9, ease: "expo.out", stagger: 0.04, clearProps: "transform,opacity" }) });
    gsap.set(".chip", { opacity: 0, y: 18 });
    // certificate plates: image settles into frame
    $$(".plate-img").forEach((el) => {
      gsap.fromTo(el, { clipPath: "inset(0% 0% 100% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 1.3, ease: "expo.inOut", clearProps: "clipPath", scrollTrigger: { trigger: el, start: "top 90%", once: true } });
    });
    // footer wordmark rises
    const fw = $(".foot-word");
    if (fw) gsap.fromTo(fw, { yPercent: 30, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 1.6, ease: "expo.out", scrollTrigger: { trigger: fw, start: "top 100%", once: true } });

    // ---- desktop-only parallax & hover
    if (fine) {
      initField();
      initMagnetic();
      initGeo();
      initProjectHover();

      // hero exit parallax
      gsap.to(".hero-title", { yPercent: -14, ease: "none", scrollTrigger: { trigger: "#hero", start: "top top", end: "bottom top", scrub: true } });
      gsap.to("#hero .hero-geo", { y: 140, ease: "none", scrollTrigger: { trigger: "#hero", start: "top top", end: "bottom top", scrub: true } });

      // portrait + project image parallax
      gsap.fromTo(".portrait-frame img", { yPercent: -4 }, { yPercent: 4, ease: "none", scrollTrigger: { trigger: ".portrait-frame", start: "top bottom", end: "bottom top", scrub: true } });
      $$(".proj .p-media").forEach((media) => {
        if (media.closest(".p-immuni, .p-liberty")) return; // full-frame screenshots: no overscan, no parallax
        $$("img", media).forEach((img, i) => {
          gsap.fromTo(img, { yPercent: -3 - i }, { yPercent: 3 + i, ease: "none", scrollTrigger: { trigger: media, start: "top bottom", end: "bottom top", scrub: true } });
        });
      });
      $$(".p-num:not(.p-num--sm)").forEach((n) => {
        gsap.fromTo(n, { yPercent: 8 }, { yPercent: -14, ease: "none", scrollTrigger: { trigger: n.parentElement, start: "top bottom", end: "bottom top", scrub: true } });
      });

      // section transition: light slab opens from inset to full width
      const light = $(".sec--light");
      if (light) gsap.fromTo(light, { clipPath: "inset(60px 4vw 0px 4vw)" }, { clipPath: "inset(0px 0vw 0px 0vw)", ease: "none", clearProps: "clipPath", scrollTrigger: { trigger: light, start: "top 95%", end: "top 25%", scrub: true } });
    }
  }

  /* =======================================================
     BOOT
     ======================================================= */
  document.addEventListener("DOMContentLoaded", () => {
    const y = $("#year"); if (y) y.textContent = new Date().getFullYear();
    Theme.init();
    initProgress();
    initAnchorScroll();
    Nav.init();
    OptionalImages.init();
    Lightbox.init();
    ContactForm.init();

    if (animate) {
      try { initMotion(); }
      catch (err) {
        console.error("Motion layer failed, falling back to static layout:", err);
        root.classList.remove("anim");
        const l = $("#loader"); if (l) l.remove();
        document.body.classList.remove("is-loading");
        setFinalStats();
      }
    } else {
      const l = $("#loader"); if (l) l.remove();
      setFinalStats();
    }
  });
})();
