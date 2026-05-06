const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Statische Dateien aus dist/ (Production Build) oder root (Development) servieren
app.use(express.static(path.join(__dirname, 'dist')));
app.use(express.static(path.join(__dirname)));

// SPA-Fallback: Alle Anfragen auf index.html umleiten (für Vue.js Routing)
app.get('*', (req, res) => {
  const distIndex = path.join(__dirname, 'dist', 'index.html');
  const fallbackIndex = path.join(__dirname, 'index.html');
  
  // Versuche dist/index.html zuerst (Production), fallback auf index.html
  const fs = require('fs');
  if (fs.existsSync(distIndex)) {
    res.sendFile(distIndex);
  } else {
    res.sendFile(fallbackIndex);
  }
});

// Server starten
app.listen(PORT, () => {
  console.log(`✅ Server läuft auf http://localhost:${PORT}`);
  console.log(`📅 Lernplan & Kapazitäts-Check erreichbar unter http://localhost:${PORT}`);
});
