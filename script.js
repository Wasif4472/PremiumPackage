/* ========== THEME TOGGLE ========== */
const THEME_KEY = "bsc-theme";
const root = document.documentElement;
const themeToggle = document.getElementById("theme-toggle");

function getPreferredTheme() {
  try {
    const stored = localStorage.getItem(THEME_KEY);
    if (stored === "light" || stored === "dark") return stored;
  } catch (e) {}
  return "dark";
}

function applyTheme(theme) {
  const isLight = theme === "light";
  if (isLight) {
    root.setAttribute("data-theme", "light");
  } else {
    root.removeAttribute("data-theme");
  }
  if (themeToggle) {
    themeToggle.setAttribute(
      "aria-label",
      isLight ? "Switch to dark mode" : "Switch to light mode"
    );
    themeToggle.setAttribute("aria-pressed", String(isLight));
  }
}

function toggleTheme() {
  const next = root.getAttribute("data-theme") === "light" ? "dark" : "light";
  try {
    localStorage.setItem(THEME_KEY, next);
  } catch (e) {}
  applyTheme(next);
}

applyTheme(getPreferredTheme());
themeToggle?.addEventListener("click", toggleTheme);

/* ========== TYPEWRITER ========== */
const words = ["billing", "revenue", "websites", "rankings", "growth"];
const typeEl = document.getElementById("typewriter");
let wordIndex = 0;
let charIndex = 0;
let deleting = false;

function typeTick() {
  if (!typeEl) return;
  const word = words[wordIndex];
  if (!deleting) {
    typeEl.textContent = word.slice(0, charIndex + 1);
    charIndex++;
    if (charIndex === word.length) {
      deleting = true;
      setTimeout(typeTick, 2200);
      return;
    }
  } else {
    typeEl.textContent = word.slice(0, charIndex - 1);
    charIndex--;
    if (charIndex === 0) {
      deleting = false;
      wordIndex = (wordIndex + 1) % words.length;
    }
  }
  setTimeout(typeTick, deleting ? 45 : 85);
}
typeTick();

/* ========== SCROLL REVEAL ========== */
const revealEls = document.querySelectorAll(".reveal");
const whyGrid = document.querySelector(".why-grid");
const servicesStrip = document.querySelector(".services-strip");
const isCoarsePointer = window.matchMedia("(hover: none), (max-width: 1023px)").matches;

function revealElement(el) {
  if (!el || el.classList.contains("is-visible")) return;
  el.classList.add("is-visible");
  el.querySelectorAll(".reveal-child").forEach((child) => {
    child.classList.add("is-visible");
  });
}

function revealInView() {
  revealEls.forEach((el) => {
    const rect = el.getBoundingClientRect();
    const inView = rect.top < window.innerHeight * 0.92 && rect.bottom > window.innerHeight * 0.08;
    if (inView) revealElement(el);
  });
}

if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        revealElement(entry.target);
        revealObserver.unobserve(entry.target);
      });
    },
    {
      threshold: isCoarsePointer ? 0 : 0.08,
      rootMargin: isCoarsePointer ? "0px 0px 15% 0px" : "0px 0px -40px 0px",
    }
  );

  revealEls.forEach((el) => revealObserver.observe(el));
} else {
  revealEls.forEach((el) => revealElement(el));
}

let revealScrollTicking = false;
window.addEventListener(
  "scroll",
  () => {
    if (revealScrollTicking) return;
    revealScrollTicking = true;
    requestAnimationFrame(() => {
      revealInView();
      revealScrollTicking = false;
    });
  },
  { passive: true }
);

window.addEventListener("hashchange", () => {
  const id = location.hash.slice(1);
  if (id) revealElement(document.getElementById(id));
});

window.addEventListener("load", () => {
  revealInView();
  if (location.hash) {
    revealElement(document.getElementById(location.hash.slice(1)));
  }
  setTimeout(revealInView, 1200);
});

