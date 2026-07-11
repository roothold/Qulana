/* ══════════════════════════════════════════════
   QULANA — Bold Flow interactions
   ══════════════════════════════════════════════ */

(function () {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const body = document.body;

  /* ─────── 1. The Unveiling ─────── */
  const loader = document.getElementById("loader");
  const nav = document.getElementById("nav");

  function unveil() {
    loader.classList.add("is-done");
    body.classList.add("is-revealed");
    setTimeout(() => nav.classList.add("is-visible"), 650);
    setTimeout(() => {
      loader.remove();
      body.classList.remove("is-locked");
    }, 1500);
  }

  if (reduceMotion) {
    loader.remove();
    body.classList.add("is-revealed");
    nav.classList.add("is-visible");
  } else {
    body.classList.add("is-locked");
    // Let the ink flow, the words rise, then lift the curtain.
    const start = performance.now();
    window.addEventListener("load", () => {
      const elapsed = performance.now() - start;
      const wait = Math.max(2900 - elapsed, 400);
      setTimeout(unveil, wait);
    });
    // Safety: never trap the visitor.
    setTimeout(() => { if (document.getElementById("loader")) unveil(); }, 6000);
  }


  /* Announcement banner */
  const banner = document.getElementById("topbanner");
  const bannerClose = document.getElementById("bannerclose");
  if (banner && bannerClose) {
    bannerClose.addEventListener("click", () => {
      banner.style.transition = "transform 0.5s cubic-bezier(0.65,0,0.35,1), opacity 0.4s";
      banner.style.transform = "translateY(-100%)";
      banner.style.opacity = "0";
      body.classList.remove("has-banner");
      setTimeout(() => banner.remove(), 500);
    });
  }

  /* ─────── 2. Nav state ─────── */
  let lastY = 0;
  window.addEventListener("scroll", () => {
    const y = window.scrollY;
    nav.classList.toggle("is-scrolled", y > 40);
    lastY = y;
  }, { passive: true });

  /* Mobile menu */
  const burger = document.getElementById("burger");
  const menu = document.getElementById("mobilemenu");
  burger.addEventListener("click", () => {
    const open = menu.classList.toggle("is-open");
    burger.classList.toggle("is-open", open);
    burger.setAttribute("aria-expanded", open);
    body.classList.toggle("is-locked", open);
  });
  menu.querySelectorAll("a").forEach(a =>
    a.addEventListener("click", () => {
      menu.classList.remove("is-open");
      burger.classList.remove("is-open");
      body.classList.remove("is-locked");
    })
  );

  /* ─────── 3. Scroll reveals ─────── */
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      // Reveal when entering the viewport — or if already scrolled past.
      if (e.isIntersecting || e.boundingClientRect.top < 0) {
        e.target.classList.add("is-in");
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.18, rootMargin: "0px 0px -6% 0px" });

  document.querySelectorAll(".reveal, .reveal-lines, .mline, .mfade, .manifesto__flowline")
    .forEach(el => io.observe(el));

  /* Storylines light up as they cross the middle of the screen */
  const storyIO = new IntersectionObserver(entries => {
    entries.forEach(e => e.target.classList.toggle("is-lit", e.isIntersecting));
  }, { rootMargin: "-32% 0px -32% 0px" });
  document.querySelectorAll(".storyline").forEach(el => storyIO.observe(el));

  /* ─────── 4. Parallax ─────── */
  const plxEls = [...document.querySelectorAll("[data-parallax]")];
  if (!reduceMotion && plxEls.length) {
    let ticking = false;
    function parallax() {
      const vh = window.innerHeight;
      plxEls.forEach(el => {
        const r = el.getBoundingClientRect();
        if (r.bottom < -100 || r.top > vh + 100) return;
        const speed = parseFloat(el.dataset.parallax);
        const offset = (r.top + r.height / 2 - vh / 2) * speed;
        el.style.transform = `translateY(${offset.toFixed(1)}px)`;
      });
      ticking = false;
    }
    window.addEventListener("scroll", () => {
      if (!ticking) { requestAnimationFrame(parallax); ticking = true; }
    }, { passive: true });
    parallax();
  }

  /* ─────── 5. The flow thread ───────
     One continuous line — like the logo — drawn down
     the whole page as the visitor scrolls. */
  const thread = document.getElementById("flowthread");
  let threadPath = null, threadLen = 0;

  function buildThread() {
    if (window.innerWidth <= 720) return;
    const H = document.documentElement.scrollHeight;
    const W = window.innerWidth;
    thread.setAttribute("viewBox", `0 0 ${W} ${H}`);
    thread.style.height = H + "px";
    const cx = W / 2, amp = Math.min(W * 0.36, 560);
    let d = `M ${W * 0.72} 0`;
    const steps = Math.ceil(H / 900);
    for (let i = 1; i <= steps; i++) {
      const y = (H / steps) * i;
      const x = cx + (i % 2 === 0 ? 1 : -1) * amp * (0.55 + 0.45 * Math.sin(i * 1.7));
      const py = (H / steps) * (i - 0.5);
      d += ` Q ${cx + (i % 2 === 0 ? -1 : 1) * amp} ${py} ${x} ${y}`;
    }
    thread.innerHTML = `<path d="${d}"/>`;
    threadPath = thread.querySelector("path");
    threadLen = threadPath.getTotalLength();
    threadPath.style.strokeDasharray = threadLen;
    drawThread();
  }

  function drawThread() {
    if (!threadPath) return;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const p = max > 0 ? Math.min(window.scrollY / max, 1) : 0;
    threadPath.style.strokeDashoffset = threadLen * (1 - p * 1.08);
  }

  if (!reduceMotion) {
    window.addEventListener("load", buildThread);
    window.addEventListener("resize", debounce(buildThread, 300));
    window.addEventListener("scroll", drawThread, { passive: true });
  }

  function debounce(fn, ms) {
    let t;
    return () => { clearTimeout(t); t = setTimeout(fn, ms); };
  }

  /* ─────── 6. Framework hover previews ─────── */
  const preview = document.getElementById("flowpreview");
  const previewImg = preview.querySelector("img");
  const rows = document.querySelectorAll(".flowrow");
  let px = 0, py = 0, tx = 0, ty = 0, rafOn = false;

  function lerpLoop() {
    px += (tx - px) * 0.12;
    py += (ty - py) * 0.12;
    preview.style.left = px + "px";
    preview.style.top = py + "px";
    if (Math.abs(tx - px) > 0.4 || Math.abs(ty - py) > 0.4 || preview.classList.contains("is-on")) {
      requestAnimationFrame(lerpLoop);
    } else {
      rafOn = false;
    }
  }

  rows.forEach(row => {
    row.addEventListener("mouseenter", () => {
      previewImg.src = row.dataset.img;
      preview.classList.add("is-on");
      if (!rafOn) { rafOn = true; requestAnimationFrame(lerpLoop); }
    });
    row.addEventListener("mousemove", e => {
      tx = Math.min(e.clientX + 36, window.innerWidth - 300);
      ty = Math.max(Math.min(e.clientY - 170, window.innerHeight - 380), 12);
    });
    row.addEventListener("mouseleave", () => preview.classList.remove("is-on"));
  });

  /* ─────── 7. Waitlist form ─────── */
  const form = document.getElementById("waitform");
  const done = document.getElementById("waitdone");

  form.addEventListener("submit", async e => {
    e.preventDefault();
    const btn = form.querySelector("button");
    const email = form.email.value.trim();
    if (!email) return;

    const action = form.getAttribute("action");
    if (action.includes("FORMSPREE_ID")) {
      // Form backend not configured yet — fall back to a pre-filled email.
      window.location.href =
        "mailto:michael@surpluspods.com?subject=Qulana%20Waitlist&body=Please%20add%20me%20to%20the%20Qulana%20waitlist:%20" +
        encodeURIComponent(email);
      return;
    }

    btn.disabled = true;
    btn.textContent = "Joining…";
    try {
      const res = await fetch(action, {
        method: "POST",
        headers: { "Accept": "application/json" },
        body: new FormData(form)
      });
      if (res.ok) {
        form.hidden = true;
        done.hidden = false;
      } else {
        throw new Error();
      }
    } catch {
      btn.disabled = false;
      btn.textContent = "Join the waitlist";
      alert("Something interrupted the flow — please try again.");
    }
  });

  /* ─────── 8. Water & flow ─────── */

  /* Buttery scrolling */
  if (window.Lenis && !reduceMotion) {
    const lenis = new Lenis({ lerp: 0.09 });
    function raf(t) { lenis.raf(t); requestAnimationFrame(raf); }
    requestAnimationFrame(raf);
    document.querySelectorAll('a[href^="#"]').forEach(a => {
      a.addEventListener("click", e => {
        const target = document.querySelector(a.getAttribute("href"));
        if (target) { e.preventDefault(); lenis.scrollTo(target, { offset: -60, duration: 1.4 }); }
      });
    });
  }

  /* Drifting petals in the hero */
  const petalBox = document.getElementById("petals");
  if (petalBox && !reduceMotion) {
    const COUNT = 9;
    for (let i = 0; i < COUNT; i++) {
      const p = document.createElement("span");
      p.className = "petal";
      p.style.setProperty("--x", (4 + Math.random() * 92) + "%");
      p.style.setProperty("--size", (9 + Math.random() * 15) + "px");
      p.style.setProperty("--sway", (30 + Math.random() * 70) + "px");
      p.style.setProperty("--dur", (11 + Math.random() * 12) + "s");
      p.style.setProperty("--delay", (-Math.random() * 20) + "s");
      p.style.setProperty("--op", (0.35 + Math.random() * 0.35).toFixed(2));
      petalBox.appendChild(p);
    }
    new IntersectionObserver(es => {
      es.forEach(e => {
        petalBox.style.display = e.isIntersecting ? "" : "none";
      });
    }).observe(petalBox.parentElement);
  }

  /* Water ripples on click */
  if (!reduceMotion) {
    document.addEventListener("pointerdown", e => {
      if (e.pointerType === "mouse" && e.button !== 0) return;
      for (const cls of ["ripple", "ripple ripple--late"]) {
        const r = document.createElement("span");
        r.className = cls;
        r.style.left = e.clientX + "px";
        r.style.top = e.clientY + "px";
        document.body.appendChild(r);
        setTimeout(() => r.remove(), 1500);
      }
    }, { passive: true });
  }
})();
