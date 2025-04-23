# 🖥️ ETT 2.0

## 📦 Technologien

- [Vue 3](https://vuejs.org/) – Frontend-Framework
- [Vite](https://vitejs.dev/) – schneller Entwicklungsserver & Build Tool
- [Electron](https://www.electronjs.org/) – Plattform für Desktop-Apps
- [Vue Router](https://router.vuejs.org/) – Routing für Seiten
- [Pinia](https://pinia.vuejs.org/) *(optional)* – State Management
- [Concurrently](https://www.npmjs.com/package/concurrently) – paralleler Start von Vite & Electron
- [@vitejs/plugin-vue](https://github.com/vitejs/vite-plugin-vue) – für `.vue`-Dateien

---

## 🔧 Voraussetzungen

- [Node.js](https://nodejs.org/)
- [Git](https://git-scm.com/)
- [VS Code](https://code.visualstudio.com/)

---

## ⚙️ Installation & Start

1. **Projekt klonen**

```bash
git clone https://github.com/<DEIN-BENUTZERNAME>/ETT2.0.git
cd ETT2.0


2. **Abhängigkeiten installieren**
```bash
npm install

3. **App starten**
npm run dev:all    # Startet Vite + Electron
npm run dev        # Startet nur Vite
npm run electron   # Startet nur Electron