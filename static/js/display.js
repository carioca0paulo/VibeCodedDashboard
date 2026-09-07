/* ---------- Elementos ---------- */
const chooserEl = document.getElementById("chooser");
const displayRootEl = document.getElementById("display-root");
const imgEl = document.getElementById("bg-image");
const videoEl = document.getElementById("bg-video");
const fsBtn = document.getElementById("fullscreen-btn");
const changeSectionLink = document.getElementById("change-section-link");

const widgetEls = {
  clock: document.getElementById("clock-widget"),
  date: document.getElementById("date-widget"),
  weather: document.getElementById("weather-widget"),
};

/* ---------- Estado ---------- */
let currentConfig = null;
let currentSectionId = null;
let dateLocale = "pt-BR";
let playlistFiles = [];
let playbackOrderUsed = null;
let effectiveQueue = [];
let queueIndex = 0;
let advanceTimer = null;

/* ---------- Escolha de seção ---------- */
function getUrlSection() {
  const params = new URLSearchParams(window.location.search);
  return params.get("section");
}

async function resolveSection() {
  const forced = getUrlSection();
  if (forced) {
    localStorage.setItem("dashboard_section", forced);
    return forced;
  }

  const saved = localStorage.getItem("dashboard_section");

  const res = await fetch("/api/sections");
  const sections = await res.json();

  if (saved && sections.find((s) => s.id === saved)) return saved;
  if (sections.length === 1) {
    localStorage.setItem("dashboard_section", sections[0].id);
    return sections[0].id;
  }
  if (sections.length === 0) return null;

  // Mais de uma seção e nenhuma escolhida ainda: mostra o seletor.
  showChooser(sections);
  return null;
}

function showChooser(sections) {
  document.getElementById("chooser-title").textContent = t("pt", "choose_device_title");
  document.getElementById("chooser-subtitle").textContent = t("pt", "choose_device_subtitle");
  const list = document.getElementById("chooser-list");
  list.innerHTML = "";
  sections.forEach((s) => {
    const btn = document.createElement("button");
    btn.className = "chooser-btn";
    btn.textContent = s.name;
    btn.onclick = () => {
      localStorage.setItem("dashboard_section", s.id);
      window.location.href = window.location.pathname; // recarrega já resolvido
    };
    list.appendChild(btn);
  });
  chooserEl.style.display = "flex";
  displayRootEl.style.display = "none";
}

/* ---------- Relógio ---------- */
function updateClock() {
  const now = new Date();
  const hh = String(now.getHours()).padStart(2, "0");
  const mm = String(now.getMinutes()).padStart(2, "0");
  document.getElementById("clock").textContent = `${hh}:${mm}`;

  const dateStr = now.toLocaleDateString(dateLocale, {
    weekday: "long", day: "numeric", month: "long",
  });
  document.getElementById("date").textContent = dateStr;
}

/* ---------- Widgets: posição livre (x/y), cor, tamanho, opacidade, fonte ---------- */
function applyWidgetConfig(el, w, compatMode) {
  if (!w) return;
  el.style.display = w.enabled ? (el.id === "weather-widget" ? "flex" : "block") : "none";
  if (!w.enabled) return;

  el.style.left = `${w.x}%`;
  el.style.top = `${w.y}%`;
  el.style.color = w.color || "#ffffff";

  const size = w.size || 1;
  el.style.transform = `translate(-50%, -50%) scale(${size})`;

  // Modo compatibilidade força opacidade total e fonte padrão, mesmo que
  // outro valor tenha sido salvo (ex: seção mudou de moderno pra compat).
  el.style.opacity = compatMode ? 1 : (w.opacity ?? 1);

  if (compatMode) {
    el.style.fontFamily = "";
  } else {
    const family = normalizeFontFamily(w.font);
    loadGoogleFont(family);
    el.style.fontFamily = `"${family}", Roboto, sans-serif`;
  }
}

function applyAllWidgets(cfg) {
  const compatMode = cfg.display_mode !== "modern";
  applyWidgetConfig(widgetEls.clock, cfg.widgets.clock, compatMode);
  applyWidgetConfig(widgetEls.date, cfg.widgets.date, compatMode);
  applyWidgetConfig(widgetEls.weather, cfg.widgets.weather, compatMode);
}

