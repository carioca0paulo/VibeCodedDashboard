let allMedia = [];
let selectedFiles = [];
let chosenLat = null;
let chosenLon = null;
let chosenLocName = "";
let currentLang = "pt";
let currentSectionId = null;
let sectionsCache = [];
let widgetState = {}; // {clock:{x,y,enabled,color,size,opacity,font}, date:{...}, weather:{...}}

/* ---------- Tema (claro/escuro) — preferência local do navegador ---------- */
const themeToggle = document.getElementById("theme-toggle");

function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  localStorage.setItem("admin_theme", theme);
  themeToggle.checked = theme === "dark";
}
themeToggle.addEventListener("change", () => applyTheme(themeToggle.checked ? "dark" : "light"));
applyTheme(localStorage.getItem("admin_theme") || "light");

/* ---------- Idioma do painel — raiz da configuração ---------- */
async function setLanguage(lang, { save = true } = {}) {
  currentLang = lang;
  applyTranslations(lang);
  document.querySelectorAll(".lang-btn").forEach((b) => b.classList.toggle("is-active", b.dataset.lang === lang));
  renderMediaList();
  renderSelectedList();
  updateDisplayModeHint();

  if (save) {
    await fetch("/api/config", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ admin_language: lang }),
    });
  }
}
document.querySelectorAll(".lang-btn").forEach((btn) => {
  btn.addEventListener("click", () => setLanguage(btn.dataset.lang));
});

/* ---------- Seções (perfis de dispositivo) ---------- */
const sectionSelect = document.getElementById("section-select");

async function loadSections() {
  const res = await fetch("/api/sections");
  sectionsCache = await res.json();
  sectionSelect.innerHTML = "";
  sectionsCache.forEach((s) => {
    const opt = document.createElement("option");
    opt.value = s.id;
    opt.textContent = s.name;
    sectionSelect.appendChild(opt);
  });
  if (!currentSectionId || !sectionsCache.find((s) => s.id === currentSectionId)) {
    currentSectionId = sectionsCache[0]?.id || null;
  }
  sectionSelect.value = currentSectionId;
}

sectionSelect.addEventListener("change", () => {
  currentSectionId = sectionSelect.value;
  localStorage.setItem("admin_last_section", currentSectionId);
  loadConfig();
});

document.getElementById("new-section-btn").addEventListener("click", async () => {
  const name = prompt(t(currentLang, "new_section_prompt"));
  if (!name) return;
  const res = await fetch("/api/sections", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  });
  const data = await res.json();
  if (data.ok) {
    currentSectionId = data.id;
    await loadSections();
    await loadConfig();
  }
});

