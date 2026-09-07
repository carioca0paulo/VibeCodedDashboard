import json
import os
import secrets
import urllib.parse
import urllib.request
from functools import wraps

from flask import Flask, jsonify, request, send_from_directory, render_template, session, redirect, url_for
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MEDIA_DIR = os.path.join(BASE_DIR, "static", "media")
CONFIG_PATH = os.path.join(BASE_DIR, "config.json")
AUTH_PATH = os.path.join(BASE_DIR, "auth.json")
SECRET_KEY_PATH = os.path.join(BASE_DIR, ".flask_secret")

IMAGE_EXT = {".jpg", ".jpeg", ".png", ".gif", ".webp"}
VIDEO_EXT = {".mp4", ".webm", ".ogg"}
ALLOWED_EXT = IMAGE_EXT | VIDEO_EXT

app = Flask(__name__)
app.config["MAX_CONTENT_LENGTH"] = 2 * 1024 * 1024 * 1024  # 2GB por upload


def get_or_create_secret_key():
    if os.path.exists(SECRET_KEY_PATH):
        with open(SECRET_KEY_PATH, "r") as f:
            return f.read().strip()
    key = secrets.token_hex(32)
    with open(SECRET_KEY_PATH, "w") as f:
        f.write(key)
    return key


app.secret_key = get_or_create_secret_key()

DEFAULT_SECTION_NAME = "Principal"

DEFAULT_WIDGETS = {
    "clock":   {"enabled": True, "x": 82, "y": 88, "color": "#ffffff", "size": 1.0, "opacity": 1.0, "font": "roboto"},
    "date":    {"enabled": True, "x": 50, "y": 94, "color": "#ffffff", "size": 1.0, "opacity": 1.0, "font": "roboto"},
    "weather": {"enabled": True, "x": 14, "y": 10, "color": "#ffffff", "size": 1.0, "opacity": 1.0, "font": "roboto", "icon_style": "svg"},
}


def new_section(name=DEFAULT_SECTION_NAME):
    return {
        "name": name,
        "background_files": [],
        "playback_order": "sequential",
        "image_duration_seconds": 8,
        "orientation": "landscape",       # "landscape" ou "portrait"
        "display_mode": "compatibility",  # "compatibility" ou "modern"
        "language": "pt",
        "latitude": -7.115,
        "longitude": -34.86,
        "location_name": "João Pessoa",
        "refresh_seconds": 30,
        "widgets": json.loads(json.dumps(DEFAULT_WIDGETS)),
    }


DEFAULT_ROOT_CONFIG = {
    "admin_language": "pt",
    "sections": {},
}


def deep_merge(default, override):
    result = dict(default)
    for key, value in override.items():
        if isinstance(value, dict) and isinstance(result.get(key), dict):
            result[key] = deep_merge(result[key], value)
        else:
            result[key] = value
    return result


def _migrate_legacy_config(data):
    """Configs de versões antigas guardavam tudo direto na raiz (sem
    'sections'). Se detectarmos esse formato, criamos uma seção única
    'principal' com o que já existia, pra não perder a configuração."""
    if "sections" in data:
        return data

    legacy_widgets = data.get("widgets", {})
    migrated_widgets = json.loads(json.dumps(DEFAULT_WIDGETS))
    for key in ("clock", "date", "weather"):
        old = legacy_widgets.get(key, {})
        w = migrated_widgets[key]
        w["enabled"] = old.get("enabled", w["enabled"])
        w["color"] = old.get("color", w["color"])
        w["size"] = old.get("size", w["size"])
        # posições antigas eram nomes fixos (ex: "bottom-right"); convertemos
        # pro x/y mais próximo, já que agora é tudo arrastável.
        legacy_pos = old.get("position")
        pos_map = {
            "top-left": (14, 10), "top-center": (50, 10), "top-right": (86, 10),
            "middle-left": (14, 50), "center": (50, 50), "middle-right": (86, 50),
            "bottom-left": (14, 90), "bottom-center": (50, 90), "bottom-right": (86, 90),
        }
        if legacy_pos in pos_map:
            w["x"], w["y"] = pos_map[legacy_pos]

    section = new_section(DEFAULT_SECTION_NAME)
    section.update({
        "background_files": data.get("background_files", []),
        "playback_order": data.get("playback_order", "sequential"),
        "image_duration_seconds": data.get("image_duration_seconds", 8),
        "language": data.get("language", "pt"),
        "latitude": data.get("latitude", section["latitude"]),
        "longitude": data.get("longitude", section["longitude"]),
        "location_name": data.get("location_name", section["location_name"]),
        "refresh_seconds": data.get("refresh_seconds", 30),
        "widgets": migrated_widgets,
    })

    return {
        "admin_language": data.get("language", "pt"),
        "sections": {"principal": section},
    }