/* ---------- Clima ----------
   Ícones em SVG por padrão (compatível com Android 5, que não tem fonte de
   emoji colorido). No modo moderno, dá pra escolher emoji em vez disso. */

function weatherTypeFromCode(code) {
  if (code === 0 || code === 1) return "sun";
  if (code === 2) return "partly-cloudy";
  if (code === 3) return "cloudy";
  if (code === 45 || code === 48) return "fog";
  if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return "rain";
  if ([71, 73, 75, 77, 85, 86].includes(code)) return "snow";
  if ([95, 96, 99].includes(code)) return "storm";
  return "cloudy";
}

const WEATHER_EMOJI = {
  sun: "☀️", "partly-cloudy": "⛅", cloudy: "☁️", fog: "🌫️",
  rain: "🌧️", snow: "❄️", storm: "⛈️",
};

const CLOUD_SHAPE =
  '<ellipse cx="8" cy="15" rx="4.5" ry="3.6"/><ellipse cx="14.5" cy="14" rx="4" ry="3.2"/><rect x="4.5" y="15" width="13.5" height="4.5" rx="2.25"/>';

const SUN_SHAPE =
  '<circle cx="12" cy="12" r="5"/><g stroke="currentColor" stroke-width="1.8" stroke-linecap="round">' +
  '<line x1="12" y1="1" x2="12" y2="3.5"/><line x1="12" y1="20.5" x2="12" y2="23"/>' +
  '<line x1="1" y1="12" x2="3.5" y2="12"/><line x1="20.5" y1="12" x2="23" y2="12"/>' +
  '<line x1="4.2" y1="4.2" x2="6" y2="6"/><line x1="18" y1="18" x2="19.8" y2="19.8"/>' +
  '<line x1="4.2" y1="19.8" x2="6" y2="18"/><line x1="18" y1="6" x2="19.8" y2="4.2"/></g>';

const WEATHER_SVGS = {
  sun: `<svg viewBox="0 0 24 24" fill="currentColor">${SUN_SHAPE}</svg>`,
  "partly-cloudy": `<svg viewBox="0 0 24 24" fill="currentColor">
      <circle cx="7.5" cy="7.5" r="3.2"/>
      <g stroke="currentColor" stroke-width="1.5" stroke-linecap="round">
        <line x1="7.5" y1="0.5" x2="7.5" y2="2.2"/><line x1="0.5" y1="7.5" x2="2.2" y2="7.5"/>
        <line x1="2.3" y1="2.3" x2="3.5" y2="3.5"/>
      </g>
      <g transform="translate(2,3)">${CLOUD_SHAPE}</g>
    </svg>`,
  cloudy: `<svg viewBox="0 0 24 24" fill="currentColor">${CLOUD_SHAPE}</svg>`,
  fog: `<svg viewBox="0 0 24 24" fill="currentColor">
      <g opacity="0.85">${CLOUD_SHAPE}</g>
      <g stroke="currentColor" stroke-width="1.6" stroke-linecap="round">
        <line x1="3" y1="21" x2="21" y2="21"/><line x1="5" y1="23.5" x2="19" y2="23.5"/>
      </g>
    </svg>`,
  rain: `<svg viewBox="0 0 24 30" fill="currentColor">
      ${CLOUD_SHAPE}
      <g stroke="currentColor" stroke-width="1.8" stroke-linecap="round">
        <line x1="8" y1="21" x2="6.5" y2="25"/><line x1="12" y1="21" x2="10.5" y2="25"/><line x1="16" y1="21" x2="14.5" y2="25"/>
      </g>
    </svg>`,
  snow: `<svg viewBox="0 0 24 30" fill="currentColor">
      ${CLOUD_SHAPE}
      <g stroke="currentColor" stroke-width="1.6" stroke-linecap="round">
        <line x1="8" y1="22" x2="8" y2="26"/><line x1="6" y1="24" x2="10" y2="24"/>
        <line x1="16" y1="22" x2="16" y2="26"/><line x1="14" y1="24" x2="18" y2="24"/>
      </g>
    </svg>`,
  storm: `<svg viewBox="0 0 24 30" fill="currentColor">
      ${CLOUD_SHAPE}
      <path d="M13 19l-3.5 6h3l-1.5 4 5-6.5h-3z"/>
    </svg>`,
};

