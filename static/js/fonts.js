/* Lista curada de fontes do Google Fonts para o buscador do modo moderno.
   Carregamos cada fonte sob demanda (só quando é escolhida ou aparece nos
   resultados da busca), nunca todas de uma vez — mantém o dashboard leve,
   especialmente importante no modo compatibilidade, que nunca usa isso. */

const FONT_LIST = [
  // Sans-serif
  { family: "Roboto", category: "sans" },
  { family: "Inter", category: "sans" },
  { family: "Open Sans", category: "sans" },
  { family: "Lato", category: "sans" },
  { family: "Montserrat", category: "sans" },
  { family: "Poppins", category: "sans" },
  { family: "Nunito", category: "sans" },
  { family: "Raleway", category: "sans" },
  { family: "Rubik", category: "sans" },
  { family: "Work Sans", category: "sans" },
  { family: "Source Sans 3", category: "sans" },
  { family: "Oswald", category: "sans" },
  { family: "PT Sans", category: "sans" },
  { family: "Noto Sans", category: "sans" },
  { family: "Ubuntu", category: "sans" },
  { family: "Mukta", category: "sans" },
  { family: "Roboto Condensed", category: "sans" },
  { family: "Karla", category: "sans" },
  { family: "Manrope", category: "sans" },
  { family: "DM Sans", category: "sans" },

  // Serifada
  { family: "Roboto Slab", category: "serif" },
  { family: "Playfair Display", category: "serif" },
  { family: "Merriweather", category: "serif" },
  { family: "Lora", category: "serif" },
  { family: "PT Serif", category: "serif" },
  { family: "Crimson Text", category: "serif" },
  { family: "Libre Baskerville", category: "serif" },
  { family: "EB Garamond", category: "serif" },
  { family: "Cormorant Garamond", category: "serif" },
  { family: "Bitter", category: "serif" },
  { family: "Noto Serif", category: "serif" },
  { family: "Domine", category: "serif" },

  // Monoespaçada
  { family: "Roboto Mono", category: "mono" },
  { family: "Source Code Pro", category: "mono" },
  { family: "JetBrains Mono", category: "mono" },
  { family: "IBM Plex Mono", category: "mono" },
  { family: "Space Mono", category: "mono" },
  { family: "Fira Code", category: "mono" },
  { family: "Courier Prime", category: "mono" },

  // Destaque / display
  { family: "Bebas Neue", category: "display" },
  { family: "Anton", category: "display" },
  { family: "Archivo Black", category: "display" },
  { family: "Righteous", category: "display" },
  { family: "Comfortaa", category: "display" },
  { family: "Quicksand", category: "display" },
  { family: "Abril Fatface", category: "display" },

  // Manuscrita
  { family: "Pacifico", category: "handwriting" },
  { family: "Dancing Script", category: "handwriting" },
  { family: "Caveat", category: "handwriting" },
  { family: "Shadows Into Light", category: "handwriting" },
  { family: "Sacramento", category: "handwriting" },
  { family: "Satisfy", category: "handwriting" },
  { family: "Permanent Marker", category: "handwriting" },
];

// Compatibilidade com configs salvas antes do buscador existir, quando
// só havia 4 opções fixas com nomes internos em vez do nome real da fonte.
const LEGACY_FONT_MAP = {
  roboto: "Roboto",
  inter: "Inter",
  serif: "Roboto Slab",
  mono: "Roboto Mono",
};

function normalizeFontFamily(value) {
  if (!value) return "Roboto";
  return LEGACY_FONT_MAP[value] || value;
}

function searchFonts(query) {
  const q = (query || "").trim().toLowerCase();
  if (!q) return FONT_LIST.slice(0, 8);
  return FONT_LIST.filter((f) => f.family.toLowerCase().includes(q)).slice(0, 8);
}

const _loadedFonts = new Set();

function loadGoogleFont(family) {
  if (!family || _loadedFonts.has(family)) return;
  _loadedFonts.add(family);
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family).replace(/%20/g, "+")}:wght@400;600;700&display=swap`;
  document.head.appendChild(link);
}
