const db = require('../db');

const settings = {
  getAllSettings: () => {
    return db.settings.getAllSettings();
  },

  getSetting: (key) => {
    return db.settings.getSetting(key);
  },

  setSetting: (key, value) => {
    return db.settings.setSetting(key, value);
  },

  updateSetting: async (key, value) => {
    return db.settings.setSetting(key, value);
  }
};

module.exports = settings; 