function iconForWeather(code, useEmoji) {
  const type = weatherTypeFromCode(code);
  if (useEmoji) return WEATHER_EMOJI[type] || "🌡️";
  return WEATHER_SVGS[type] || WEATHER_SVGS.cloudy;
}

function renderWeatherIcon(code) {
  const compatMode = currentConfig.display_mode !== "modern";
  const useEmoji = !compatMode && currentConfig.widgets.weather.icon_style === "emoji";
  const el = document.getElementById("weather-icon");
  if (useEmoji) {
    el.textContent = iconForWeather(code, true);
  } else {
    el.innerHTML = iconForWeather(code, false);
  }
}

async function fetchWeather(cfg) {
  const cacheKey = "weather_cache";
  try {
    const res = await fetch(`/api/weather?lat=${cfg.latitude}&lon=${cfg.longitude}`, { cache: "no-store" });
    const data = await res.json();
    if (!data.ok) throw new Error(data.error || "falha ao obter clima");

    const temp = Math.round(data.temperature);
    const code = data.weathercode;
    renderWeatherIcon(code);
    document.getElementById("weather-temp").textContent = `${temp}°C`;
    document.getElementById("weather-loc").textContent = cfg.location_name || "";

    localStorage.setItem(cacheKey, JSON.stringify({ temp, code, loc: cfg.location_name }));
  } catch (e) {
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      const d = JSON.parse(cached);
      renderWeatherIcon(d.code);
      document.getElementById("weather-temp").textContent = `${d.temp}°C`;
      document.getElementById("weather-loc").textContent = (d.loc || "") + t(cfg.language || "pt", "offline_suffix");
    }
  }
}

