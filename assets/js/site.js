const page = document.body?.dataset.page || "";

const navToggle = document.querySelector("[data-nav-toggle]");
const nav = document.querySelector("[data-nav]");
if (navToggle && nav) {
  navToggle.addEventListener("click", () => nav.classList.toggle("open"));
  nav.querySelectorAll("a").forEach((a) => {
    a.addEventListener("click", () => nav.classList.remove("open"));
  });
}

document.querySelectorAll("[data-year]").forEach((node) => {
  node.textContent = String(new Date().getFullYear());
});

const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const setupRevealAnimations = () => {
  const reveals = document.querySelectorAll(".fade-up:not([data-reveal-bound])");
  if (reveals.length === 0) return;

  reveals.forEach((node, i) => {
    node.style.setProperty("--delay", `${i * 56}ms`);
    node.setAttribute("data-reveal-bound", "true");
  });

  if (prefersReduced) {
    reveals.forEach((node) => node.classList.add("is-visible"));
    return;
  }

  const obs = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.14 }
  );

  reveals.forEach((node) => obs.observe(node));
};

const make = (tag, cls, text) => {
  const node = document.createElement(tag);
  if (cls) node.className = cls;
  if (typeof text === "string") node.textContent = text;
  return node;
};

const imageSource = (theme, mode = "card") => {
  if (mode === "preview") return theme.previewPng || theme.bgPng || theme.bgGif || "";
  return theme.bgGif || theme.bgPng || theme.previewPng || "";
};

const renderHomeThemes = (root, themes) => {
  const frag = document.createDocumentFragment();
  themes.forEach((theme) => {
    const card = make("article", "card fade-up");
    card.setAttribute("data-tilt", "");

    const media = make("img", "card-media");
    media.src = imageSource(theme, "card");
    media.alt = `${theme.name} preview`;

    const body = make("div", "card-body");
    body.appendChild(make("h3", "", theme.name));
    body.appendChild(make("p", "", theme.description));

    const pills = make("div", "pill-row");
    theme.tags.forEach((tag) => pills.appendChild(make("span", "pill", tag)));
    body.appendChild(pills);

    const actions = make("div", "btn-row");
    const link = make("a", "btn btn-secondary", "Open Repository");
    link.href = theme.repoUrl;
    link.target = "_blank";
    link.rel = "noreferrer";
    actions.appendChild(link);

    card.appendChild(media);
    card.appendChild(body);
    body.appendChild(actions);
    frag.appendChild(card);
  });
  root.replaceChildren(frag);
};

const renderThemeRows = (root, themes) => {
  const frag = document.createDocumentFragment();
  themes.forEach((theme) => {
    const row = make("article", "theme-row fade-up");
    row.setAttribute("data-tilt", "");

    const media = make("img", "theme-row-media");
    media.src = imageSource(theme, "card");
    media.alt = `${theme.name} theme background`;

    const body = make("div", "theme-row-body");
    body.appendChild(make("h3", "", theme.name));
    body.appendChild(make("p", "", theme.description));

    const meta = make("div", "theme-meta");
    const addMeta = (label, value) => {
      const box = make("div", "meta-item");
      box.appendChild(make("small", "", label));
      box.appendChild(make("strong", "", value));
      meta.appendChild(box);
    };

    addMeta("Repository", theme.slug);
    addMeta("Theme File", theme.themeFile);
    addMeta("Support", "BetterDiscord + Vencord");

    const actions = make("div", "btn-row");
    const dl = make("a", "btn btn-primary", "Download Theme");
    dl.href = theme.themeUrl;
    dl.target = "_blank";
    dl.rel = "noreferrer";

    const repo = make("a", "btn btn-secondary", "View Repo");
    repo.href = theme.repoUrl;
    repo.target = "_blank";
    repo.rel = "noreferrer";

    actions.append(dl, repo);

    body.append(meta, actions);
    row.append(media, body);
    frag.appendChild(row);
  });
  root.replaceChildren(frag);
};

const renderPreviewBlocks = (root, themes) => {
  const frag = document.createDocumentFragment();
  themes.forEach((theme) => {
    const block = make("article", "preview-block fade-up");
    const img = make("img", "");
    img.src = imageSource(theme, "preview");
    img.alt = `${theme.name} screenshot preview`;

    const cap = make("div", "preview-caption");
    cap.appendChild(make("h3", "", `${theme.name} Preview`));
    cap.appendChild(make("p", "lead", theme.slug));

    block.append(img, cap);
    frag.appendChild(block);
  });
  root.replaceChildren(frag);
};

const renderDownloadThemes = (root, themes) => {
  const frag = document.createDocumentFragment();
  themes.forEach((theme) => {
    const card = make("article", "download-card fade-up");
    card.setAttribute("data-tilt", "");

    const img = make("img", "card-media");
    img.src = imageSource(theme, "card");
    img.alt = `${theme.name} preview`;

    const head = make("div", "download-head");
    head.appendChild(make("h3", "", theme.name));

    const text = make("p", "", `${theme.slug} | ${theme.themeFile}`);

    const row = make("div", "btn-row");
    row.style.padding = "0.78rem 0.95rem 0.95rem";

    const dl = make("a", "btn btn-primary", "Theme File");
    dl.href = theme.themeUrl;
    dl.target = "_blank";
    dl.rel = "noreferrer";

    const repo = make("a", "btn btn-secondary", "Repository");
    repo.href = theme.repoUrl;
    repo.target = "_blank";
    repo.rel = "noreferrer";

    row.append(dl, repo);
    card.append(img, head, text, row);
    frag.appendChild(card);
  });
  root.replaceChildren(frag);
};

