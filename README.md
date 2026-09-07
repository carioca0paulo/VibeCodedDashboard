# VibeCodedDashboard

[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)

> **A vibe-coded project for giving old Android devices a second life.**

VibeCodedDashboard is a lightweight, self-hosted dashboard designed to turn old Android devices — especially devices running **Android 5.x and older WebViews (or any device with a browser really)** — into customizable digital displays.

It can display photos, videos, a clock, date, and weather information while being centrally managed from another computer on the same local network.

The project was originally created for a very personal reason:

**I had some old Android devices sitting around at home that were no longer particularly useful, and I wanted to give them a second life instead of letting them collect dust.**

The server was designed primarily to run on a **Raspberry Pi Zero 2 W**, using native Python as a `systemd` service. However, it can also run on practically any machine capable of running Python.

---

# 🤖 Yes, this project is Vibe Coded

Let me be VERY clear:

**This project was vibe coded.**

VibeCodedDashboard was developed using **AI-assisted development, rapid iteration, experimentation, testing, and a lot of "let's see if this works" engineering.**

This isn't something I'm trying to hide.

The goal was not to demonstrate perfect software architecture or follow every conventional software engineering practice.

The goal was much simpler:

> **Have an idea → build it → put it on extremely old hardware → see what breaks → fix it → add another idea → repeat.**

And honestly, that's part of the fun.

Some parts of the project are surprisingly polished.

Some parts are definitely:

> **"It works. Don't touch it."** 

That's intentional.

This is a **personal experimental project**, not enterprise software.

If you're looking for a perfectly engineered production dashboard, this probably isn't it.

If you're looking for a weird little project that can make a 10+ year-old device useful again, you're in the right place.

---

# 🎯 Why does this project exist?

The original motivation was simple: **reusing old hardware**.

I had several old Android devices running Android 5 that were too limited for modern applications.

Instead of throwing them away or leaving them forgotten in a drawer, I wanted to find something useful they could still do.

A dashboard turned out to be a perfect use case.

The Android device doesn't need to run a modern application.

It only needs to display a web page.

The heavier work can happen somewhere else — in my case, a Raspberry Pi Zero 2 W.

This creates a simple architecture:

```text
                    ┌─────────────────────────┐
                    │   Raspberry Pi Zero 2 W │
                    │                         │
                    │   Python + Flask        │
                    │   Dashboard Server      │
                    └────────────┬────────────┘
                                 │
                           Local Network
                                 │
                ┌────────────────┼────────────────┐
                │                │                │
                ▼                ▼                ▼
          ┌──────────┐     ┌──────────┐     ┌──────────┐
          │ Old      │     │ Old      │     │ Tablet   │
          │ Android  │     │ Android  │     │ / Phone  │
          │ Device   │     │ Device   │     │          │
          └──────────┘     └──────────┘     └──────────┘
```

One server can therefore control multiple displays, with each device having its own configuration.

---

# ✨ Features

* 📱 Designed with **Android 5.x compatibility** in mind
* 🖼️ Full-screen photo backgrounds
* 🎥 Video backgrounds and playlists
* 🕐 Customizable clock
* 📅 Date widget
* 🌤️ Weather widget
* 🖱️ Drag-and-drop widget positioning
* 🎨 Individual widget colors and sizes
* 📐 Portrait and landscape orientations
* 🖥️ Multiple independent displays/devices
* 🗂️ Per-device sections and playlists
* 🌎 Per-device language settings
* 🌓 Light/dark theme for the administration panel
* 🔤 Compatibility and Modern display modes
* 🔎 Searchable Google Fonts library in Modern mode
* 🔐 Password-protected administration panel
* 🌐 Local-network operation
* 🍓 Raspberry Pi Zero 2 W friendly
* 🐳 Optional Docker support

---

# 🏗️ How it works

The application consists of a lightweight Python web server and browser-based dashboards.

The server runs `server.py` and provides:

* The dashboard displayed by Android devices
* The administration panel
* Media storage
* Configuration management
* Weather data
* Authentication for the administration interface