if (whyGrid) {
  const whyObs = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        whyGrid.classList.add("is-visible");
        whyGrid.querySelectorAll(".reveal-child").forEach((c) =>
          c.classList.add("is-visible")
        );
        whyObs.disconnect();
      });
    },
    { threshold: 0.15 }
  );
  whyObs.observe(whyGrid);
}

/* ========== COUNTERS ========== */
const counterObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = parseInt(el.dataset.count, 10);
      const next = el.nextElementSibling;
      const suffix =
        next?.classList.contains("hero-stat__suffix") ||
        next?.classList.contains("stats-banner__suffix") ||
        next?.classList.contains("stats-icon__suffix") ||
        next?.classList.contains("stat-card__suffix")
          ? next
          : null;
      let current = 0;
      const duration = Math.min(1800, Math.max(900, target * 8));
      const start = performance.now();

      const tick = (now) => {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - (1 - progress) ** 3;
        current = Math.round(target * eased);
        el.textContent = current;
        if (progress < 1) {
          requestAnimationFrame(tick);
          return;
        }
        el.textContent = target;
        counterObserver.unobserve(el);
      };
      requestAnimationFrame(tick);
    });
  },
  { threshold: 0.5 }
);

document.querySelectorAll("[data-count]").forEach((el) => counterObserver.observe(el));

const progressRings = document.querySelectorAll(".stat-card__progress[data-progress]");

if (progressRings.length) {
  const progressObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const ring = entry.target;
        const value = parseInt(ring.dataset.progress, 10);
        ring.style.setProperty("--progress", String(value));
        ring.classList.add("is-animated");
        progressObserver.unobserve(ring);
      });
    },
    { threshold: 0.45 }
  );

  progressRings.forEach((ring) => progressObserver.observe(ring));
}

/* ========== MAGNETIC BUTTONS ========== */
if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
  document.querySelectorAll(".btn--magnetic").forEach((btn) => {
    btn.addEventListener("mousemove", (e) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      btn.style.transform = `translate(${x * 0.15}px, ${y * 0.15}px)`;
    });
    btn.addEventListener("mouseleave", () => {
      btn.style.transform = "";
    });
  });
}

/* ========== HEADER SCROLL ========== */
const header = document.querySelector(".header");
const navToggle = document.getElementById("nav-toggle");
const mainNav = document.getElementById("main-nav");
const mainContent = document.querySelector("main");
const marqueeEl = document.querySelector(".marquee");
const navLinks = [...document.querySelectorAll(".nav__link")];

function setNavOpen(open) {
  if (!header) return;
  header.classList.toggle("is-nav-open", open);
  document.body.classList.toggle("is-nav-open", open);
  navToggle?.setAttribute("aria-expanded", String(open));
  navToggle?.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  mainContent?.setAttribute("aria-hidden", open ? "true" : "false");
  marqueeEl?.setAttribute("aria-hidden", open ? "true" : "false");
}

navToggle?.addEventListener("click", () => {
  setNavOpen(!header.classList.contains("is-nav-open"));
});

mainNav?.addEventListener("click", (e) => {
  if (e.target === mainNav) setNavOpen(false);
});

navLinks.forEach((link) => {
  link.addEventListener("click", () => setNavOpen(false));
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && header?.classList.contains("is-nav-open")) {
    setNavOpen(false);
  }
});

window.addEventListener(
  "resize",
  () => {
    if (window.innerWidth >= 1024 && header?.classList.contains("is-nav-open")) {
      setNavOpen(false);
    }
  },
  { passive: true }
);
const navSections = navLinks
  .map((link) => {
    const id = link.dataset.section || link.getAttribute("href")?.slice(1);
    const section = id ? document.getElementById(id) : null;
    return section ? { link, section } : null;
  })
  .filter(Boolean);

function getNavSectionsInPageOrder() {
  return [...navSections].sort((a, b) => {
    const topA = a.section.getBoundingClientRect().top + window.scrollY;
    const topB = b.section.getBoundingClientRect().top + window.scrollY;
    return topA - topB;
  });
}

const scrollIndicator = document.getElementById("scroll-indicator");