document.getElementById("rename-section-btn").addEventListener("click", async () => {
  const current = sectionsCache.find((s) => s.id === currentSectionId);
  const name = prompt(t(currentLang, "rename_section_prompt"), current?.name || "");
  if (!name) return;
  await fetch(`/api/sections/${currentSectionId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  });
  await loadSections();
});

document.getElementById("delete-section-btn").addEventListener("click", async () => {
  if (sectionsCache.length <= 1) {
    alert(t(currentLang, "delete_last_section_error"));
    return;
  }
  const current = sectionsCache.find((s) => s.id === currentSectionId);
  if (!confirm(t(currentLang, "delete_section_confirm", { name: current?.name || "" }))) return;
  await fetch(`/api/sections/${currentSectionId}`, { method: "DELETE" });
  currentSectionId = null;
  await loadSections();
  await loadConfig();
});

/* ---------- Orientação / modo de exibição ---------- */
function updateDisplayModeHint() {
  const modern = document.getElementById("mode-modern").checked;
  document.body.setAttribute("data-mode", modern ? "modern" : "compatibility");
  document.getElementById("display-mode-hint").textContent = t(
    currentLang,
    modern ? "mode_modern_hint" : "mode_compatibility_hint"
  );
}
document.querySelectorAll('input[name="display-mode"]').forEach((r) =>
  r.addEventListener("change", () => {
    updateDisplayModeHint();
    updateCanvasAspect();
  })
);

function updateCanvasAspect() {
  const portrait = document.getElementById("orientation-portrait").checked;
  const canvas = document.getElementById("drag-canvas");
  canvas.style.aspectRatio = portrait ? "9 / 16" : "16 / 9";
  const preview = document.getElementById("preview-screen");
  preview.style.aspectRatio = portrait ? "9 / 16" : "16 / 10";
}
document.querySelectorAll('input[name="orientation-mode"]').forEach((r) =>
  r.addEventListener("change", updateCanvasAspect)
);

/* ---------- Pré-visualização (mini, na rail) + canvas de arrastar ---------- */
function renderWidgetVisuals() {
  ["clock", "date", "weather"].forEach((key) => {
    const w = widgetState[key];
    if (!w) return;

    const mini = document.getElementById(`preview-${key}`);
    mini.classList.toggle("is-off", !w.enabled);
    mini.style.background = w.color;
    mini.style.left = `${w.x}%`;
    mini.style.top = `${w.y}%`;

    const badge = document.getElementById(`drag-${key}`);
    badge.classList.toggle("is-off", !w.enabled);
    badge.style.left = `${w.x}%`;
    badge.style.top = `${w.y}%`;
    badge.style.background = w.color;
  });
}

function setupDrag(badgeEl, key) {
  const canvas = document.getElementById("drag-canvas");

  badgeEl.addEventListener("pointerdown", (e) => {
    badgeEl.setPointerCapture(e.pointerId);
    badgeEl.classList.add("is-dragging");

    const move = (ev) => {
      const rect = canvas.getBoundingClientRect();
      let x = ((ev.clientX - rect.left) / rect.width) * 100;
      let y = ((ev.clientY - rect.top) / rect.height) * 100;
      x = Math.max(2, Math.min(98, x));
      y = Math.max(2, Math.min(98, y));
      widgetState[key].x = Math.round(x * 10) / 10;
      widgetState[key].y = Math.round(y * 10) / 10;
      renderWidgetVisuals();
    };

    const up = () => {
      badgeEl.classList.remove("is-dragging");
      badgeEl.removeEventListener("pointermove", move);
      badgeEl.removeEventListener("pointerup", up);
    };

    badgeEl.addEventListener("pointermove", move);
    badgeEl.addEventListener("pointerup", up);
  });
}
["clock", "date", "weather"].forEach((key) => setupDrag(document.getElementById(`drag-${key}`), key));

/* ---------- Sliders / campos de cada widget ---------- */
["clock", "date", "weather"].forEach((key) => {
  const sizeSlider = document.getElementById(`${key}-size`);
  const sizeLabel = document.getElementById(`${key}-size-val`);
  sizeSlider.addEventListener("input", () => {
    widgetState[key].size = parseFloat(sizeSlider.value);
    sizeLabel.textContent = sizeSlider.value + "x";
  });

  const opacitySlider = document.getElementById(`${key}-opacity`);
  const opacityLabel = document.getElementById(`${key}-opacity-val`);
  opacitySlider.addEventListener("input", () => {
    widgetState[key].opacity = parseFloat(opacitySlider.value);
    opacityLabel.textContent = Math.round(opacitySlider.value * 100) + "%";
  });

  document.getElementById(`${key}-enabled`).addEventListener("change", (e) => {
    widgetState[key].enabled = e.target.checked;
    renderWidgetVisuals();
  });
  document.getElementById(`${key}-color`).addEventListener("input", (e) => {
    widgetState[key].color = e.target.value;
    renderWidgetVisuals();
  });
});
document.getElementById("weather-icon-style").addEventListener("change", (e) => {
  widgetState.weather.icon_style = e.target.value;
});

/* ---------- Buscador de fontes (Google Fonts) ---------- */
function setupFontPicker(key) {
  const input = document.getElementById(`${key}-font-search`);
  const dropdown = document.getElementById(`${key}-font-dropdown`);

  function renderResults(query) {
    const results = searchFonts(query);
    dropdown.innerHTML = "";

    if (results.length === 0) {
      dropdown.innerHTML = `<div class="font-dropdown-empty">${t(currentLang, "font_no_results")}</div>`;
      dropdown.classList.add("is-open");
      return;
    }

    results.forEach((f) => {
      const item = document.createElement("div");
      item.className = "font-dropdown-item";
      item.textContent = f.family;
      item.style.fontFamily = `"${f.family}", sans-serif`;
      loadGoogleFont(f.family); // carrega só as ~8 fontes visíveis na busca
      item.addEventListener("mousedown", (e) => {
        // mousedown (não click) pra disparar antes do blur do input
        e.preventDefault();
        selectFont(key, f.family);
      });
      dropdown.appendChild(item);
    });
    dropdown.classList.add("is-open");
  }

  input.addEventListener("focus", () => renderResults(input.value));
  input.addEventListener("input", () => renderResults(input.value));
  input.addEventListener("blur", () => {
    setTimeout(() => dropdown.classList.remove("is-open"), 100);
    input.value = widgetState[key].font || "Roboto"; // desfaz texto sem selecionar
  });
}

function selectFont(key, family) {
  widgetState[key].font = family;
  document.getElementById(`${key}-font-search`).value = family;
  document.getElementById(`${key}-font-dropdown`).classList.remove("is-open");
  loadGoogleFont(family);
  applyFontPreview(key, family);
}

function applyFontPreview(key, family) {
  const fam = `"${family}", Roboto, sans-serif`;
  const mini = document.getElementById(`preview-${key}`);
  const badge = document.getElementById(`drag-${key}`);
  if (mini) mini.style.fontFamily = fam;
  if (badge) badge.style.fontFamily = fam;
}

["clock", "date", "weather"].forEach(setupFontPicker);


/* ---------- Navegação lateral com scrollspy ---------- */
const navLinks = Array.from(document.querySelectorAll(".nav-link"));
const sections = navLinks.map((l) => document.getElementById(l.dataset.section));

navLinks.forEach((link) => {
  link.addEventListener("click", (e) => {
    e.preventDefault();
    document.getElementById(link.dataset.section).scrollIntoView({ behavior: "smooth", block: "start" });
  });
});

function updateActiveNav() {
  let current = sections[0];
  const scrollPos = window.scrollY + 120;
  sections.forEach((sec) => { if (sec.offsetTop <= scrollPos) current = sec; });
  navLinks.forEach((l) => l.classList.toggle("is-active", l.dataset.section === current.id));
}
window.addEventListener("scroll", updateActiveNav, { passive: true });

/* ---------- Mídias (biblioteca compartilhada) ---------- */
async function loadMedia() {
  const res = await fetch("/api/media");
  allMedia = await res.json();
  renderMediaList();
  renderSelectedList();
}

function renderMediaList() {
  const list = document.getElementById("media-list");
  list.innerHTML = "";

  if (allMedia.length === 0) {
    list.innerHTML = `<p class="hint">${t(currentLang, "media_empty")}</p>`;
    return;
  }

  allMedia.forEach((item) => {
    const div = document.createElement("div");
    div.className = "media-item";
    const checked = selectedFiles.includes(item.file) ? "checked" : "";
    div.innerHTML = `
      <input type="checkbox" data-file="${item.file}" ${checked}>
      <label>${item.type === "video" ? "🎬" : "🖼️"} ${item.file}</label>
      <button type="button" class="delete-btn">✕</button>
    `;
    div.querySelector('input[type="checkbox"]').addEventListener("change", (e) => {
      if (e.target.checked) {
        if (!selectedFiles.includes(item.file)) selectedFiles.push(item.file);
      } else {
        selectedFiles = selectedFiles.filter((f) => f !== item.file);
      }
      renderSelectedList();
    });
    div.querySelector(".delete-btn").addEventListener("click", async () => {
      if (!confirm(t(currentLang, "delete_confirm", { name: item.file }))) return;
      const res = await fetch(`/api/media/${encodeURIComponent(item.file)}`, { method: "DELETE" });
      if (res.ok) {
        selectedFiles = selectedFiles.filter((f) => f !== item.file);
        await loadMedia();
      } else {
        alert(t(currentLang, "delete_error"));
      }
    });
    list.appendChild(div);
  });
}

function renderSelectedList() {
  const list = document.getElementById("selected-list");
  list.innerHTML = "";

  if (selectedFiles.length === 0) {
    list.innerHTML = `<p class="hint">${t(currentLang, "order_empty")}</p>`;
    return;
  }

  selectedFiles.forEach((file, idx) => {
    const div = document.createElement("div");
    div.className = "selected-item";
    div.innerHTML = `
      <span class="name">${idx + 1}. ${file}</span>
      <button type="button" data-action="up" ${idx === 0 ? "disabled" : ""}>▲</button>
      <button type="button" data-action="down" ${idx === selectedFiles.length - 1 ? "disabled" : ""}>▼</button>
      <button type="button" data-action="remove">✕</button>
    `;
    div.querySelector('[data-action="up"]').onclick = () => {
      [selectedFiles[idx - 1], selectedFiles[idx]] = [selectedFiles[idx], selectedFiles[idx - 1]];
      renderSelectedList();
    };
    div.querySelector('[data-action="down"]').onclick = () => {
      [selectedFiles[idx + 1], selectedFiles[idx]] = [selectedFiles[idx], selectedFiles[idx + 1]];
      renderSelectedList();
    };
    div.querySelector('[data-action="remove"]').onclick = () => {
      selectedFiles = selectedFiles.filter((f) => f !== file);
      renderMediaList();
      renderSelectedList();
    };
    list.appendChild(div);
  });
}

document.getElementById("refresh-media").onclick = loadMedia;

/* ---------- Upload de mídia ---------- */
const dropzone = document.getElementById("dropzone");
const fileInput = document.getElementById("file-input");
const uploadProgress = document.getElementById("upload-progress");

async function uploadFiles(fileList) {
  if (!fileList || fileList.length === 0) return;
  const formData = new FormData();
  Array.from(fileList).forEach((f) => formData.append("files", f));

  uploadProgress.className = "upload-progress";
  uploadProgress.textContent = t(currentLang, "uploading_msg", { n: fileList.length });

  try {
    const res = await fetch("/api/media/upload", { method: "POST", body: formData });
    const data = await res.json();

    if (!res.ok || !data.ok) {
      uploadProgress.className = "upload-progress is-error";
      uploadProgress.textContent = t(currentLang, "upload_error_msg");
      return;
    }

    let msg = t(currentLang, "upload_success_msg", { n: data.saved.length });
    if (data.skipped && data.skipped.length > 0) {
      msg += t(currentLang, "upload_skipped_msg", { n: data.skipped.length });
    }
    uploadProgress.className = "upload-progress is-success";
    uploadProgress.textContent = msg;
    await loadMedia();
  } catch (e) {
    uploadProgress.className = "upload-progress is-error";
    uploadProgress.textContent = t(currentLang, "upload_conn_error_msg");
  }
}

fileInput.addEventListener("change", (e) => uploadFiles(e.target.files));
["dragenter", "dragover"].forEach((evt) =>
  dropzone.addEventListener(evt, (e) => { e.preventDefault(); dropzone.classList.add("is-dragover"); })
);
["dragleave", "drop"].forEach((evt) =>
  dropzone.addEventListener(evt, (e) => { e.preventDefault(); dropzone.classList.remove("is-dragover"); })
);
dropzone.addEventListener("drop", (e) => {
  if (e.dataTransfer && e.dataTransfer.files) uploadFiles(e.dataTransfer.files);
});

/* ---------- Busca de cidade ---------- */
document.getElementById("city-search-btn").onclick = async () => {
  const city = document.getElementById("city-search").value.trim();
  const resultsDiv = document.getElementById("city-results");
  resultsDiv.innerHTML = "";
  if (!city) return;

  resultsDiv.innerHTML = `<p class="hint">${t(currentLang, "searching_msg")}</p>`;
  try {
    const res = await fetch(`/api/geocode?city=${encodeURIComponent(city)}`);
    const data = await res.json();
    resultsDiv.innerHTML = "";

    if (!data.results || data.results.length === 0) {
      resultsDiv.innerHTML = `<p class="hint">${t(currentLang, "city_not_found_msg")}</p>`;
      return;
    }

    data.results.forEach((r) => {
      const div = document.createElement("div");
      div.className = "city-result";
      const parts = [r.name, r.admin1, r.country].filter(Boolean);
      div.textContent = parts.join(", ");
      div.onclick = () => {
        chosenLat = r.latitude;
        chosenLon = r.longitude;
        chosenLocName = r.name;
        document.getElementById("lat").value = r.latitude;
        document.getElementById("lon").value = r.longitude;
        document.getElementById("current-loc-label").textContent = parts.join(", ");
        resultsDiv.innerHTML = "";
        document.getElementById("city-search").value = "";
      };
      resultsDiv.appendChild(div);
    });
  } catch (e) {
    resultsDiv.innerHTML = `<p class="hint">${t(currentLang, "city_search_error_msg")}</p>`;
  }
};

document.getElementById("geo-btn").onclick = () => {
  if (!navigator.geolocation) { alert(t(currentLang, "geo_unavailable_msg")); return; }
  navigator.geolocation.getCurrentPosition((pos) => {
    document.getElementById("lat").value = pos.coords.latitude.toFixed(4);
    document.getElementById("lon").value = pos.coords.longitude.toFixed(4);
    chosenLat = pos.coords.latitude;
    chosenLon = pos.coords.longitude;
  }, () => alert(t(currentLang, "geo_failed_msg")));
};

/* ---------- Carregar / salvar a seção atual ---------- */
function fillWidgetForm(key, w) {
  document.getElementById(`${key}-enabled`).checked = !!w.enabled;
  document.getElementById(`${key}-color`).value = w.color || "#ffffff";
  document.getElementById(`${key}-size`).value = w.size || 1;
  document.getElementById(`${key}-size-val`).textContent = (w.size || 1) + "x";
  document.getElementById(`${key}-opacity`).value = w.opacity ?? 1;
  document.getElementById(`${key}-opacity-val`).textContent = Math.round((w.opacity ?? 1) * 100) + "%";
  const fontFamily = normalizeFontFamily(w.font);
  document.getElementById(`${key}-font-search`).value = fontFamily;
  loadGoogleFont(fontFamily);
  applyFontPreview(key, fontFamily);
  if (key === "weather") {
    document.getElementById("weather-icon-style").value = w.icon_style || "svg";
  }
}

async function loadConfig() {
  if (!currentSectionId) return;
  const res = await fetch(`/api/config/${currentSectionId}`);
  if (!res.ok) return;
  const cfg = await res.json();

  document.getElementById("section-name-input").value = cfg.name || "";
  document.getElementById(cfg.orientation === "portrait" ? "orientation-portrait" : "orientation-landscape").checked = true;
  document.getElementById(cfg.display_mode === "modern" ? "mode-modern" : "mode-compatibility").checked = true;
  document.getElementById(cfg.language === "en" ? "section-lang-en" : "section-lang-pt").checked = true;
  updateDisplayModeHint();
  updateCanvasAspect();

  selectedFiles = (cfg.background_files || []).slice();
  document.getElementById(cfg.playback_order === "random" ? "order-random" : "order-sequential").checked = true;
  document.getElementById("img-duration").value = cfg.image_duration_seconds || 8;

  widgetState = JSON.parse(JSON.stringify(cfg.widgets));
  ["clock", "date", "weather"].forEach((k) => {
    widgetState[k].font = normalizeFontFamily(widgetState[k].font);
  });
  fillWidgetForm("clock", cfg.widgets.clock);
  fillWidgetForm("date", cfg.widgets.date);
  fillWidgetForm("weather", cfg.widgets.weather);
  renderWidgetVisuals();

  document.getElementById("lat").value = cfg.latitude;
  document.getElementById("lon").value = cfg.longitude;
  chosenLat = cfg.latitude;
  chosenLon = cfg.longitude;
  chosenLocName = cfg.location_name;
  document.getElementById("current-loc-label").textContent = cfg.location_name || "—";

  await loadMedia();
}

document.getElementById("save-btn").onclick = async () => {
  if (!currentSectionId) return;
  const lat = parseFloat(document.getElementById("lat").value);
  const lon = parseFloat(document.getElementById("lon").value);

  const payload = {
    name: document.getElementById("section-name-input").value.trim() || undefined,
    orientation: document.getElementById("orientation-portrait").checked ? "portrait" : "landscape",
    display_mode: document.getElementById("mode-modern").checked ? "modern" : "compatibility",
    language: document.getElementById("section-lang-en").checked ? "en" : "pt",
    background_files: selectedFiles,
    playback_order: document.getElementById("order-random").checked ? "random" : "sequential",
    image_duration_seconds: parseInt(document.getElementById("img-duration").value, 10) || 8,
    widgets: widgetState,
    latitude: isNaN(lat) ? chosenLat : lat,
    longitude: isNaN(lon) ? chosenLon : lon,
    location_name: chosenLocName || document.getElementById("current-loc-label").textContent,
  };

  const res = await fetch(`/api/config/${currentSectionId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const status = document.getElementById("save-status");
  if (res.ok) {
    status.style.color = "var(--success)";
    status.textContent = t(currentLang, "saved_msg");
    setTimeout(() => (status.textContent = ""), 2500);
    await loadSections(); // reflete nome renomeado, se mudou
  } else {
    status.style.color = "#b23b3b";
    status.textContent = t(currentLang, "save_error_msg");
  }
};

/* ---------- Inicialização ---------- */
(async function init() {
  const rootRes = await fetch("/api/config");
  const root = await rootRes.json();
  await setLanguage(root.admin_language || "pt", { save: false });

  currentSectionId = localStorage.getItem("admin_last_section");
  await loadSections();
  await loadConfig();
})();
