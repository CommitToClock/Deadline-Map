# Deadline Map - Lernplan & Kapazitäts-Check

Eine interaktive Web-App zur Verwaltung von Deadlines und Lernplanung.

## 🚀 Installation & Lokales Testen

### 1. Dependencies installieren
```bash
npm install
```

### 2. Server starten
```bash
npm start
```

Server läuft dann unter **http://localhost:3000**

---

## 📤 Deployment - Damit andere zugreifen können

### Option 1: **Vercel** (Empfohlen - kostenlos & einfach)

1. Gehe zu [vercel.com](https://vercel.com) und melde dich an
2. Verbinde dein GitHub Repository
3. Vercel erkennt die `package.json` automatisch
4. Klicke "Deploy" - fertig! ✅
5. Deine App ist dann unter einer URL wie `deadline-map-xxx.vercel.app` erreichbar

### Option 2: **Heroku** (Kostenlos für kleine Projekte)

1. Melde dich bei [heroku.com](https://heroku.com) an
2. Erstelle eine neue App
3. Verbinde dein GitHub Repository
4. Klicke "Deploy Branch"
5. Deine App läuft dann unter `your-app-name.herokuapp.com`

### Option 3: **Railway.app** (Sehr einfach)

1. Gehe zu [railway.app](https://railway.app)
2. Melde dich mit GitHub an
3. Klicke "New Project" → "Deploy from GitHub Repo"
4. Wähle dein Repo aus
5. Railway deployed es automatisch

### Option 4: **GitHub Pages** (Nur für statische Seiten)

Falls du nur die HTML-Datei ohne Server brauchst:
```bash
# GitHub Pages automatisch aktivieren
# Settings → Pages → Choose branch (main) → /root folder
```
Dann ist die App unter `https://username.github.io/deadline-map` erreichbar.

---

## 📋 Tipps für Freunde

**Link zum Teilen:**
- Mit Node.js Server: `https://your-deployed-app.com/deadline_map.html`
- Mit GitHub Pages: `https://username.github.io/deadline-map/deadline_map.html`

**Im README erwähnen:**
```markdown
### 🔗 Live Demo
[Deadline Map öffnen](https://your-app-name.vercel.app)

### Lokal nutzen
```bash
git clone https://github.com/username/deadline-map.git
cd deadline-map
npm install
npm start
```
```

---

## ❓ Fragen?

- **Server läuft nicht?** → Prüfe ob Node.js installiert ist: `node --version`
- **Port 3000 belegt?** → Ändere in `server.js`: `const PORT = 3001;`
- **GitHub Push schlägt fehl?** → Mache: `git add .` → `git commit -m "Add server"` → `git push`