Each physical display is represented by a **section**.

(Note: Multiple devices can share the same section withou problems too!!)

A section is an independent profile containing its own:

* Media playlist
* Widgets
* Widget positions
* Orientation
* Display mode
* Language
* Weather location

For example:

```text
VibeCodedDashboard
│
├── Living Room
│   ├── Family photos
│   ├── Clock
│   └── Weather
│
├── Bedroom
│   ├── Ambient video
│   ├── Clock
│   └── Date
│
└── Office
    ├── Different playlist
    ├── Weather
    └── Clock
```

Uploaded media is stored in a shared library, while each section determines which media files belong to its playlist.

---

# 🖥️ Administration Panel

Configuration is handled through:

```text
/admin
```

The administration panel is protected by a login.

The actual display dashboard remains accessible without authentication.

This is intentional: devices used only as displays should not be forced to interact with a login screen.

The administration panel allows you to manage:

* Display sections
* Media
* Widgets
* Widget positions
* Orientation
* Display mode
* Language
* Weather location
* Authentication

---

# 📱 Multiple Devices

When a device opens the dashboard for the first time and multiple sections exist, it can select which section that device will use.

The selection is stored by the browser, so the device doesn't need to select itself every time.

A small **"Switch Device"** option is available if the device needs to be reassigned.

This makes it possible to have several old phones or tablets connected to the same server while each one displays completely different content.

---

# 🧩 Widgets

Widgets can be positioned visually using drag and drop.

Currently supported widgets include:

* **Clock**
* **Date**
* **Weather**

Each widget can have its own:

* Position
* Size
* Color

The administration panel includes a live preview so the layout can be configured without constantly checking the physical device.

---

# 📐 Orientation

Each section can independently use:

* Landscape
* Portrait

The preview automatically adapts to the selected orientation.

The orientation is also reflected in the page manifest, which helps when adding the dashboard to the Android home screen.

---

# 🕰️ Display Modes

One of the main goals of this project is supporting devices that are **much older than the computers normally used to host modern web applications**.

For this reason, each section can use one of two display modes.

## Compatibility Mode

Compatibility Mode is the default and was specifically designed for older devices such as Android 5.

It intentionally avoids modern features that may cause problems on old browsers and WebViews.

It uses:

* Simple system fonts
* SVG weather icons instead of emoji
* 100% opacity
* Minimal browser dependencies

The idea is simple:

> **If an old Android browser can display basic HTML, CSS and JavaScript, it should have a reasonable chance of displaying this dashboard.**

## Modern Mode

Modern devices can use the more feature-rich Modern Mode.

It adds:

* Per-widget font selection
* Searchable Google Fonts library
* 50+ available fonts
* Adjustable opacity
* Optional emoji weather icons

Fonts are loaded only when needed instead of loading the entire font library.

This keeps Compatibility Mode lightweight and avoids unnecessary requests.

Both modes can coexist on the same server.

For example:

```text
Old Android 5 phone → Compatibility Mode
Modern tablet       → Modern Mode
```

---

# 🌎 Languages

The project separates the language of the administration panel from the language displayed by each dashboard.

## Administration Panel

The `/admin` interface supports:

* English
* Portuguese

Changing this setting only affects the administration interface.

## Dashboard

Each section can independently use its own language.

For example:

```text
Living Room → English
Bedroom     → Portuguese
Office      → English
```

---

# 🌓 Admin Theme

The administration panel supports a light/dark theme toggle.

This is only a preference for the browser used to access `/admin`.

It does **not** affect the appearance of the actual dashboard.

The display itself is intentionally dark, allowing photos and videos to act as the visual background without an additional bright interface surrounding them.

---

# 🖼️ Media

The media library supports:

### Images

```text
.jpg
.png
.gif
.webp
```

### Videos

```text
.mp4
.webm
.ogg
```

Files can be uploaded through the **Media** section of the administration panel.

Media can be dragged into the upload area or selected manually.

The library is shared between sections, while each section maintains its own playlist.

---

# 🌤️ Weather

