const sqlite3 = require('sqlite3').verbose();
const fs = require('fs').promises;
const path = require('path');

const defaultSettings = {
  version: '1.0',
  site_name: 'Company Name',
  site_description: 'Company Name - Tagline',
  contact_email: 'email@example.com',
  contact_phone: '+1 (555) 123-4567',
  address: '1234 The Street, The City, PV H0H 0H0',
};

async function convertSettings() {
  const dbPath = path.resolve(__dirname, '../server/database.sqlite');
  const outputPath = path.resolve(__dirname, 'settings.json');

  const db = new sqlite3.Database(dbPath);

  try {
    const settings = await new Promise((resolve, reject) => {
      db.all('SELECT key, value FROM settings', [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });

    const settingsObj = settings.reduce((acc, row) => {
      acc[row.key] = row.value;
      return acc;
    }, {});

    // Merge with default settings
    const finalSettings = {
      ...defaultSettings,
      ...settingsObj,
    };

    await fs.writeFile(outputPath, JSON.stringify(finalSettings, null, 2));
    console.log('Settings converted successfully!');
  } catch (error) {
    console.error('Error converting settings:', error);
  } finally {
    db.close();
  }
}

convertSettings(); 