function updateHeader() {
  if (header) {
    header.classList.toggle("is-scrolled", window.scrollY > 50);
  }

  if (scrollIndicator) {
    scrollIndicator.classList.toggle("is-hidden", window.scrollY > 120);
  }

  if (document.body.dataset.spa === "true") {
    const currentFile =
      location.pathname.split("/").pop().replace(/\.html$/, "") || "index";
    navLinks.forEach((link) => {
      const linkFile = new URL(link.href).pathname
        .split("/")
        .pop()
        .replace(/\.html$/, "") || "index";
      const active = linkFile === currentFile;
      link.classList.toggle("is-active", active);
      if (active) {
        link.setAttribute("aria-current", "page");
      } else {
        link.removeAttribute("aria-current");
      }
    });
    return;
  }

  if (!navSections.length) return;

  const offset = (header?.offsetHeight ?? 64) + 80;
  const scrollPos = window.scrollY + offset;
  const ordered = getNavSectionsInPageOrder();
  let current = ordered[0].link;

  for (const { link, section } of ordered) {
    const sectionTop = section.getBoundingClientRect().top + window.scrollY;
    if (sectionTop <= scrollPos) {
      current = link;
    }
  }

  navLinks.forEach((link) => {
    link.classList.toggle("is-active", link === current);
  });
}

window.addEventListener("scroll", updateHeader, { passive: true });
window.addEventListener("resize", updateHeader, { passive: true });
window.addEventListener("hashchange", updateHeader);
window.addEventListener("bsc:navigate", updateHeader);
updateHeader();

/* ========== PARALLAX ========== */
if (window.matchMedia("(min-width: 1024px)").matches) {
  const parallaxShapes = document.querySelectorAll(".floating-shapes .shape");
  const diamondGlow = document.querySelector(".gem-floor-glow");
  window.addEventListener(
    "scroll",
    () => {
      const y = window.scrollY;
      parallaxShapes.forEach((el, i) => {
        el.style.translate = `0 ${y * (0.02 + i * 0.015)}px`;
      });
      if (diamondGlow) diamondGlow.style.translate = `0 ${y * 0.04}px`;
    },
    { passive: true }
  );
}

/* ========== PROCESS TIMELINE ========== */
const processCards = document.querySelectorAll(".process-card");
const timelineProgress = document.getElementById("timeline-progress");
const processSection = document.getElementById("process");

if (processSection && processCards.length) {
  const processObs = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        let activeIndex = 0;
        processCards.forEach((card, i) => {
          setTimeout(() => {
            processCards.forEach((c) => c.classList.remove("is-active"));
            card.classList.add("is-active");
            if (timelineProgress) {
              timelineProgress.style.width = `${((i + 1) / processCards.length) * 100}%`;
            }
          }, i * 400);
        });
        processObs.disconnect();
      });
    },
    { threshold: 0.3 }
  );
  processObs.observe(processSection);
}