Weather information is handled by the **server**, rather than directly by the Android device.

This is particularly important for older Android devices.

Old Android versions can have problems connecting directly to modern HTTPS APIs because of outdated certificates and TLS support.

Instead, the architecture looks like this:

```text
Android Device
       │
       │ Local Network
       ▼
Dashboard Server
       │
       │ HTTPS
       ▼
Weather Service
```

The server retrieves and manages the weather information.

If the server temporarily loses Internet access, the dashboard can continue displaying the last saved weather information and indicate that the weather data is offline.

The device therefore does not need to communicate directly with the external weather service.

---

# 🚀 Installation

## Requirements

At minimum:

* Python 3
* Flask
* Waitress
* Network connectivity between the server and display devices

Install the dependencies:

```bash
pip install flask waitress (or pip install -r requirements.txt)
```

Then start the server:

```bash
python server.py
```

If everything is working correctly, the server should report:

```text
Dashboard running!
```

---

# 🔑 First Access

Open:

```text
http://localhost:5000/admin
```

Or, when accessing from another device on the same network:

```text
http://YOUR_SERVER_IP:5000/admin
```

On the first access, the application will ask you to create an administrator username and password.

The authentication protects the administration panel.

The display dashboard itself remains accessible without authentication so old Android devices don't have to deal with a login screen.

---

# 📡 Connecting an Device

Make sure the device and server are connected to the same network.

Find the server's local IP address.

### Windows

```bash
ipconfig
```

### Linux / Raspberry Pi

```bash
ip a
```

Then open on the device's browser:

```text
http://YOUR_SERVER_IP:5000
```

For a better experience, use the browser's **Add to Home Screen** option or the dashboard's full-screen button.

On supported Android versions, you can also configure the device to prevent the screen from going to sleep.

---

# 🍓 Raspberry Pi Zero 2 W

The project was primarily designed to run on a **Raspberry Pi Zero 2 W**.

The server is intentionally lightweight.

The Raspberry Pi handles:

* Web serving
* Configuration
* Media serving
* Weather requests
* Dashboard logic

The device mainly acts as the display.

Typical memory usage is approximately **30–50 MB**, depending on the environment and workload, which fits comfortably within the Zero 2 W's 512 MB of RAM.

Running directly with Python also avoids the additional overhead and complexity of a Docker runtime.

---

## Running as a systemd service

Copy the project to the Raspberry Pi:

```bash
cd /home/pi/dashboard-app
```

Install dependencies:

```bash
pip3 install flask waitress
```

Install the service:

```bash
sudo cp dashboard.service /etc/systemd/system/dashboard.service
sudo systemctl daemon-reload
sudo systemctl enable dashboard
sudo systemctl start dashboard
```

If your username or project directory is different, edit the `User` and `WorkingDirectory` fields in `dashboard.service` before installing it.

---

## Useful commands

Check the service:

```bash
sudo systemctl status dashboard
```

Restart the server:

```bash
sudo systemctl restart dashboard
```

View live logs:

```bash
journalctl -u dashboard -f
```

Once enabled, the service will automatically start whenever the Raspberry Pi boots.

No terminal needs to remain open.

---

# 🐳 Docker

Docker support is included through:

```text
Dockerfile
docker-compose.yml
```

It can be started with:

```bash
docker compose up -d --build
```

However, **Docker is currently considered optional and is not the recommended deployment method.**

During development and testing, I encountered several issues with the Docker setup that I did not encounter when running the application directly with Python.

For the Raspberry Pi Zero 2 W use case, the native Python + systemd setup has been considerably more reliable.

If you decide to use Docker:

> **Use it at your own discretion.**

Check the comments in the Docker configuration files, especially regarding persistent volumes.

---

# ⚠️ Important Notes

## The server must be running

The devices are clients.

If the dashboard server is offline, the displays will not function normally.

## The dashboard is not designed to be exposed to the Internet

The `/admin` panel is protected by authentication, but the display dashboard is intentionally unauthenticated.

**Do not expose this server directly to the public Internet without properly understanding and addressing the security implications.**

