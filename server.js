const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

const distIndex = path.join(__dirname, 'dist', 'index.html');
const fallbackIndex = path.join(__dirname, 'index.html');

const sendSpaIndex = (res) => {
  if (fs.existsSync(distIndex)) {
    res.sendFile(distIndex);
    return;
  }
  res.sendFile(fallbackIndex);
};

// Root liefert immer die aktuelle Standalone-Version.
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'deadline_map.html'));
});

// Statische Dateien aus dist/ (Production Build) oder root (Development) servieren.
// index:false verhindert, dass dist/index.html die Route "/" vor deadline_map.html abfaengt.
app.use(express.static(path.join(__dirname, 'dist'), { index: false }));
app.use(express.static(path.join(__dirname), { index: false }));

// SPA-Fallback fuer die Vue-Version, falls andere Routen aufgerufen werden.
app.get('*', (req, res) => {
  sendSpaIndex(res);
});

app.listen(PORT, () => {
  console.log(`Server laeuft auf http://localhost:${PORT}`);
  console.log(`Deadline Map erreichbar unter http://localhost:${PORT}`);
});