const runThemeRendering = async () => {
  const targets = {
    home: document.querySelector("[data-render='home-themes']"),
    themes: document.querySelector("[data-render='theme-rows']"),
    preview: document.querySelector("[data-render='preview-blocks']"),
    download: document.querySelector("[data-render='download-themes']")
  };

  const needsData = Object.values(targets).some(Boolean);
  if (!needsData) return;

  try {
    let payload = null;
    if (window.CRIMSON_THEME_DATA && Array.isArray(window.CRIMSON_THEME_DATA.themes)) {
      payload = window.CRIMSON_THEME_DATA;
    } else {
      const res = await fetch("assets/data/themes.json", { cache: "no-store" });
      if (!res.ok) throw new Error(`themes.json ${res.status}`);
      payload = await res.json();
    }
    const themes = Array.isArray(payload.themes) ? payload.themes : [];

    if (targets.home) renderHomeThemes(targets.home, themes);
    if (targets.themes) renderThemeRows(targets.themes, themes);
    if (targets.preview) renderPreviewBlocks(targets.preview, themes);
    if (targets.download) renderDownloadThemes(targets.download, themes);
  } catch (_) {
    Object.values(targets).forEach((target) => {
      if (!target) return;
      target.innerHTML = "<article class='panel'><h3>Themes unavailable</h3><p class='lead'>Please refresh this page in a moment.</p></article>";
    });
  }
};

const setupCopyButtons = () => {
  document.addEventListener("click", async (event) => {
    const button = event.target.closest("[data-copy]");
    if (!button) return;
    const value = button.getAttribute("data-copy");
    if (!value) return;

    try {
      await navigator.clipboard.writeText(value);
      const old = button.textContent;
      button.textContent = "Copied";
      setTimeout(() => {
        button.textContent = old;
      }, 1200);
    } catch (_) {
      button.textContent = "Copy failed";
    }
  });
};

const setupTilts = () => {
  if (page !== "me") return;
  if (prefersReduced) return;
  const cards = document.querySelectorAll("[data-tilt]");
  cards.forEach((card) => {
    card.addEventListener("mousemove", (event) => {
      const rect = card.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      card.style.transform = `perspective(900px) rotateX(${y * -7.5}deg) rotateY(${x * 9.5}deg) translateY(-5px)`;
    });
    card.addEventListener("mouseleave", () => {
      card.style.transform = "";
    });
  });
};

const setupCursorTrail = () => {
  if (prefersReduced) return;
  if (!window.matchMedia("(pointer:fine)").matches) return;

  const cursor = document.createElement("div");
  cursor.className = "cursor-star";
  document.body.appendChild(cursor);

  let lastTrailAt = 0;
  window.addEventListener("mousemove", (event) => {
    const x = event.clientX;
    const y = event.clientY;
    cursor.style.left = `${x}px`;
    cursor.style.top = `${y}px`;

    const now = performance.now();
    if (now - lastTrailAt < 24) return;
    lastTrailAt = now;

    const t = document.createElement("span");
    t.className = "trail-star";
    t.style.left = `${x}px`;
    t.style.top = `${y}px`;
    t.style.fontSize = `${8 + Math.random() * 7}px`;
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 660);
  });
};

const setupMusicPlayer = () => {
  const root = document.querySelector("[data-music-player]");
  if (!root) return;

  const audio = root.querySelector("[data-audio]");
  const playBtn = root.querySelector("[data-music-play]");
  const pauseBtn = root.querySelector("[data-music-pause]");
  const progress = root.querySelector("[data-music-progress]");
  const volume = root.querySelector("[data-music-volume]");
  const status = root.querySelector("[data-music-status]");
  const time = root.querySelector("[data-music-time]");

  if (!audio) return;

  const formatTime = (seconds) => {
    if (!Number.isFinite(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${String(secs).padStart(2, "0")}`;
  };

  const setStatus = (text) => {
    if (status) status.textContent = text;
  };

  const syncTime = () => {
    if (progress && Number.isFinite(audio.duration) && audio.duration > 0) {
      progress.max = String(audio.duration);
      progress.value = String(audio.currentTime);
    }
    if (time) {
      time.textContent = `${formatTime(audio.currentTime)} / ${formatTime(audio.duration)}`;
    }
  };

  playBtn?.addEventListener("click", async () => {
    try {
      await audio.play();
      setStatus("Playing");
    } catch (_) {
      setStatus("Playback blocked");
    }
  });

  pauseBtn?.addEventListener("click", () => {
    audio.pause();
    setStatus("Paused");
  });

  progress?.addEventListener("input", () => {
    audio.currentTime = Number(progress.value);
  });

  volume?.addEventListener("input", () => {
    audio.volume = Number(volume.value);
  });

  audio.addEventListener("loadedmetadata", syncTime);
  audio.addEventListener("timeupdate", syncTime);
  audio.addEventListener("ended", () => setStatus("Ended"));
  audio.addEventListener("error", () => setStatus("music.mp3 not found"));
  audio.volume = Number(volume?.value || 0.4);
};

const run = async () => {
  setupCopyButtons();
  await runThemeRendering();
  setupRevealAnimations();
  setupTilts();
  setupCursorTrail();
  setupMusicPlayer();
};

run();