This project was primarily designed for trusted local networks.

## Old Android browsers are limited

Compatibility Mode intentionally avoids modern browser features.

Modern Mode assumes a reasonably modern browser.

## Video playback on old Android devices

Older WebViews can behave inconsistently when using `video.play()` and when detecting the end of a video.

The project therefore includes fallback behavior based on a maximum playback time so playlists do not become permanently stuck when an old browser fails to report that a video has finished.

---

# 📁 Project Structure

```text
VibeCodedDashboard/
├── server.py
├── requirements.txt
├── dashboard.service
├── Dockerfile
├── docker-compose.yml
├── config.json
├── auth.json
├── .flask_secret
│
├── templates/
│   ├── index.html
│   ├── admin.html
│   ├── setup.html
│   └── login.html
│
└── static/
    ├── css/
    │   ├── style.css
    │   └── admin.css
    │
    ├── js/
    │   ├── display.js
    │   ├── admin.js
    │   └── i18n.js
    │
    └── media/
        └── ...
```

---

# 🔧 Technology

The project intentionally uses a relatively simple technology stack:

* **Python**
* **Flask**
* **Waitress**
* **HTML**
* **CSS**
* **JavaScript**
* **systemd** for Raspberry Pi deployment
* **Docker** as an optional deployment method

There is no native application.

The device acts as a browser-based display.

This is one of the main reasons the project can continue working on hardware that would otherwise be considered obsolete.

---

# 🧠 Project Philosophy

VibeCodedDashboard is ultimately a small personal project built around a simple idea:

> **Old hardware doesn't necessarily have to become useless hardware.**

A phone that can no longer run modern applications can still have:

* A good screen
* Wi-Fi
* A web browser
* A battery
* A charging port
* A perfectly usable display

By moving the heavier parts of the application to a Raspberry Pi or another computer, those devices can become useful again.

The project is therefore less about building the most advanced dashboard possible and more about:

**making old hardware useful with minimal requirements.**

---

# 🤖 Development Philosophy

This repository is intentionally open about its development process.

A significant portion of VibeCodedDashboard was created through **AI-assisted / vibe coding techniques**.

That means the development process involved:

* AI-generated code
* Human testing
* Rapid prototyping
* Iterative debugging
* Hardware testing
* Feature experimentation
* Refactoring when something became too cursed to maintain 

The code should therefore **not be assumed to represent perfect software engineering practices**.

If you find something questionable in the implementation, there's a good chance it exists because at some point the development process went something like:

```text
"Can we make this work on Android 5?"

        ↓

"Apparently yes."

        ↓

"Can we also make videos work?"

        ↓

"Somehow."

        ↓

"Can we add Google Fonts?"

        ↓

"Probably shouldn't..."

        ↓

"Let's do it anyway."
```

This project is an experiment.

Feel free to inspect the code, criticize it, improve it, fork it, break it, or use it as inspiration for your own old hardware.

---

# 🤝 Contributing

Contributions, ideas, bug reports and compatibility testing are welcome.

In particular, testing on:

* Android 5.x
* Older Android WebViews
* Low-powered Raspberry Pis
* Older browsers
* Different screen resolutions

can help improve compatibility with hardware that is no longer officially supported.

If you find a bug, feel free to open an issue.

If you fix one, even better.

---

# 📜 License

VibeCodedDashboard is **free and open-source software licensed under the GNU General Public License v3.0 (GPL-3.0).**

You are free to:

* Use the software for any purpose
* Study how it works
* Modify the source code
* Share the original software
* Distribute modified versions

When distributing the software or derivative works, the terms of the GNU GPL v3.0 apply.

See the [`LICENSE`](LICENSE) file for the complete license text.

**Copyright © 2026 Paulo Carioca Ramos Valério**

---

# ⭐ Final Thought

Maybe that old phone sitting in a drawer isn't completely useless.

Maybe it just needs a different job.

**VibeCodedDashboard exists because I wanted to find out.**

If this project helps you give an old device a second life, consider giving the repository a ⭐.