def load_root_config():
    if not os.path.exists(CONFIG_PATH):
        root = dict(DEFAULT_ROOT_CONFIG)
        root["sections"] = {"principal": new_section()}
        save_root_config(root)
        return root

    with open(CONFIG_PATH, "r", encoding="utf-8") as f:
        data = json.load(f)

    was_legacy = "sections" not in data
    data = _migrate_legacy_config(data)
    root = deep_merge(DEFAULT_ROOT_CONFIG, data)

    if not root["sections"]:
        root["sections"] = {"principal": new_section()}

    if was_legacy:
        save_root_config(root)  # persiste a migração imediatamente

    return root


def save_root_config(root):
    with open(CONFIG_PATH, "w", encoding="utf-8") as f:
        json.dump(root, f, ensure_ascii=False, indent=2)


def get_section(section_id):
    root = load_root_config()
    raw = root["sections"].get(section_id)
    if raw is None:
        return None
    merged = deep_merge(new_section(raw.get("name", DEFAULT_SECTION_NAME)), raw)
    merged["widgets"] = deep_merge(DEFAULT_WIDGETS, raw.get("widgets", {}))
    return merged


def save_section(section_id, updates):
    root = load_root_config()
    if section_id not in root["sections"]:
        return False
    current = get_section(section_id)
    current.update(updates)
    root["sections"][section_id] = current
    save_root_config(root)
    return True


def list_sections():
    root = load_root_config()
    return [{"id": sid, "name": s.get("name", DEFAULT_SECTION_NAME)} for sid, s in root["sections"].items()]


def create_section(name):
    root = load_root_config()
    section_id = secrets.token_hex(4)
    root["sections"][section_id] = new_section(name or DEFAULT_SECTION_NAME)
    save_root_config(root)
    return section_id


def rename_section(section_id, name):
    root = load_root_config()
    if section_id not in root["sections"]:
        return False
    root["sections"][section_id]["name"] = name
    save_root_config(root)
    return True


def delete_section(section_id):
    root = load_root_config()
    if section_id not in root["sections"] or len(root["sections"]) <= 1:
        return False
    del root["sections"][section_id]
    save_root_config(root)
    return True


def list_media():
    items = []
    if not os.path.isdir(MEDIA_DIR):
        return items
    for name in sorted(os.listdir(MEDIA_DIR)):
        ext = os.path.splitext(name)[1].lower()
        if ext in IMAGE_EXT:
            items.append({"file": name, "type": "image"})
        elif ext in VIDEO_EXT:
            items.append({"file": name, "type": "video"})
    return items


# ---------------------------------------------------------------------
# Autenticação
# ---------------------------------------------------------------------

