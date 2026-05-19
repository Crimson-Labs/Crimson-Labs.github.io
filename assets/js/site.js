const navToggle = document.querySelector("[data-nav-toggle]");
const nav = document.querySelector("[data-nav]");

if (navToggle && nav) {
  navToggle.addEventListener("click", () => {
    nav.classList.toggle("open");
  });

  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => nav.classList.remove("open"));
  });
}

const yearNode = document.querySelector("[data-year]");
if (yearNode) {
  yearNode.textContent = String(new Date().getFullYear());
}

const copyButtons = document.querySelectorAll("[data-copy]");
copyButtons.forEach((button) => {
  button.addEventListener("click", async () => {
    const content = button.getAttribute("data-copy");
    if (!content) return;
    try {
      await navigator.clipboard.writeText(content);
      const old = button.textContent;
      button.textContent = "Copied";
      setTimeout(() => {
        button.textContent = old;
      }, 1200);
    } catch (_) {
      button.textContent = "Copy failed";
      setTimeout(() => {
        button.textContent = "Copy";
      }, 1400);
    }
  });
});

const reveals = document.querySelectorAll(".fade-up");
if (reveals.length > 0) {
  reveals.forEach((node, index) => {
    node.style.setProperty("--delay", `${index * 65}ms`);
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.14 }
  );

  reveals.forEach((node) => observer.observe(node));
}

const ghNodes = document.querySelectorAll("[data-gh-repo][data-gh-field]");
if (ghNodes.length > 0) {
  const cache = new Map();

  const formatRelativeTime = (iso) => {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const fillNode = (node, data) => {
    const field = node.getAttribute("data-gh-field");
    if (field === "stars") node.textContent = String(data.stargazers_count ?? 0);
    if (field === "forks") node.textContent = String(data.forks_count ?? 0);
    if (field === "issues") node.textContent = String(data.open_issues_count ?? 0);
    if (field === "updated") node.textContent = formatRelativeTime(data.updated_at);
    if (field === "watchers") node.textContent = String(data.subscribers_count ?? 0);
  };

  const loadRepo = async (repo) => {
    if (cache.has(repo)) return cache.get(repo);
    const res = await fetch(`https://api.github.com/repos/${repo}`);
    if (!res.ok) throw new Error(`GitHub API ${res.status}`);
    const data = await res.json();
    cache.set(repo, data);
    return data;
  };

  ghNodes.forEach(async (node) => {
    const repo = node.getAttribute("data-gh-repo");
    if (!repo) return;
    try {
      const data = await loadRepo(repo);
      fillNode(node, data);
    } catch (_) {
      node.textContent = "-";
    }
  });
}

const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (!prefersReduced) {
  const parallaxNodes = document.querySelectorAll("[data-parallax]");
  window.addEventListener("mousemove", (event) => {
    const x = (event.clientX / window.innerWidth - 0.5) * 2;
    const y = (event.clientY / window.innerHeight - 0.5) * 2;

    parallaxNodes.forEach((node) => {
      const strength = Number(node.getAttribute("data-parallax")) || 8;
      node.style.transform = `translate3d(${x * strength}px, ${y * strength}px, 0)`;
    });
  });

  const tiltCards = document.querySelectorAll(".card, .mini-card");
  tiltCards.forEach((card) => {
    card.addEventListener("mousemove", (event) => {
      const rect = card.getBoundingClientRect();
      const px = (event.clientX - rect.left) / rect.width - 0.5;
      const py = (event.clientY - rect.top) / rect.height - 0.5;
      card.style.transform = `rotateX(${py * -3.5}deg) rotateY(${px * 4}deg) translateY(-4px)`;
    });
    card.addEventListener("mouseleave", () => {
      card.style.transform = "";
    });
  });
}
