/* Dicionário de traduções compartilhado por todas as páginas.
   Uso: aplicar via [data-i18n="chave"] (textContent), [data-i18n-placeholder="chave"]
   (atributo placeholder) e [data-i18n-title="chave"] (atributo title), chamando
   applyTranslations(lang) depois que a página carregar. Para texto gerado
   dinamicamente em JS, use t(lang, "chave"). */

const TRANSLATIONS = {
  pt: {
    // Geral
    app_title: "Painel · Dashboard",
    fullscreen_title: "Tela cheia",
    offline_suffix: " (offline)",

    // Rail / navegação
    rail_eyebrow: "Painel",
    rail_title: "Controle do dashboard",
    preview_label: "O que aparece na tela",
    nav_media: "Mídias",
    nav_widgets: "Widgets",
    nav_location: "Localização",
    rail_open_link: "Abrir o dashboard →",
    logout_link: "Sair",
    dark_mode_label: "Tema escuro",
    language_label: "Idioma",

    // Seções (perfis de dispositivo)
    nav_section: "Seção",
    section_switch_label: "Editando",
    new_section_btn: "+ Nova seção",
    rename_section_btn: "Renomear",
    delete_section_btn: "Excluir seção",
    new_section_prompt: "Nome da nova seção (ex: Quarto, Sala, Cozinha):",
    rename_section_prompt: "Novo nome para esta seção:",
    delete_section_confirm: 'Excluir a seção "{name}"? Isso apaga a configuração dela — as mídias continuam na biblioteca.',
    delete_last_section_error: "Não é possível excluir a única seção que existe.",
    section_name_label: "Nome desta seção",
    section_language_label: "Idioma desta tela",
    choose_device_title: "Qual tela é essa?",
    choose_device_subtitle: "Escolha a seção que este aparelho deve mostrar.",
    change_section_link: "Trocar dispositivo",

    // Orientação e modo de exibição
    orientation_label: "Orientação",
    orientation_landscape: "Paisagem",
    orientation_portrait: "Retrato",
    display_mode_label: "Modo de exibição",
    mode_compatibility: "Compatibilidade",
    mode_modern: "Moderno",
    mode_compatibility_hint: "Fontes simples, sem emoji — recomendado para celulares mais antigos.",
    mode_modern_hint: "Fontes, emoji e opacidade personalizáveis — para aparelhos mais novos.",
    drag_hint: "Arraste os widgets na pré-visualização abaixo para posicioná-los na tela.",
    opacity_label: "Opacidade",
    font_label: "Fonte",
    font_roboto: "Padrão (Roboto)",
    font_inter: "Inter",
    font_serif: "Serifa",
    font_mono: "Monoespaçada",
    font_search_placeholder: "Buscar fonte...",
    font_no_results: "Nenhuma fonte encontrada.",
    icon_style_label: "Ícones do clima",
    icon_style_svg: "Desenhado (compatível)",
    icon_style_emoji: "Emoji",

    // Seção Mídias
    media_h2: "Mídias",
    media_note: "Envie fotos e vídeos abaixo, depois marque quais entram na playlist. Quando um termina, o próximo entra sozinho.",
    media_upload_h3: "Enviar novas mídias",
    dropzone_text: "Arraste fotos/vídeos aqui, ou",
    dropzone_browse: "escolha os arquivos",
    media_available_h3: "Disponíveis",
    refresh_media_btn: "Atualizar lista",
    media_empty: "Nenhuma foto/vídeo encontrado ainda. Envie algo acima.",
    order_h3: "Ordem de reprodução",
    order_empty: "Nenhuma mídia selecionada ainda — marque acima.",
    order_label: "Ordem",
    order_sequential: "Sequencial",
    order_random: "Aleatória",
    duration_label: "Duração de cada foto",
    seconds_label: "segundos",
    video_duration_hint: "Vídeos tocam até o fim, independente dessa duração.",
    delete_confirm: 'Excluir "{name}" do servidor? Isso não pode ser desfeito.',
    delete_error: "Não foi possível excluir o arquivo.",

    // Upload
    uploading_msg: "Enviando {n} arquivo(s)...",
    upload_success_msg: "{n} arquivo(s) enviado(s) com sucesso.",
    upload_skipped_msg: " {n} ignorado(s) (formato não suportado).",
    upload_error_msg: "Erro ao enviar. Tente novamente.",
    upload_conn_error_msg: "Erro de conexão ao enviar.",

    // Seção Widgets
    widgets_h2: "Widgets",
    widgets_note: "Mostrar, posicionar, colorir e redimensionar cada informação na tela.",
    widget_clock: "Relógio",
    widget_date: "Data",
    widget_weather: "Clima",
    position_label: "Posição",
    color_label: "Cor",
    size_label: "Tamanho",

    pos_top_left: "Superior Esquerda",
    pos_top_center: "Superior Centro",
    pos_top_right: "Superior Direita",
    pos_middle_left: "Meio Esquerda",
    pos_center: "Centro",
    pos_middle_right: "Meio Direita",
    pos_bottom_left: "Inferior Esquerda",
    pos_bottom_center: "Inferior Centro",
    pos_bottom_right: "Inferior Direita",

    // Seção Localização
    location_h2: "Localização",
    location_note: "Usada para buscar o clima correto.",
    city_label: "Cidade",
    city_placeholder: "Ex: João Pessoa",
    search_btn: "Buscar",
    searching_msg: "Buscando...",
    city_not_found_msg: "Nenhuma cidade encontrada. Tente outro nome.",
    city_search_error_msg: "Erro ao buscar. Verifique a internet do servidor.",
    current_location_label: "Local atual:",
    advanced_summary: "Avançado — latitude/longitude manual",
    latitude_label: "Latitude",
    longitude_label: "Longitude",
    use_pc_location_btn: "Usar localização deste computador",
    geo_unavailable_msg: "Geolocalização não disponível neste navegador.",
    geo_failed_msg: "Não foi possível obter a localização.",

    // Barra de salvar
    save_hint: "O celular atualiza sozinho em até 30 segundos depois de salvar.",
    save_btn: "Salvar alterações",
    saved_msg: "Salvo ✓",
    save_error_msg: "Erro ao salvar",

    // Setup
    setup_eyebrow: "Primeiro acesso",
    setup_title: "Crie o acesso ao painel",
    setup_note: "Isso protege só a configuração — o dashboard em si continua visível normalmente no celular. Você faz isso uma vez só.",
    username_label: "Usuário",
    password_label: "Senha",
    confirm_password_label: "Confirmar senha",
    setup_submit_btn: "Criar acesso e entrar",

    // Login
    login_title: "Entrar",
    login_submit_btn: "Entrar",
    login_forgot_hint: 'Esqueceu a senha? Apague o arquivo <code>auth.json</code> no servidor e configure de novo.',

    // Erros (chaves vindas do servidor)
    err_missing_fields: "Preencha usuário e senha.",
    err_passwords_mismatch: "As senhas não coincidem.",
    err_password_too_short: "Use uma senha com pelo menos 4 caracteres.",
    err_invalid_credentials: "Usuário ou senha incorretos.",
  },

  en: {
    app_title: "Panel · Dashboard",
    fullscreen_title: "Fullscreen",
    offline_suffix: " (offline)",

    rail_eyebrow: "Panel",
    rail_title: "Dashboard control",
    preview_label: "What shows on screen",
    nav_media: "Media",
    nav_widgets: "Widgets",
    nav_location: "Location",
    rail_open_link: "Open the dashboard →",
    logout_link: "Log out",
    dark_mode_label: "Dark theme",
    language_label: "Language",

    nav_section: "Section",
    section_switch_label: "Editing",
    new_section_btn: "+ New section",
    rename_section_btn: "Rename",
    delete_section_btn: "Delete section",
    new_section_prompt: "Name of the new section (e.g. Bedroom, Living room, Kitchen):",
    rename_section_prompt: "New name for this section:",
    delete_section_confirm: 'Delete section "{name}"? This removes its settings — media stays in the library.',
    delete_last_section_error: "You can't delete the only section that exists.",
    section_name_label: "This section's name",
    section_language_label: "This screen's language",
    choose_device_title: "Which screen is this?",
    choose_device_subtitle: "Choose the section this device should show.",
    change_section_link: "Switch device",

    orientation_label: "Orientation",
    orientation_landscape: "Landscape",
    orientation_portrait: "Portrait",
    display_mode_label: "Display mode",
    mode_compatibility: "Compatibility",
    mode_modern: "Modern",
    mode_compatibility_hint: "Simple fonts, no emoji — recommended for older phones.",
    mode_modern_hint: "Customizable fonts, emoji and opacity — for newer devices.",
    drag_hint: "Drag the widgets in the preview below to position them on screen.",
    opacity_label: "Opacity",
    font_label: "Font",
    font_roboto: "Default (Roboto)",
    font_inter: "Inter",
    font_serif: "Serif",
    font_mono: "Monospace",
    font_search_placeholder: "Search fonts...",
    font_no_results: "No fonts found.",
    icon_style_label: "Weather icons",
    icon_style_svg: "Drawn (compatible)",
    icon_style_emoji: "Emoji",

    media_h2: "Media",
    media_note: "Upload photos and videos below, then check which ones join the playlist. When one ends, the next one starts on its own.",
    media_upload_h3: "Upload new media",
    dropzone_text: "Drag photos/videos here, or",
    dropzone_browse: "choose files",
    media_available_h3: "Available",
    refresh_media_btn: "Refresh list",
    media_empty: "No photo/video found yet. Upload something above.",
    order_h3: "Playback order",
    order_empty: "No media selected yet — check the items above.",
    order_label: "Order",
    order_sequential: "Sequential",
    order_random: "Random",
    duration_label: "Duration per photo",
    seconds_label: "seconds",
    video_duration_hint: "Videos play to the end, regardless of this duration.",
    delete_confirm: 'Delete "{name}" from the server? This cannot be undone.',
    delete_error: "Could not delete the file.",

    uploading_msg: "Uploading {n} file(s)...",
    upload_success_msg: "{n} file(s) uploaded successfully.",
    upload_skipped_msg: " {n} skipped (unsupported format).",
    upload_error_msg: "Upload failed. Please try again.",
    upload_conn_error_msg: "Connection error while uploading.",

    widgets_h2: "Widgets",
    widgets_note: "Show, position, color and resize each piece of information on screen.",
    widget_clock: "Clock",
    widget_date: "Date",
    widget_weather: "Weather",
    position_label: "Position",
    color_label: "Color",
    size_label: "Size",

    pos_top_left: "Top Left",
    pos_top_center: "Top Center",
    pos_top_right: "Top Right",
    pos_middle_left: "Middle Left",
    pos_center: "Center",
    pos_middle_right: "Middle Right",
    pos_bottom_left: "Bottom Left",
    pos_bottom_center: "Bottom Center",
    pos_bottom_right: "Bottom Right",

    location_h2: "Location",
    location_note: "Used to look up the correct weather.",
    city_label: "City",
    city_placeholder: "E.g. London",
    search_btn: "Search",
    searching_msg: "Searching...",
    city_not_found_msg: "No city found. Try another name.",
    city_search_error_msg: "Search failed. Check the server's internet connection.",
    current_location_label: "Current location:",
    advanced_summary: "Advanced — manual latitude/longitude",
    latitude_label: "Latitude",
    longitude_label: "Longitude",
    use_pc_location_btn: "Use this computer's location",
    geo_unavailable_msg: "Geolocation isn't available in this browser.",
    geo_failed_msg: "Could not get your location.",

    save_hint: "The phone updates itself within 30 seconds after saving.",
    save_btn: "Save changes",
    saved_msg: "Saved ✓",
    save_error_msg: "Error saving",

    setup_eyebrow: "First-time setup",
    setup_title: "Create panel access",
    setup_note: "This only protects the configuration — the dashboard itself stays visible on the phone as normal. You only do this once.",
    username_label: "Username",
    password_label: "Password",
    confirm_password_label: "Confirm password",
    setup_submit_btn: "Create access and log in",

    login_title: "Log in",
    login_submit_btn: "Log in",
    login_forgot_hint: 'Forgot your password? Delete the <code>auth.json</code> file on the server and set it up again.',

    err_missing_fields: "Please fill in username and password.",
    err_passwords_mismatch: "Passwords don't match.",
    err_password_too_short: "Use a password with at least 4 characters.",
    err_invalid_credentials: "Incorrect username or password.",
  },
};

function t(lang, key, vars) {
  const dict = TRANSLATIONS[lang] || TRANSLATIONS.pt;
  let str = dict[key] !== undefined ? dict[key] : (TRANSLATIONS.pt[key] || key);
  if (vars) {
    Object.keys(vars).forEach((k) => {
      str = str.replace(`{${k}}`, vars[k]);
    });
  }
  return str;
}

function applyTranslations(lang) {
  document.documentElement.lang = lang === "en" ? "en" : "pt-br";

  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    el.innerHTML = t(lang, key);
  });
  document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
    el.placeholder = t(lang, el.getAttribute("data-i18n-placeholder"));
  });
  document.querySelectorAll("[data-i18n-title]").forEach((el) => {
    el.title = t(lang, el.getAttribute("data-i18n-title"));
  });

  const titleKey = document.querySelector("title")?.getAttribute("data-i18n-title-tag");
  if (titleKey) document.title = t(lang, titleKey);
}

/* Aplica o tema salvo o quanto antes (chamado inline no <head>, antes do CSS
   pintar, pra evitar um "flash" do tema errado). */
function applySavedTheme() {
  const theme = localStorage.getItem("admin_theme") || "light";
  document.documentElement.setAttribute("data-theme", theme);
  return theme;
}
