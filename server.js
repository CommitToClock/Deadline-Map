const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Statische Dateien (HTML, CSS, etc.) servieren
app.use(express.static(path.join(__dirname)));

// Hauptseite auf /deadline-map umleiten
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'deadline_map.html'));
});

// Server starten
app.listen(PORT, () => {
  console.log(`✅ Server läuft auf http://localhost:${PORT}`);
  console.log(`📅 Deadline Map erreichbar unter http://localhost:${PORT}/deadline_map.html`);
});
