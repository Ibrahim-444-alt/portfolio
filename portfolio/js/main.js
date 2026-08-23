/* =========================================================
   MUHAMMAD IBRAHIM KHALID — PORTFOLIO
   Modular vanilla JS
   ========================================================= */
(function () {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------------------------------------------------------
     1. LOADER
  --------------------------------------------------------- */
  const Loader = {
    init() {
      const loader = document.getElementById("loader");
      const bar = document.querySelector(".loader-bar span");
      const percentEl = document.querySelector(".loader-percent");
      const lines = document.querySelectorAll(".loader-line");

      lines.forEach((line, i) => {
        const text = line.getAttribute("data-text") || "";
        let idx = 0;
        setTimeout(() => {
          const typeInterval = setInterval(() => {
            line.textContent = "> " + text.slice(0, idx) + (idx < text.length ? "_" : "");
            idx++;
            if (idx > text.length) clearInterval(typeInterval);
          }, 18);
        }, i * 500);
      });

      let progress = 0;
      const finish = () => {
        loader && loader.classList.add("loaded");
        document.body.style.overflow = "";
      };

      if (reduceMotion) {
        finish();
        return;
      }

      const interval = setInterval(() => {
        progress += Math.random() * 18;
        if (progress >= 100) {
          progress = 100;
          clearInterval(interval);
          setTimeout(finish, 350);
        }
        if (bar) bar.style.width = progress + "%";
        if (percentEl) percentEl.textContent = Math.floor(progress) + "%";
      }, 180);

      // Safety net: never block the page longer than 4s
      setTimeout(finish, 4000);
    },
  };

  /* ---------------------------------------------------------
     2. THEME TOGGLE (dark / light, persisted)
  --------------------------------------------------------- */
  const Theme = {
    key: "mik-theme",
    init() {
      const saved = localStorage.getItem(this.key);
      const prefersLight = window.matchMedia("(prefers-color-scheme: light)").matches;
      const initial = saved || (prefersLight ? "light" : "dark");
      document.documentElement.setAttribute("data-theme", initial);

      const btn = document.getElementById("themeToggle");
      btn && btn.addEventListener("click", () => this.toggle());
    },
    toggle() {
      const html = document.documentElement;
      const current = html.getAttribute("data-theme");
      const next = current === "light" ? "dark" : "light";
      html.setAttribute("data-theme", next);
      localStorage.setItem(this.key, next);
    },
  };

  /* ---------------------------------------------------------
     3. NAVIGATION (sticky, mobile menu, active link, smooth scroll)
  --------------------------------------------------------- */
  const Nav = {
    init() {
      this.header = document.getElementById("siteHeader");
      this.toggle = document.getElementById("navToggle");
      this.menu = document.getElementById("navMenu");
      this.links = document.querySelectorAll(".nav-link");
      this.sections = document.querySelectorAll("main section[id]");

      this.bindScroll();
      this.bindToggle();
      this.bindLinkClicks();
      this.observeSections();
    },
    bindScroll() {
      const onScroll = () => {
        if (window.scrollY > 40) this.header.classList.add("scrolled");
        else this.header.classList.remove("scrolled");
      };
      window.addEventListener("scroll", onScroll, { passive: true });
      onScroll();
    },
    bindToggle() {
      this.toggle.addEventListener("click", () => {
        const isOpen = this.menu.classList.toggle("open");
        this.toggle.classList.toggle("open", isOpen);
        this.toggle.setAttribute("aria-expanded", isOpen);
      });
    },
    bindLinkClicks() {
      this.links.forEach((link) => {
        link.addEventListener("click", () => {
          this.menu.classList.remove("open");
          this.toggle.classList.remove("open");
          this.toggle.setAttribute("aria-expanded", "false");
        });
      });
    },
    observeSections() {
      if (!("IntersectionObserver" in window)) return;
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const id = entry.target.getAttribute("id");
              this.links.forEach((l) => l.classList.remove("active-link"));
              const active = document.querySelector(`.nav-link[href="#${id}"]`);
              active && active.classList.add("active-link");
            }
          });
        },
        { rootMargin: "-45% 0px -50% 0px" }
      );
      this.sections.forEach((s) => observer.observe(s));
    },
  };

  /* ---------------------------------------------------------
     4. CUSTOM CURSOR
  --------------------------------------------------------- */
  const Cursor = {
    init() {
      if (window.matchMedia("(max-width: 900px), (hover: none)").matches) return;
      this.dot = document.getElementById("cursorDot");
      this.glow = document.getElementById("cursorGlow");
      if (!this.dot || !this.glow) return;

      let gx = 0, gy = 0, tx = 0, ty = 0;

      window.addEventListener("mousemove", (e) => {
        this.dot.style.left = e.clientX + "px";
        this.dot.style.top = e.clientY + "px";
        tx = e.clientX;
        ty = e.clientY;
      });

      const animate = () => {
        gx += (tx - gx) * 0.16;
        gy += (ty - gy) * 0.16;
        this.glow.style.left = gx + "px";
        this.glow.style.top = gy + "px";
        requestAnimationFrame(animate);
      };
      animate();

      const interactive = "a, button, .skill-card, .service-card, .project-card, input, textarea, [data-tilt], .carousel-arrow, .skills-arrow, .cert-thumb";
      document.addEventListener("mouseover", (e) => {
        if (e.target.closest(interactive)) this.glow.classList.add("active");
      });
      document.addEventListener("mouseout", (e) => {
        if (e.target.closest(interactive)) this.glow.classList.remove("active");
      });
    },
  };

  /* ---------------------------------------------------------
     5. SCROLL PROGRESS BAR
  --------------------------------------------------------- */
  const ScrollProgress = {
    init() {
      this.bar = document.getElementById("scrollProgressBar");
      window.addEventListener("scroll", () => this.update(), { passive: true });
      this.update();
    },
    update() {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      if (this.bar) this.bar.style.width = pct + "%";
    },
  };

  /* ---------------------------------------------------------
     6. BACK TO TOP
  --------------------------------------------------------- */
  const BackToTop = {
    init() {
      this.btn = document.getElementById("backToTop");
      window.addEventListener(
        "scroll",
        () => {
          if (window.scrollY > 600) this.btn.classList.add("visible");
          else this.btn.classList.remove("visible");
        },
        { passive: true }
      );
    },
  };

  /* ---------------------------------------------------------
     7. TYPED.JS — hero role
  --------------------------------------------------------- */
  const TypedRole = {
    init() {
      const el = document.getElementById("typed-role");
      if (!el || typeof Typed === "undefined") return;
      new Typed("#typed-role", {
        strings: [
          "Full Stack Software Engineer",
          "ASP.NET MVC Developer",
          "PHP Developer",
          "MERN Stack Developer",
          "Website Designer",
        ],
        typeSpeed: 45,
        backSpeed: 28,
        backDelay: 1400,
        loop: true,
        showCursor: false,
      });
    },
  };

  /* ---------------------------------------------------------
     8. PARTICLES.JS — hero background
  --------------------------------------------------------- */
  const Particles = {
    init() {
      const el = document.getElementById("particles-js");
      if (!el || typeof particlesJS === "undefined" || reduceMotion) return;
      particlesJS("particles-js", {
        particles: {
          number: { value: 55, density: { enable: true, value_area: 900 } },
          color: { value: ["#7C3AED", "#3B82F6", "#10B981"] },
          shape: { type: "circle" },
          opacity: { value: 0.4, random: true },
          size: { value: 2.4, random: true },
          line_linked: {
            enable: true,
            distance: 140,
            color: "#7C3AED",
            opacity: 0.18,
            width: 1,
          },
          move: { enable: true, speed: 0.8, out_mode: "out" },
        },
        interactivity: {
          detect_on: "canvas",
          events: {
            onhover: { enable: true, mode: "grab" },
            onclick: { enable: false },
            resize: true,
          },
          modes: { grab: { distance: 140, line_linked: { opacity: 0.4 } } },
        },
        retina_detect: true,
      });
    },
  };

  /* ---------------------------------------------------------
     9. VANILLA TILT
  --------------------------------------------------------- */
  const Tilt = {
    init() {
      if (typeof VanillaTilt === "undefined" || reduceMotion) return;
      const els = document.querySelectorAll("[data-tilt]");
      VanillaTilt.init(els, { speed: 400, max: 8, glare: false, scale: 1.02 });
    },
  };

  /* ---------------------------------------------------------
     10. ANIMATED STATISTICS (count up on view)
  --------------------------------------------------------- */
  const Counters = {
    init() {
      const cards = document.querySelectorAll(".stat-card");
      if (!cards.length || !("IntersectionObserver" in window)) return;

      const observer = new IntersectionObserver(
        (entries, obs) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            this.animate(entry.target);
            obs.unobserve(entry.target);
          });
        },
        { threshold: 0.4 }
      );
      cards.forEach((c) => observer.observe(c));
    },
    animate(card) {
      const target = parseInt(card.getAttribute("data-target"), 10) || 0;
      const numEl = card.querySelector(".stat-number");
      if (!numEl) return;
      const duration = 1400;
      const start = performance.now();

      const step = (now) => {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        numEl.textContent = Math.floor(eased * target);
        if (progress < 1) requestAnimationFrame(step);
        else numEl.textContent = target;
      };
      requestAnimationFrame(step);
    },
  };

  /* ---------------------------------------------------------
     11. SKILLS FILTER + CAROUSEL ARROWS
  --------------------------------------------------------- */
  const SkillsFilter = {
    init() {
      this.tabs = document.querySelectorAll(".skill-tab");
      this.cards = document.querySelectorAll(".skill-card");
      this.track = document.getElementById("skillsGrid");
      this.prevBtn = document.getElementById("skillsPrev");
      this.nextBtn = document.getElementById("skillsNext");

      this.tabs.forEach((tab) =>
        tab.addEventListener("click", () => this.filter(tab))
      );

      if (this.track && this.prevBtn && this.nextBtn) {
        this.prevBtn.addEventListener("click", () => this.scroll(-1));
        this.nextBtn.addEventListener("click", () => this.scroll(1));
      }
    },
    filter(tab) {
      this.tabs.forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");
      const value = tab.getAttribute("data-filter");
      this.cards.forEach((card) => {
        const cats = card.getAttribute("data-category") || "";
        const show = value === "all" || cats.split(" ").includes(value);
        card.classList.toggle("hide", !show);
      });
      if (this.track) this.track.scrollTo({ left: 0, behavior: "smooth" });
    },
    scroll(direction) {
      if (!this.track) return;
      const amount = 220 * direction;
      this.track.scrollBy({ left: amount, behavior: "smooth" });
    },
  };

  /* ---------------------------------------------------------
     12. PROJECT FILTER
  --------------------------------------------------------- */
  const ProjectFilter = {
    init() {
      this.buttons = document.querySelectorAll(".proj-filter");
      this.cards = document.querySelectorAll(".project-card");
      this.buttons.forEach((btn) =>
        btn.addEventListener("click", () => this.filter(btn))
      );
    },
    filter(btn) {
      this.buttons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      const value = btn.getAttribute("data-filter");
      this.cards.forEach((card) => {
        const cat = card.getAttribute("data-category");
        const show = value === "all" || cat === value;
        card.classList.toggle("hide", !show);
      });
    },
  };

  /* ---------------------------------------------------------
     12b. IMAGE CAROUSEL (project galleries with multiple shots)
  --------------------------------------------------------- */
  const ImageCarousel = {
    init() {
      document.querySelectorAll("[data-carousel]").forEach((el) => this.setup(el));
    },
    setup(el) {
      const track = el.querySelector(".carousel-track");
      const dotsWrap = el.querySelector(".carousel-dots");
      const prevBtn = el.querySelector(".carousel-prev");
      const nextBtn = el.querySelector(".carousel-next");
      if (!track) return;

      const slides = Array.from(track.children);
      let index = 0;

      const dots = slides.map((_, i) => {
        if (!dotsWrap) return null;
        const dot = document.createElement("button");
        dot.type = "button";
        dot.className = "carousel-dot" + (i === 0 ? " active" : "");
        dot.setAttribute("aria-label", `Go to image ${i + 1}`);
        dot.addEventListener("click", (e) => {
          e.preventDefault();
          e.stopPropagation();
          go(i);
        });
        dotsWrap.appendChild(dot);
        return dot;
      });

      function go(i) {
        index = (i + slides.length) % slides.length;
        track.style.transform = `translateX(-${index * 100}%)`;
        dots.forEach((d, di) => d && d.classList.toggle("active", di === index));
      }

      prevBtn &&
        prevBtn.addEventListener("click", (e) => {
          e.preventDefault();
          e.stopPropagation();
          go(index - 1);
        });
      nextBtn &&
        nextBtn.addEventListener("click", (e) => {
          e.preventDefault();
          e.stopPropagation();
          go(index + 1);
        });
    },
  };

  /* ---------------------------------------------------------
     13. CONTACT FORM (EmailJS)
     NOTE: Replace the placeholder IDs below with real EmailJS
     Service ID, Template ID, and Public Key before going live.
  --------------------------------------------------------- */
  const ContactForm = {
    SERVICE_ID: "YOUR_EMAILJS_SERVICE_ID",
    TEMPLATE_ID: "YOUR_EMAILJS_TEMPLATE_ID",
    PUBLIC_KEY: "YOUR_EMAILJS_PUBLIC_KEY",

    init() {
      this.form = document.getElementById("contactForm");
      this.status = document.getElementById("formStatus");
      this.btn = document.getElementById("submitBtn");
      if (!this.form) return;

      if (typeof emailjs !== "undefined" && this.PUBLIC_KEY !== "YOUR_EMAILJS_PUBLIC_KEY") {
        emailjs.init({ publicKey: this.PUBLIC_KEY });
      }

      this.form.addEventListener("submit", (e) => this.handleSubmit(e));
    },
    handleSubmit(e) {
      e.preventDefault();

      if (typeof emailjs === "undefined" || this.PUBLIC_KEY === "YOUR_EMAILJS_PUBLIC_KEY") {
        this.setStatus(
          "Email service isn't configured yet — add your EmailJS keys in js/main.js. Meanwhile, feel free to email me directly.",
          "error"
        );
        return;
      }

      const originalLabel = this.btn.querySelector(".btn-label").textContent;
      this.btn.querySelector(".btn-label").textContent = "Sending...";
      this.btn.disabled = true;

      emailjs
        .sendForm(this.SERVICE_ID, this.TEMPLATE_ID, this.form)
        .then(() => {
          this.setStatus("Message sent — thank you! I'll get back to you soon.", "success");
          this.form.reset();
        })
        .catch(() => {
          this.setStatus("Something went wrong sending your message. Please try emailing me directly.", "error");
        })
        .finally(() => {
          this.btn.querySelector(".btn-label").textContent = originalLabel;
          this.btn.disabled = false;
        });
    },
    setStatus(message, type) {
      if (!this.status) return;
      this.status.textContent = message;
      this.status.className = "form-status " + type;
    },
  };

  /* ---------------------------------------------------------
     14. GSAP SCROLL REVEALS (subtle, orchestrated)
  --------------------------------------------------------- */
  const GsapReveals = {
    init() {
      if (typeof gsap === "undefined" || reduceMotion) return;
      gsap.registerPlugin(ScrollTrigger);

      gsap.utils.toArray(".section-heading").forEach((el) => {
        gsap.from(el, {
          y: 24,
          opacity: 0,
          duration: 0.9,
          ease: "power3.out",
          scrollTrigger: { trigger: el, start: "top 85%" },
        });
      });
    },
  };

  /* ---------------------------------------------------------
     15. MISC (year, AOS init)
  --------------------------------------------------------- */
  function initMisc() {
    const yearEl = document.getElementById("year");
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    if (typeof AOS !== "undefined") {
      AOS.init({
        duration: 800,
        once: true,
        offset: 60,
        disable: reduceMotion,
      });
    }
  }

  /* ---------------------------------------------------------
     BOOTSTRAP EVERYTHING
  --------------------------------------------------------- */
  document.addEventListener("DOMContentLoaded", () => {
    document.body.style.overflow = "hidden";
    Loader.init();
    Theme.init();
    Nav.init();
    Cursor.init();
    ScrollProgress.init();
    BackToTop.init();
    TypedRole.init();
    Particles.init();
    Tilt.init();
    Counters.init();
    SkillsFilter.init();
    ProjectFilter.init();
    ImageCarousel.init();
    ContactForm.init();
    GsapReveals.init();
    initMisc();
  });
})();