def load_auth():
    if not os.path.exists(AUTH_PATH):
        return None
    with open(AUTH_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


def save_auth(username, password):
    data = {"username": username, "password_hash": generate_password_hash(password)}
    with open(AUTH_PATH, "w", encoding="utf-8") as f:
        json.dump(data, f)


def is_logged_in():
    return session.get("logged_in") is True


def login_required(view):
    @wraps(view)
    def wrapped(*args, **kwargs):
        if load_auth() is None:
            return redirect(url_for("setup"))
        if not is_logged_in():
            return redirect(url_for("login", next=request.path))
        return view(*args, **kwargs)
    return wrapped


@app.route("/setup", methods=["GET", "POST"])
def setup():
    if load_auth() is not None:
        return redirect(url_for("login"))

    error = None
    if request.method == "POST":
        username = request.form.get("username", "").strip()
        password = request.form.get("password", "")
        confirm = request.form.get("confirm", "")

        if not username or not password:
            error = "missing_fields"
        elif password != confirm:
            error = "passwords_mismatch"
        elif len(password) < 4:
            error = "password_too_short"
        else:
            save_auth(username, password)
            session.permanent = True
            session["logged_in"] = True
            session["username"] = username
            return redirect(url_for("admin"))

    return render_template("setup.html", error=error)


@app.route("/login", methods=["GET", "POST"])
def login():
    auth = load_auth()
    if auth is None:
        return redirect(url_for("setup"))

    error = None
    if request.method == "POST":
        username = request.form.get("username", "").strip()
        password = request.form.get("password", "")
        if username == auth.get("username") and check_password_hash(auth.get("password_hash", ""), password):
            session.permanent = True
            session["logged_in"] = True
            session["username"] = username
            next_url = request.args.get("next") or url_for("admin")
            return redirect(next_url)
        error = "invalid_credentials"

    return render_template("login.html", error=error)


@app.route("/logout")
def logout():
    session.clear()
    return redirect(url_for("login"))


# ---------------------------------------------------------------------
# Páginas
# ---------------------------------------------------------------------

@app.route("/")
def index():
    return render_template("index.html")


@app.route("/admin")
@login_required
def admin():
    return render_template("admin.html", username=session.get("username"))


# ---------------------------------------------------------------------
# API - configuração raiz (idioma do painel admin)
# ---------------------------------------------------------------------

@app.route("/api/config", methods=["GET", "POST"])
def api_root_config():
    root = load_root_config()
    if request.method == "POST":
        if load_auth() is None or not is_logged_in():
            return jsonify({"ok": False, "error": "não autenticado"}), 401
        incoming = request.get_json(force=True)
        if "admin_language" in incoming:
            root["admin_language"] = incoming["admin_language"]
            save_root_config(root)
        return jsonify({"ok": True, "admin_language": root["admin_language"]})
    return jsonify({"admin_language": root["admin_language"]})


# ---------------------------------------------------------------------
# API - seções (perfis de dispositivo)
# ---------------------------------------------------------------------

@app.route("/api/sections", methods=["GET", "POST"])
def api_sections():
    if request.method == "POST":
        if load_auth() is None or not is_logged_in():
            return jsonify({"ok": False, "error": "não autenticado"}), 401
        data = request.get_json(force=True) or {}
        name = (data.get("name") or "").strip() or DEFAULT_SECTION_NAME
        section_id = create_section(name)
        return jsonify({"ok": True, "id": section_id, "name": name})
    return jsonify(list_sections())


@app.route("/api/sections/<section_id>", methods=["PUT", "DELETE"])
@login_required
def api_section_detail(section_id):
    if request.method == "DELETE":
        ok = delete_section(section_id)
        if not ok:
            return jsonify({"ok": False, "error": "não é possível excluir a única seção"}), 400
        return jsonify({"ok": True})

    data = request.get_json(force=True) or {}
    name = (data.get("name") or "").strip()
    if not name:
        return jsonify({"ok": False, "error": "nome vazio"}), 400
    ok = rename_section(section_id, name)
    if not ok:
        return jsonify({"ok": False, "error": "seção não encontrada"}), 404
    return jsonify({"ok": True})


@app.route("/api/config/<section_id>", methods=["GET", "POST"])
def api_section_config(section_id):
    if request.method == "POST":
        if load_auth() is None or not is_logged_in():
            return jsonify({"ok": False, "error": "não autenticado"}), 401
        incoming = request.get_json(force=True)
        ok = save_section(section_id, incoming)
        if not ok:
            return jsonify({"ok": False, "error": "seção não encontrada"}), 404
        return jsonify({"ok": True, "config": get_section(section_id)})

    section = get_section(section_id)
    if section is None:
        return jsonify({"error": "seção não encontrada"}), 404
    return jsonify(section)


@app.route("/manifest.json")
def manifest():
    section_id = request.args.get("section")
    orientation = "landscape"
    if section_id:
        section = get_section(section_id)
        if section:
            orientation = section.get("orientation", "landscape")
    return jsonify({
        "name": "Dashboard",
        "short_name": "Dashboard",
        "start_url": "/" + (f"?section={section_id}" if section_id else ""),
        "display": "fullscreen",
        "orientation": orientation,
        "background_color": "#000000",
        "theme_color": "#000000",
    })


@app.route("/api/weather")
def api_weather():
    """
    Busca o clima atual e devolve via HTTP simples (mesma origem). Rota
    pública de propósito: o Android 5 não consegue fazer HTTPS direto de
    forma confiável, então é o servidor quem busca.
    """
    try:
        lat = float(request.args.get("lat"))
        lon = float(request.args.get("lon"))
    except (TypeError, ValueError):
        return jsonify({"ok": False, "error": "latitude/longitude inválidas"})

    url = "https://api.open-meteo.com/v1/forecast?" + urllib.parse.urlencode(
        {"latitude": lat, "longitude": lon, "current_weather": "true"}
    )
    try:
        with urllib.request.urlopen(url, timeout=8) as resp:
            data = json.loads(resp.read().decode("utf-8"))
        current = data.get("current_weather", {})
        return jsonify({
            "ok": True,
            "temperature": current.get("temperature"),
            "weathercode": current.get("weathercode"),
        })
    except Exception as e:
        return jsonify({"ok": False, "error": str(e)})


# ---------------------------------------------------------------------
# API - mídias (biblioteca compartilhada entre todas as seções)
# ---------------------------------------------------------------------

@app.route("/api/media")
@login_required
def api_media():
    return jsonify(list_media())


@app.route("/api/media/upload", methods=["POST"])
@login_required
def api_media_upload():
    files = request.files.getlist("files")
    if not files:
        return jsonify({"ok": False, "error": "nenhum arquivo enviado"}), 400

    os.makedirs(MEDIA_DIR, exist_ok=True)
    saved, skipped = [], []

    for f in files:
        if not f.filename:
            continue
        filename = secure_filename(f.filename)
        ext = os.path.splitext(filename)[1].lower()
        if ext not in ALLOWED_EXT:
            skipped.append(f.filename)
            continue

        base, ext2 = os.path.splitext(filename)
        dest = os.path.join(MEDIA_DIR, filename)
        counter = 1
        while os.path.exists(dest):
            filename = f"{base}_{counter}{ext2}"
            dest = os.path.join(MEDIA_DIR, filename)
            counter += 1

        f.save(dest)
        saved.append(filename)

    return jsonify({"ok": True, "saved": saved, "skipped": skipped})


@app.route("/api/media/<path:filename>", methods=["DELETE"])
@login_required
def api_media_delete(filename):
    filename = secure_filename(filename)
    path = os.path.join(MEDIA_DIR, filename)
    if os.path.exists(path):
        os.remove(path)
        return jsonify({"ok": True})
    return jsonify({"ok": False, "error": "arquivo não encontrado"}), 404


@app.route("/api/geocode")
@login_required
def api_geocode():
    city = request.args.get("city", "").strip()
    if not city:
        return jsonify({"results": []})

    url = "https://geocoding-api.open-meteo.com/v1/search?" + urllib.parse.urlencode(
        {"name": city, "count": 5, "language": "pt"}
    )
    try:
        with urllib.request.urlopen(url, timeout=6) as resp:
            data = json.loads(resp.read().decode("utf-8"))
        results = [
            {
                "name": r.get("name"),
                "admin1": r.get("admin1", ""),
                "country": r.get("country", ""),
                "latitude": r.get("latitude"),
                "longitude": r.get("longitude"),
            }
            for r in data.get("results", []) or []
        ]
        return jsonify({"results": results})
    except Exception as e:
        return jsonify({"results": [], "error": str(e)})


@app.route("/static/media/<path:filename>")
def media_file(filename):
    return send_from_directory(MEDIA_DIR, filename)


if __name__ == "__main__":
    os.makedirs(MEDIA_DIR, exist_ok=True)
    load_root_config()  # garante que config.json exista/seja migrado

    print("\nDashboard running!")
    print("PC/server: http://localhost:5000")
    print("Mobile (same Wi-Fi network): http://<SERVER_IP>:5000")
    print("Control panel: http://<SERVER_IP>:5000/admin\n")

    try:
        from waitress import serve
        print("(using waitress, suitable for running continuously)\n")
        serve(app, host="0.0.0.0", port=5000)
    except ImportError:
        app.run(host="0.0.0.0", port=5000, debug=False)
