<h1 align="center">Easy Discord Dev Badge</h1>

<p align="center">
  <img src="https://github.com/MaisLaufen/easy-discord-dev-badge/blob/master/src/site/assets/img/logo.png" alt="Easy Discord Dev Badge Banner" />
</p>

<p align="center">
  <a href="https://github.com/MaisLaufen/easy-discord-dev-badge/releases">
    <img src="https://img.shields.io/github/v/release/MaisLaufen/easy-discord-dev-badge?style=for-the-badge&label=Latest%20Release" alt="Latest Release" />
  </a>
</p>

---

## 📖 Description

**Easy Discord Dev Badge** is a tool that simplifies the process of obtaining the **Developer Badge** on Discord. It automates the workflow, minimizes effort, and helps you complete the requirements in just a few guided steps.

---

## ✨ Features

- 🌐 Multi-language support (English 🇬🇧 / Russian 🇷🇺)
- ⚙️ Optimized local bot server
- 🧹 Console with the local server closes automatically after completion
- 💻 Improved, modern interface
- 📁 Standard site structure instead of a single-file HTML

---

## 🚀 Installation (Recommended)

1. Go to the [Releases](https://github.com/MaisLaufen/easy-discord-dev-badge/releases) page.
2. Download the archive file: **`easy-discord-dev-badge.zip`** from the latest release.
3. Extract the contents of the archive to any folder on your computer.

   The archive contains:
   - `local_server.exe` — the executable that runs the local bot server
   - `site/` folder — the web interface and all required frontend files

> ⚠️ **Important:** Do not change the folder structure!  
> `local_server.exe` must remain in the same folder level as the `site/` folder for everything to work properly.

---

### ✅ How to use

1. Run `local_server.exe`.
2. Your default browser will **automatically open** the site.
3. Follow the instructions displayed on the page.

---

## 🛠 Manual Setup (Python)

1. Make sure you have **Python 3.9+** installed. You can download it from [python.org](https://www.python.org/downloads/release/python-390/).
2. Install the dependencies:

   ```bash
   pip install -r requirements.txt
   ```
3. Open the file folder `local_server.py` in the terminal.
4. Start the local server:

   ```bash
   python local_server.py
   ```
