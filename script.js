const STORAGE_KEY = "luxbeauty:theme";

function normalize(text) {
  return (text || "")
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function safeStorageGet(key) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeStorageSet(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // ignore
  }
}

function getSelectedTheme() {
  const saved = safeStorageGet(STORAGE_KEY);
  if (saved === "light" || saved === "dark") return saved;
  return null;
}

function setTheme(theme) {
  document.documentElement.dataset.theme = theme;
  safeStorageSet(STORAGE_KEY, theme);
  const toggle = document.getElementById("themeToggle");
  if (toggle) toggle.setAttribute("aria-pressed", theme === "light" ? "true" : "false");
}

function initTheme() {
  const saved = getSelectedTheme();
  if (saved) return setTheme(saved);

  const prefersLight = window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches;
  setTheme(prefersLight ? "light" : "dark");
}

function getActiveFilters() {
  const term = normalize(document.getElementById("brandSearch")?.value);
  const category = document.getElementById("categoryFilter")?.value || "todas";
  return { term, category };
}

function matchesCategory(tags, category) {
  if (category === "todas") return true;
  if (category === "fragrancias") return tags.includes("fragrancias");
  if (category === "maquiagem") return tags.includes("maquiagem");
  if (category === "skincare") return tags.includes("skincare");
  if (category === "corpo") return tags.includes("corpo");
  return true;
}

function applyBrandFilters() {
  const grid = document.getElementById("brandGrid");
  if (!grid) return;

  const cards = [...grid.querySelectorAll(".card")];
  const { term, category } = getActiveFilters();

  let visible = 0;
  for (const card of cards) {
    const name = normalize(card.getAttribute("data-name"));
    const tags = normalize(card.getAttribute("data-tags")).split(/\s+/g).filter(Boolean);

    const matchTerm = !term || name.includes(term);
    const matchCat = matchesCategory(tags, category);

    const show = matchTerm && matchCat;
    card.hidden = !show;
    if (show) visible += 1;
  }

  const countEl = document.getElementById("resultsCount");
  if (countEl) countEl.textContent = String(visible);

  const empty = document.getElementById("emptyState");
  if (empty) empty.hidden = visible !== 0;
}

function initFilters() {
  const search = document.getElementById("brandSearch");
  const select = document.getElementById("categoryFilter");
  const reset = document.getElementById("resetFilters");

  search?.addEventListener("input", applyBrandFilters);
  select?.addEventListener("change", applyBrandFilters);

  reset?.addEventListener("click", () => {
    if (search) search.value = "";
    if (select) select.value = "todas";
    applyBrandFilters();
    search?.focus();
  });

  applyBrandFilters();
}

function initToTop() {
  const toTop = document.getElementById("toTop");
  toTop?.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
}

function initContactForm() {
  const form = document.getElementById("contactForm");
  const status = document.getElementById("formStatus");

  if (!form || !status) return;

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    status.textContent = "";

    const data = new FormData(form);
    const nome = (data.get("nome") || "").toString().trim();
    const email = (data.get("email") || "").toString().trim();
    const mensagem = (data.get("mensagem") || "").toString().trim();

    const invalid =
      nome.length < 2 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
      mensagem.length < 10;

    if (invalid) {
      status.textContent = "Preencha nome, email válido e uma mensagem com pelo menos 10 caracteres.";
      status.style.color = "var(--danger)";
      return;
    }

    status.textContent = `Obrigada, ${nome}! Sua mensagem foi registrada (demonstração).`;
    status.style.color = "var(--ok)";
    form.reset();
  });
}

function initThemeToggle() {
  const toggle = document.getElementById("themeToggle");
  if (!toggle) return;

  toggle.addEventListener("click", () => {
    const current = document.documentElement.dataset.theme === "light" ? "light" : "dark";
    setTheme(current === "light" ? "dark" : "light");
  });
}

function initYear() {
  const year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());
}

function initImageFallbacks() {
  const images = document.querySelectorAll("img[data-fallback]");
  for (const img of images) {
    const applyFallback = () => {
        const fallback = img.getAttribute("data-fallback");
        if (!fallback) return;
        if (img.getAttribute("src") === fallback) return;

        img.setAttribute("src", fallback);
        const alt = img.getAttribute("data-fallback-alt");
        if (alt) img.setAttribute("alt", alt);
        img.classList.remove("brand-image");
    };

    img.addEventListener("error", applyFallback, { once: true });
    if (img.complete && img.naturalWidth === 0) applyFallback();
  }
}

initTheme();
initThemeToggle();
initFilters();
initToTop();
initContactForm();
initYear();
initImageFallbacks();
