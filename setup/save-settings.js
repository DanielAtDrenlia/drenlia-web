const sqlite3 = require('sqlite3').verbose();
const fs = require('fs').promises;
const path = require('path');

async function saveSettings(settings) {
  const dbPath = path.resolve(__dirname, '../server/database.sqlite');
  const db = new sqlite3.Database(dbPath);

  try {
    // Create settings table if it doesn't exist
    await new Promise((resolve, reject) => {
      db.run(`
        CREATE TABLE IF NOT EXISTS settings (
          key TEXT PRIMARY KEY,
          value TEXT NOT NULL
        )
      `, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    // Delete existing settings
    await new Promise((resolve, reject) => {
      db.run('DELETE FROM settings', (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    // Insert new settings
    const stmt = db.prepare('INSERT INTO settings (key, value) VALUES (?, ?)');
    for (const [key, value] of Object.entries(settings)) {
      await new Promise((resolve, reject) => {
        stmt.run(key, value, (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
    }
    stmt.finalize();

    console.log('Settings saved successfully!');
  } catch (error) {
    console.error('Error saving settings:', error);
    throw error;
  } finally {
    db.close();
  }
}

// Read settings from JSON file
async function updateSettings() {
  try {
    const settingsPath = path.resolve(__dirname, 'settings.json');
    const settings = JSON.parse(await fs.readFile(settingsPath, 'utf8'));
    await saveSettings(settings);
  } catch (error) {
    console.error('Error updating settings:', error);
    process.exit(1);
  }
}

// If this script is run directly
if (require.main === module) {
  updateSettings();
}

module.exports = { saveSettings }; 