/* ---------- Playlist de mídias ---------- */
function arraysEqual(a, b) {
  return JSON.stringify(a) === JSON.stringify(b);
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function buildQueue(files, order) {
  const q = files.slice();
  return order === "random" ? shuffle(q) : q;
}

let playGen = 0;

function safePause(el) {
  try { el.pause(); } catch (e) { /* WebViews antigos podem lançar erro aqui */ }
}

function playCurrent() {
  clearTimeout(advanceTimer);
  playGen += 1;
  const myGen = playGen;

  if (effectiveQueue.length === 0) {
    imgEl.style.display = "none";
    safePause(videoEl);
    videoEl.style.display = "none";
    return;
  }

  const file = effectiveQueue[queueIndex];
  const ext = file.split(".").pop().toLowerCase();
  const isVideo = ["mp4", "webm", "ogg"].includes(ext);
  const url = `/static/media/${encodeURIComponent(file)}`;
  const imgDuration = (currentConfig && currentConfig.image_duration_seconds) || 8;

  function goNext() {
    if (myGen !== playGen) return;
    advance();
  }

  if (isVideo) {
    imgEl.style.display = "none";
    videoEl.onended = null;
    videoEl.onloadedmetadata = null;
    videoEl.style.display = "block";
    videoEl.src = url;
    videoEl.onended = goNext;

    advanceTimer = setTimeout(goNext, 5 * 60 * 1000);
    videoEl.onloadedmetadata = () => {
      if (myGen !== playGen) return;
      if (isFinite(videoEl.duration) && videoEl.duration > 0) {
        clearTimeout(advanceTimer);
        advanceTimer = setTimeout(goNext, (videoEl.duration + 0.5) * 1000);
      }
    };

    try {
      const playResult = videoEl.play();
      if (playResult && typeof playResult.catch === "function") {
        playResult.catch(() => {
          clearTimeout(advanceTimer);
          advanceTimer = setTimeout(goNext, imgDuration * 1000);
        });
      }
    } catch (e) {
      clearTimeout(advanceTimer);
      advanceTimer = setTimeout(goNext, imgDuration * 1000);
    }
  } else {
    videoEl.onended = null;
    videoEl.onloadedmetadata = null;
    safePause(videoEl);
    videoEl.style.display = "none";
    imgEl.style.display = "block";
    imgEl.src = url;
    advanceTimer = setTimeout(goNext, imgDuration * 1000);
  }
}

function advance() {
  queueIndex++;
  if (queueIndex >= effectiveQueue.length) {
    queueIndex = 0;
    if (currentConfig && currentConfig.playback_order === "random") {
      effectiveQueue = buildQueue(playlistFiles, "random");
    }
  }
  playCurrent();
}

function maybeRebuildPlaylist(cfg) {
  const files = cfg.background_files || [];
  const orderChanged = cfg.playback_order !== playbackOrderUsed;
  const filesChanged = !arraysEqual(files, playlistFiles);

  if (filesChanged || (orderChanged && cfg.playback_order === "random") || (effectiveQueue.length === 0 && files.length > 0)) {
    playlistFiles = files.slice();
    playbackOrderUsed = cfg.playback_order;
    effectiveQueue = buildQueue(files, cfg.playback_order);
    queueIndex = 0;
    playCurrent();
  } else if (orderChanged) {
    playbackOrderUsed = cfg.playback_order;
  }
}

/* ---------- Tela cheia ---------- */
function updateFsIcon() {
  const isFs = !!document.fullscreenElement;
  document.getElementById("icon-expand").style.display = isFs ? "none" : "block";
  document.getElementById("icon-compress").style.display = isFs ? "block" : "none";
}

fsBtn.addEventListener("click", () => {
  const el = document.documentElement;
  if (!document.fullscreenElement) {
    const req = el.requestFullscreen || el.webkitRequestFullscreen || el.mozRequestFullScreen || el.msRequestFullscreen;
    if (req) req.call(el);
  } else {
    const exit = document.exitFullscreen || document.webkitExitFullscreen || document.mozCancelFullScreen || document.msExitFullscreen;
    if (exit) exit.call(document);
  }
});

["fullscreenchange", "webkitfullscreenchange", "mozfullscreenchange", "MSFullscreenChange"]
  .forEach((evt) => document.addEventListener(evt, updateFsIcon));

changeSectionLink.addEventListener("click", (e) => {
  e.preventDefault();
  localStorage.removeItem("dashboard_section");
  window.location.href = window.location.pathname;
});

/* ---------- Sincronização com o servidor ---------- */
async function syncConfig() {
  try {
    const res = await fetch(`/api/config/${currentSectionId}`, { cache: "no-store" });
    const cfg = await res.json();
    currentConfig = cfg;
    dateLocale = cfg.language === "en" ? "en-US" : "pt-BR";
    fsBtn.title = t(cfg.language || "pt", "fullscreen_title");
    applyAllWidgets(cfg);
    maybeRebuildPlaylist(cfg);
    return cfg;
  } catch (e) {
    console.warn("Não foi possível sincronizar config (servidor fora do ar?)", e);
    return null;
  }
}

async function init() {
  const sectionId = await resolveSection();
  if (!sectionId) return; // chooser está sendo mostrado

  currentSectionId = sectionId;
  chooserEl.style.display = "none";
  displayRootEl.style.display = "block";

  // manifesto dinâmico (leva a orientação escolhida pra essa seção)
  document.getElementById("manifest-link").href = `/manifest.json?section=${sectionId}`;

  // só mostra o link de trocar dispositivo se houver mais de uma seção
  const sections = await (await fetch("/api/sections")).json();
  changeSectionLink.style.display = sections.length > 1 ? "block" : "none";

  updateClock();
  setInterval(updateClock, 1000);

  const cfg = await syncConfig();
  if (cfg && cfg.widgets.weather.enabled) fetchWeather(cfg);

  setInterval(async () => {
    await syncConfig();
  }, (currentConfig && currentConfig.refresh_seconds ? currentConfig.refresh_seconds : 30) * 1000);

  setInterval(() => {
    if (currentConfig && currentConfig.widgets.weather.enabled) fetchWeather(currentConfig);
  }, 15 * 60 * 1000);
}

init();
