const pages = {
  home: {
    title: "Black Sapphire Systems | Medical Billing, Web Development & SEO",
    file: "index.html",
  },
  services: {
    title: "Services | Black Sapphire Systems",
    file: "services.html",
    section: ".services-wrap",
  },
  "past-work": {
    title: "Past Work | Black Sapphire Systems",
    file: "past-work.html",
    section: "#past-work",
  },
  projects: {
    title: "Current Projects | Black Sapphire Systems",
    file: "projects.html",
    section: "#current-projects",
  },
  "why-us": {
    title: "Why Us | Black Sapphire Systems",
    file: "why-us.html",
    section: "#why-us",
  },
  process: {
    title: "Our Process | Black Sapphire Systems",
    file: "process.html",
    section: "#process",
  },
  feedback: {
    title: "Client Feedback | Black Sapphire Systems",
    file: "feedback.html",
    section: "#clients",
  },
  contact: {
    title: "Contact | Black Sapphire Systems",
    file: "contact.html",
    section: "#contact",
  },
};

const pageByFile = new Map(
  Object.entries(pages).map(([name, page]) => [page.file, name])
);
const originalPage = document.body.dataset.page;
const site = document.getElementById("site-content");
let main = document.querySelector("main");
let sourceDocument;

function showLoadError(error) {
  console.error("Could not load this page.", error);
  if (site) {
    const message = document.createElement("p");
    message.className = "section__lead";
    message.textContent =
      "This page could not be loaded. Please check your connection and try again.";
    site.replaceChildren(message);
  }
}

async function loadSourceDocument() {
  if (sourceDocument) return sourceDocument;
  const response = await fetch("index.html");
  if (!response.ok) {
    throw new Error(`Could not load the site content (${response.status}).`);
  }
  sourceDocument = new DOMParser().parseFromString(
    await response.text(),
    "text/html"
  );
  return sourceDocument;
}

function currentPageFromLocation() {
  const file = location.pathname.split("/").pop() || "index.html";
  const slug = file.replace(/\.html$/, "");
  return pageByFile.get(file) || (pages[slug] ? slug : "home");
}

function pageFromHref(href) {
  if (href === "#") return "home";

  const url = new URL(href, location.href);
  if (url.origin !== location.origin) return null;

  if (url.hash) {
    const navLink = [...document.querySelectorAll(".nav__link")].find(
      (link) => link.dataset.section === url.hash.slice(1)
    );
    if (navLink) {
      return pageByFile.get(new URL(navLink.href).pathname.split("/").pop()) || null;
    }

    const page = Object.entries(pages).find(
      ([, config]) => config.section === `#${url.hash.slice(1)}`
    );
    if (page) return page[0];
    if (url.hash === "#") return "home";
  }

  return pageByFile.get(url.pathname.split("/").pop()) || null;
}

async function renderSharedLayout() {
  const source = await loadSourceDocument();
  const background = source.querySelector(".page-bg");
  const header = source.querySelector(".header");
  const nav = source.querySelector("#main-nav");
  const marquee = source.querySelector(".marquee");
  const sourceMain = source.querySelector("main");
  const footer = source.querySelector(".footer");
  if (!background || !header || !nav || !marquee || !sourceMain || !footer) {
    throw new Error("The shared site layout is incomplete.");
  }

  main = sourceMain.cloneNode(true);
  site.replaceChildren(
    background.cloneNode(true),
    header.cloneNode(true),
    nav.cloneNode(true),
    marquee.cloneNode(true),
    main,
    footer.cloneNode(true)
  );
  site.querySelector(".header .logo").href = "index.html";
  site.querySelector(".btn--header-cta").href = "contact.html";
  site.querySelector(".logo--footer").href = "index.html";

  const siteScript = document.createElement("script");
  siteScript.src = "script.js";
  site.append(siteScript);
}

function setNavigationOpen(open) {
  const header = document.querySelector(".header");
  const toggle = document.getElementById("nav-toggle");
  header?.classList.toggle("is-nav-open", open);
  document.body.classList.toggle("is-nav-open", open);
  toggle?.setAttribute("aria-expanded", String(open));
  toggle?.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  main?.setAttribute("aria-hidden", open ? "true" : "false");
}

function showPage(name) {
  const page = pages[name];
  if (!page || !main) return;

  const pageHeading = main.querySelector(".page-title-sr-only");
  if (name === "home") {
    pageHeading?.remove();
  } else if (!pageHeading) {
    const heading = document.createElement("h1");
    heading.className = "page-title-sr-only";
    heading.textContent = page.title.split(" | ")[0];
    main.prepend(heading);
  } else {
    pageHeading.textContent = page.title.split(" | ")[0];
  }

  const section = page.section
    ? main.querySelector(page.section)
    : null;
  if (page.section && !section) {
    throw new Error(`The requested content "${page.section}" was not found.`);
  }
  const selectedContent = section
    ? [...main.children].find(
        (child) => child === section || child.contains(section)
      )
    : null;
  if (page.section && !selectedContent) {
    throw new Error(`The requested content "${page.section}" has no page container.`);
  }

  [...main.children].forEach((child) => {
    if (child.classList.contains("page-title-sr-only")) return;
    child.hidden = Boolean(selectedContent && child !== selectedContent);
  });

  document.title = page.title;
  document.querySelectorAll(".nav__link").forEach((link) => {
    const active = pageFromHref(link.href) === name;
    link.classList.toggle("is-active", active);
    if (active) {
      link.setAttribute("aria-current", "page");
    } else {
      link.removeAttribute("aria-current");
    }
  });
  setNavigationOpen(false);
  window.dispatchEvent(new Event("bsc:navigate"));
}

async function navigate(name, pushState) {
  if (!pages[name]) return;

  if (originalPage && !main) {
    await renderSharedLayout();
  }
  if (!main) throw new Error("The page content container is missing.");

  if (pushState) {
    history.pushState({ page: name }, "", pages[name].file);
  }
  showPage(name);
  window.scrollTo(0, 0);
}

document.addEventListener("click", (event) => {
  if (!(event.target instanceof Element)) return;
  const link = event.target.closest("a[href]");
  if (!link || link.target === "_blank" || event.metaKey || event.ctrlKey) {
    return;
  }

  const name = pageFromHref(link.href);
  if (!name) return;

  event.preventDefault();
  navigate(name, true).catch(showLoadError);
});

window.addEventListener("popstate", () => {
  navigate(currentPageFromLocation(), false).catch(showLoadError);
});

async function initialize() {
  document.body.dataset.spa = "true";
  if (originalPage) {
    await renderSharedLayout();
  } else if (!main) {
    throw new Error("The homepage content is missing.");
  }
  showPage(currentPageFromLocation());
}

initialize().catch(showLoadError);
