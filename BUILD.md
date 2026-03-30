# Build Instructions

## Prerequisites

### All platforms

- **Node.js** ≥ 20 and **npm** ≥ 10
- **Rust** ≥ 1.77 (install via [rustup](https://rustup.rs))
- **Tauri CLI** v2 — install once with Cargo:

  ```bash
  cargo install tauri-cli --version "^2.0"
  ```

### Linux (Fedora / RHEL)

Tauri uses the system WebKit on Linux and requires these development packages:

```bash
sudo dnf install \
  webkit2gtk4.1-devel \
  openssl-devel \
  curl wget file \
  libappindicator-gtk3-devel \
  librsvg2-devel
```

### Linux (Debian / Ubuntu)

```bash
sudo apt-get install \
  libwebkit2gtk-4.1-dev \
  build-essential \
  curl wget file \
  libssl-dev \
  libxdo-dev \
  libayatana-appindicator3-dev \
  librsvg2-dev
```

### Linux (Arch / Manjaro)

```bash
sudo pacman -S \
  webkit2gtk-4.1 \
  openssl \
  base-devel \
  curl wget file \
  libappindicator-gtk3 \
  librsvg
```

### macOS

No extra system libraries needed. XCode Command Line Tools are required:

```bash
xcode-select --install
```

### Windows

Install [Microsoft C++ Build Tools](https://visualstudio.microsoft.com/visual-cpp-build-tools/) with the "Desktop development with C++" workload, and [WebView2](https://developer.microsoft.com/en-us/microsoft-edge/webview2/) (pre-installed on Windows 10 21H2+ and Windows 11).

---

## Development

```bash
# 1. Install frontend dependencies
npm install

# 2. Start the development server (opens a native window with hot reload)
npm run tauri dev
```

The Vite dev server starts on `http://localhost:5173`. Tauri watches for Rust changes separately. Frontend changes reflect immediately via HMR; Rust changes trigger a recompile.

---

## Tests

Unit tests cover the YAML parser and graph builder (no DOM or Tauri dependencies required):

```bash
npm test
```

Expected output: 13 tests across 2 test files, all passing.

---

## Production build

```bash
npm run tauri build
```

Produces platform-native installers in `src-tauri/target/release/bundle/`:

| Platform | Output formats |
|---|---|
| Linux | `.AppImage`, `.deb`, `.rpm` |
| macOS | `.dmg`, `.app` |
| Windows | `.msi`, `.exe` (NSIS) |

### Build targets

By default Tauri builds all bundle targets. To build a specific format:

```bash
# Linux: AppImage only
cargo tauri build --bundles appimage

# macOS: DMG only
cargo tauri build --bundles dmg

# Windows: MSI only
cargo tauri build --bundles msi
```

---

## Packaging configuration

Edit `src-tauri/tauri.conf.json` to customise:

- `productName` — application name shown in the OS
- `version` — semantic version for the installer
- `identifier` — reverse-domain bundle ID (change `com.tauri.dev` before distributing)
- `app.windows[0]` — default window size and title
- `bundle.icon` — icon paths; generate all sizes from a single 1024×1024 PNG:

  ```bash
  cargo tauri icon path/to/icon.png
  ```

---

## CI / cross-platform builds

To build installers for all three platforms from CI, run `npm run tauri build` on a matrix of runners. Example GitHub Actions matrix:

```yaml
strategy:
  matrix:
    platform: [ubuntu-22.04, macos-latest, windows-latest]
```

Each runner needs its platform-specific prerequisites installed before `npm run tauri build`.

---

## Vite-only build (frontend only, no Tauri)

If you need to inspect the frontend bundle in isolation:

```bash
npm run build   # outputs to dist/
npm run preview # serves dist/ on http://localhost:4173
```

Note: Tauri API calls (`@tauri-apps/plugin-fs`, `@tauri-apps/plugin-dialog`) will throw at runtime when running outside a Tauri context.
