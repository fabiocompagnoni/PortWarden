# PortWarden 🛡️

[![Release](https://img.shields.io/github/v/release/fabiocompagnoni/PortWarden?display_name=tag&style=flat-square)](https://github.com/fabiocompagnoni/PortWarden/releases)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)

**PortWarden** is a native Linux application designed for advanced network port management and high-performance TCP port forwarding. Built with **Tauri**, **Rust**, and **React**, it combines the safety and speed of system-level programming with a modern, intuitive user interface.

![PortWarden Dashboard Mockup](https://raw.githubusercontent.com/fabiocompagnoni/PortWarden/main/app-icon.png)

## ✨ Features

- **🔍 Real-time Port Monitoring**: Live view of all active network listeners on your system.
- **🏷️ Process Identification**: Automatically maps open ports to their PIDs and process names (requires root privileges).
- **🚀 High-Performance Forwarding**: Create local-to-remote TCP tunnels using an asynchronous, Tokio-powered Rust engine.
- **🎨 Modern Dark UI**: A sleek, premium dashboard built with TailwindCSS and shadcn/ui.
- **📥 System Tray Integration**: Minimize to tray and manage tunnels in the background.
- **📦 Automated Releases**: CI/CD pipeline set up to generate `.deb` packages for Debian/Ubuntu.

## 🚀 Getting Started

### Prerequisites

To build PortWarden from source, you need:

- **Rust toolchain** (latest stable)
- **Node.js** (v18 or newer)
- **System Dependencies** (for Ubuntu/Debian):
  ```bash
  sudo apt-get update
  sudo apt-get install -y libwebkit2gtk-4.1-dev build-essential curl wget file libssl-dev libgtk-3-dev libayatana-appindicator3-dev librsvg2-dev
  ```

### Local Development

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/fabiocompagnoni/PortWarden.git
    cd PortWarden
    ```

2.  **Install frontend dependencies**:
    ```bash
    npm install
    ```

3.  **Run in development mode**:
    ```bash
    npm run tauri dev
    ```

### Building for Release

To generate a production-ready `.deb` package:
```bash
npm run tauri build
```
The installer will be located in `src-tauri/target/release/bundle/deb/`.

## 🛡️ Root Privileges

PortWarden requires **root privileges** to:
1.  Read process information from `/proc` for ports owned by other users.
2.  Bind to privileged ports (0-1023).

It is recommended to launch the application using `pkexec` or `sudo`:
```bash
pkexec port-warden
```

## 🛠️ Built With

- **[Tauri](https://tauri.app/)** - Secure, lightweight native app construction.
- **[Rust](https://www.rust-lang.org/)** - For the high-performance network engine.
- **[React](https://reactjs.org/)** - For the interactive user interface.
- **[Tokio](https://tokio.rs/)** - Asynchronous runtime for port forwarding tasks.
- **[Shadcn/UI](https://ui.shadcn.com/)** & **[TailwindCSS](https://tailwindcss.com/)** - For the modern design system.

## 🤝 Contributing

Contributions are welcome! If you have a feature request or found a bug, please open an issue or submit a pull request.

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

## 📄 License

Distributed under the **MIT License**. See `LICENSE` for more information.

---
*Created with ❤️ for the Linux community.*