/* ========== CLASSIC DIAMOND — minimal luxury render ========== */
const canvas = document.getElementById("gem-canvas");
if (canvas) {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const ctx = canvas.getContext("2d");
  let w = 0;
  let h = 0;
  let t = 0;
  let pointerX = 0;
  let pointerY = 0;

  const gemScene = canvas.parentElement;
  if (gemScene && !reducedMotion) {
    gemScene.addEventListener(
      "mousemove",
      (e) => {
        const rect = gemScene.getBoundingClientRect();
        pointerX = (e.clientX - rect.left) / rect.width - 0.5;
        pointerY = (e.clientY - rect.top) / rect.height - 0.5;
      },
      { passive: true }
    );
    gemScene.addEventListener(
      "mouseleave",
      () => {
        pointerX = 0;
        pointerY = 0;
      },
      { passive: true }
    );
  }

  const LIGHT = { x: 0.45, y: 0.85, z: 0.5 };

  function lightAt(time) {
    return {
      x: LIGHT.x + Math.cos(time * 0.28) * 0.18,
      y: LIGHT.y,
      z: LIGHT.z + Math.sin(time * 0.28) * 0.14,
    };
  }

  function facetSpec(normal, light) {
    const len = Math.hypot(light.x, light.y, light.z) || 1;
    const lx = light.x / len;
    const ly = light.y / len;
    const lz = light.z / len;
    const ndotl = Math.max(0, normal.x * lx + normal.y * ly + normal.z * lz);
    return { ndotl };
  }

  function buildRoundBrilliant() {
    const verts = [];
    const facets = [];
    const edges = new Set();
    const n = 32;
    const half = n / 2;

    const addEdge = (a, b) => edges.add(a < b ? `${a}-${b}` : `${b}-${a}`);
    const addFacet = (a, b, c) => {
      facets.push([a, b, c]);
      addEdge(a, b);
      addEdge(b, c);
      addEdge(c, a);
    };

    const ring = (y, r, count, rot = 0) => {
      const start = verts.length;
      for (let i = 0; i < count; i++) {
        const a = (i / count) * Math.PI * 2 + rot;
        verts.push({ x: Math.cos(a) * r, y, z: Math.sin(a) * r });
      }
      return start;
    };

    const culet = verts.length;
    verts.push({ x: 0, y: -0.88, z: 0 });

    const pavBreak = ring(-0.18, 0.68, half, Math.PI / n);
    const girdle = ring(0, 1, n, 0);
    const bezel = ring(0.2, 0.86, half, Math.PI / n);
    const star = ring(0.26, 0.62, half, 0);
    const tableEdge = ring(0.31, 0.54, half, Math.PI / n);
    const table = verts.length;
    verts.push({ x: 0, y: 0.322, z: 0 });

    for (let i = 0; i < half; i++) {
      const gi = i * 2;
      const g1 = girdle + gi;
      const g2 = girdle + ((gi + 2) % n);
      const gMid = girdle + ((gi + 1) % n);
      const p1 = pavBreak + i;
      const p2 = pavBreak + ((i + 1) % half);

      addFacet(culet, g1, p1);
      addFacet(culet, p2, g2);
      addFacet(p1, g1, gMid);
      addFacet(p2, gMid, g2);
      addFacet(p1, p2, gMid);
    }

    for (let i = 0; i < half; i++) {
      const gi = i * 2;
      const g1 = girdle + gi;
      const g2 = girdle + ((gi + 2) % n);
      const gMid = girdle + ((gi + 1) % n);
      const b1 = bezel + i;
      const b2 = bezel + ((i + 1) % half);
      const s1 = star + i;
      const s2 = star + ((i + 1) % half);
      const t1 = tableEdge + i;
      const t2 = tableEdge + ((i + 1) % half);

      addFacet(g1, b1, gMid);
      addFacet(gMid, b1, b2);
      addFacet(gMid, b2, g2);
      addFacet(b1, s1, b2);
      addFacet(b2, s1, s2);
      addFacet(s1, t1, s2);
      addFacet(s2, t1, t2);
      addFacet(table, t1, t2);
    }

    return {
      verts,
      facets,
      edgePairs: [...edges].map((k) => k.split("-").map(Number)),
      tableIdx: table,
    };
  }

  const gem = buildRoundBrilliant();

  function resize() {
    const rect = canvas.parentElement.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = rect.width;
    h = rect.height;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + "px";
    canvas.style.height = h + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function transformVertex(v, rotY, rotX) {
    const cy = Math.cos(rotY);
    const sy = Math.sin(rotY);
    const cx = Math.cos(rotX);
    const sx = Math.sin(rotX);
    const x1 = v.x * cy - v.z * sy;
    const z1 = v.x * sy + v.z * cy;
    const y1 = v.y * cx - z1 * sx;
    const z2 = v.y * sx + z1 * cx;
    return { x: x1, y: y1, z: z2 };
  }

  function facetNormal(va, vb, vc) {
    const ab = { x: vb.x - va.x, y: vb.y - va.y, z: vb.z - va.z };
    const ac = { x: vc.x - va.x, y: vc.y - va.y, z: vc.z - va.z };
    const nx = ab.y * ac.z - ab.z * ac.y;
    const ny = ab.z * ac.x - ab.x * ac.z;
    const nz = ab.x * ac.y - ab.y * ac.x;
    const len = Math.hypot(nx, ny, nz) || 1;
    return { x: nx / len, y: ny / len, z: nz / len };
  }

  function shadeFacet(normal, avgZ, light) {
    const { ndotl } = facetSpec(normal, light);
    const depth = 1 - (avgZ + 1.2) / 2.4;
    const tone = ndotl * 0.55 + depth * 0.45;

    let r = 2 + tone * 24;
    let g = 3 + tone * 25;
    let b = 7 + tone * 34;

    if (ndotl > 0.78) {
      const edge = (ndotl - 0.78) / 0.22;
      r += edge * 55;
      g += edge * 38;
      b += edge * 10;
    }

    return {
      fill: `rgb(${Math.min(200, r) | 0}, ${Math.min(175, g) | 0}, ${Math.min(155, b) | 0})`,
      tone,
      ndotl,
    };
  }

  function fillFacetTriangle(a, b, c, projected, fillStyle) {
    const pa = projected[a];
    const pb = projected[b];
    const pc = projected[c];
    ctx.beginPath();
    ctx.moveTo(pa.x, pa.y);
    ctx.lineTo(pb.x, pb.y);
    ctx.lineTo(pc.x, pc.y);
    ctx.closePath();
    ctx.fillStyle = fillStyle;
    ctx.fill();
  }

  function drawFacets(projected, world, light) {
    const drawList = gem.facets.map(([a, b, c]) => {
      const normal = facetNormal(world[a], world[b], world[c]);
      const avgZ = (projected[a].z + projected[b].z + projected[c].z) / 3;
      const shaded = shadeFacet(normal, avgZ, light);
      return { a, b, c, ...shaded, avgZ };
    });
    drawList.sort((f1, f2) => f1.avgZ - f2.avgZ);

    drawList.forEach(({ a, b, c }) => {
      fillFacetTriangle(a, b, c, projected, "#050608");
    });
    drawList.forEach(({ a, b, c, fill }) => {
      fillFacetTriangle(a, b, c, projected, fill);
    });
    return drawList;
  }

  function drawFloorShadow(cx, floorY, scale) {
    ctx.save();
    ctx.translate(cx, floorY);
    ctx.scale(1, 0.26);
    const shadow = ctx.createRadialGradient(0, 0, 0, 0, 0, scale * 0.82);
    shadow.addColorStop(0, "rgba(0, 0, 0, 0.55)");
    shadow.addColorStop(0.4, "rgba(255, 186, 92, 0.1)");
    shadow.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = shadow;
    ctx.beginPath();
    ctx.arc(0, 0, scale * 0.82, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function drawSilhouette(projected, drawList) {
    const front = gem.facets.filter(([a, b, c]) => {
      const avgZ = (projected[a].z + projected[b].z + projected[c].z) / 3;
      return avgZ < 0.4;
    });
    if (!front.length) return;

    front.forEach(([a, b, c]) => {
      const pa = projected[a];
      const pb = projected[b];
      const pc = projected[c];
      ctx.beginPath();
      ctx.moveTo(pa.x, pa.y);
      ctx.lineTo(pb.x, pb.y);
      ctx.lineTo(pc.x, pc.y);
      ctx.closePath();
      ctx.strokeStyle = "rgba(255, 186, 92, 0.22)";
      ctx.lineWidth = 0.85;
      ctx.stroke();
    });

    drawList.forEach(({ a, b, c, ndotl, avgZ }) => {
      if (ndotl < 0.72 || avgZ > 0.05) return;
      const pa = projected[a];
      const pb = projected[b];
      const pc = projected[c];
      const cx = (pa.x + pb.x + pc.x) / 3;
      const cy = (pa.y + pb.y + pc.y) / 3;
      ctx.fillStyle = "rgba(220, 228, 240, 0.55)";
      ctx.beginPath();
      ctx.arc(cx, cy, 1.4, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  let gemRunning = true;
  const isMobileView = window.matchMedia("(max-width: 767px)").matches;

  function draw() {
    if (!gemRunning) return;

    ctx.clearRect(0, 0, w, h);

    const spin = reducedMotion ? 0.045 : isMobileView ? 0.055 : 0.072;
    const rotY = t * spin + pointerX * 0.32;
    const rotX = 0.2 + pointerY * 0.16 + Math.sin(t * 0.35) * 0.04;
    const scale = Math.min(w, h) * 0.46;
    const offsetY = -h * 0.04;
    const light = lightAt(t);
    const cx = w / 2;
    const cy = h / 2 + offsetY;

    const world = gem.verts.map((v) => transformVertex(v, rotY, rotX));
    const projected = world.map((p) => {
      const persp = 3.5 / (3.5 + p.z);
      return {
        x: cx + p.x * scale * persp,
        y: cy - p.y * scale * persp,
        z: p.z,
      };
    });

    const floorY = Math.max(...projected.map((p) => p.y)) + scale * 0.05;
    drawFloorShadow(cx, floorY, scale);

    const drawList = drawFacets(projected, world, light);
    drawSilhouette(projected, drawList);

    t += reducedMotion ? 0.01 : isMobileView ? 0.012 : 0.016;
    requestAnimationFrame(draw);
  }

  const gemObserver = new IntersectionObserver(
    ([entry]) => {
      gemRunning = entry.isIntersecting;
      if (gemRunning) draw();
    },
    { threshold: 0.08 }
  );
  gemObserver.observe(canvas);

  resize();
  window.addEventListener("resize", resize);
  draw();
}

/* Hero visible on load */
const hero = document.getElementById("home");
if (hero) {
  requestAnimationFrame(() => hero.classList.add("is-visible"));
}

/* ========== CONTACT FORM ========== */
const contactForm = document.getElementById("contact-form");
const CONTACT_EMAIL = "admin@blacksapcorp.com";

/**
 * Automatic inbox delivery (recommended):
 * 1. Go to https://web3forms.com
 * 2. Enter admin@blacksapcorp.com and create a free access key
 * 3. Paste the key below (replace the empty string)
 */
const WEB3FORMS_ACCESS_KEY = "ea1954b8-c6f9-40ce-a3ad-eeb63cfa573d";

function buildMailtoLink({ name, email, phone, company, message, selected }) {
  const subject = encodeURIComponent(
    `Black Sapphire Systems inquiry — ${selected.join(", ")}`
  );
  const body = encodeURIComponent(
    [
      `Name: ${name}`,
      `Email: ${email}`,
      phone ? `Phone: ${phone}` : null,
      company ? `Company: ${company}` : null,
      "",
      "Services:",
      selected.map((s) => `• ${s}`).join("\n"),
      "",
      "Message:",
      message,
    ]
      .filter(Boolean)
      .join("\n")
  );
  return `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
}

if (contactForm) {
  const serviceSelect = document.getElementById("service-select");
  const servicesError = document.getElementById("services-error");
  const formStatus = document.getElementById("form-status");
  const submitBtn = contactForm.querySelector(".contact-form__submit");

  const serviceCheckboxes = () =>
    [...contactForm.querySelectorAll('input[name="services"]')];

  const hasWeb3Forms = WEB3FORMS_ACCESS_KEY.length > 8;

  serviceCheckboxes().forEach((cb) => {
    cb.addEventListener("change", () => {
      const anyChecked = serviceCheckboxes().some((c) => c.checked);
      if (anyChecked && serviceSelect) {
        serviceSelect.classList.remove("is-error");
        if (servicesError) servicesError.hidden = true;
      }
    });
  });

  contactForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (formStatus) {
      formStatus.textContent = "";
      formStatus.className = "contact-form__status";
    }

    const name = contactForm.name.value.trim();
    const email = contactForm.email.value.trim();
    const phone = contactForm.phone.value.trim();
    const company = contactForm.company.value.trim();
    const message = contactForm.message.value.trim();
    const selected = serviceCheckboxes()
      .filter((c) => c.checked)
      .map((c) => c.value);

    if (selected.length === 0) {
      serviceSelect?.classList.add("is-error");
      if (servicesError) servicesError.hidden = false;
      serviceCheckboxes()[0]?.focus();
      if (formStatus) {
        formStatus.textContent = "Please select at least one service.";
        formStatus.className = "contact-form__status is-error";
      }
      return;
    }

    if (!contactForm.checkValidity()) {
      contactForm.reportValidity();
      return;
    }

    const subjectText = `Black Sapphire Systems inquiry — ${selected.join(", ")}`;
    const payload = {
      access_key: WEB3FORMS_ACCESS_KEY,
      subject: subjectText,
      from_name: name,
      name,
      email,
      phone: phone || "Not provided",
      company: company || "Not provided",
      services: selected.join(", "),
      message,
    };

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.querySelector("span").textContent = "Sending…";
    }

    if (hasWeb3Forms) {
      try {
        const res = await fetch("https://api.web3forms.com/submit", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(payload),
        });

        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error("Web3Forms rejected submission");
        }

        contactForm.reset();
        serviceSelect?.classList.remove("is-error");
        if (servicesError) servicesError.hidden = true;
        if (formStatus) {
          formStatus.textContent =
            "Thank you! Your message was sent to " + CONTACT_EMAIL + ".";
          formStatus.className = "contact-form__status is-success";
        }
        return;
      } catch {
        /* fall through to mailto */
      }
    }

    window.location.href = buildMailtoLink({
      name,
      email,
      phone,
      company,
      message,
      selected,
    });

    if (formStatus) {
      formStatus.textContent = hasWeb3Forms
        ? "Your email app is opening with your message. Click Send to deliver it to " +
          CONTACT_EMAIL +
          "."
        : "Your email app is opening (automatic send is not configured yet). Click Send to email " +
          CONTACT_EMAIL +
          ".";
      formStatus.className = "contact-form__status is-success";
    }

    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.querySelector("span").textContent = "Send message";
    }
  });
}

/* ========== TESTIMONIAL SLIDER ========== */
const testimonialTrack = document.getElementById("testimonial-track");
const testimonialNext = document.getElementById("testimonial-next");

if (testimonialTrack) {
  const getScrollStep = () => {
    const card = testimonialTrack.querySelector(".testimonial-card");
    if (!card) return 320;
    const gap = parseFloat(getComputedStyle(testimonialTrack).gap) || 20;
    return card.offsetWidth + gap;
  };

  const updateTestimonialNav = () => {
    if (!testimonialNext) return;
    const atEnd =
      testimonialTrack.scrollLeft + testimonialTrack.clientWidth >=
      testimonialTrack.scrollWidth - 8;
    testimonialNext.classList.toggle("is-hidden", atEnd);
  };

  testimonialNext?.addEventListener("click", () => {
    testimonialTrack.scrollBy({ left: getScrollStep(), behavior: "smooth" });
  });

  testimonialTrack.addEventListener("scroll", updateTestimonialNav, { passive: true });
  window.addEventListener("resize", updateTestimonialNav);
  updateTestimonialNav();

  let isDragging = false;
  let startX = 0;
  let scrollStart = 0;

  testimonialTrack.addEventListener("pointerdown", (e) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    isDragging = true;
    startX = e.clientX;
    scrollStart = testimonialTrack.scrollLeft;
    testimonialTrack.classList.add("is-dragging");
    testimonialTrack.setPointerCapture(e.pointerId);
  });

  testimonialTrack.addEventListener("pointermove", (e) => {
    if (!isDragging) return;
    testimonialTrack.scrollLeft = scrollStart - (e.clientX - startX);
  });

  const endDrag = (e) => {
    if (!isDragging) return;
    isDragging = false;
    testimonialTrack.classList.remove("is-dragging");
    if (e.pointerId !== undefined) {
      testimonialTrack.releasePointerCapture(e.pointerId);
    }
  };

  testimonialTrack.addEventListener("pointerup", endDrag);
  testimonialTrack.addEventListener("pointercancel", endDrag);
}
