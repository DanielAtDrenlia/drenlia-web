const express = require('express');
const router = express.Router();
const axios = require('axios');
const he = require('he'); // HTML entity decoder

/**
 * POST /api/translate
 * Translates text from source language to target language
 */
router.post('/', async (req, res) => {
  try {
    const { text, targetLanguage = 'fr' } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    // Get the origin from the request headers
    const origin = req.get('origin') || 'https://dev.drenlia.com';

    const response = await axios.post(
      `https://translation.googleapis.com/language/translate/v2?key=${process.env.GOOGLE_CLOUD_API_KEY}`,
      {
        q: text,
        target: targetLanguage,
        source: 'en'
      },
      {
        headers: {
          'Referer': origin,
          'Origin': origin,
          'Content-Type': 'application/json'
        }
      }
    );

    const translatedText = response.data.data.translations[0].translatedText;
    // Decode HTML entities in the translated text
    const decodedText = he.decode(translatedText);
    
    res.json({ translation: decodedText });
  } catch (error) {
    console.error('Translation error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to translate text' });
  }
});

module.exports = router; 