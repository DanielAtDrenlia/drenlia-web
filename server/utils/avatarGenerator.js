const { createCanvas } = require('canvas');

/**
 * Generates a letter avatar with initials from a name
 * @param {string} name - The full name to generate initials from
 * @param {number} size - The size of the avatar in pixels
 * @returns {Buffer} - A PNG buffer containing the avatar
 */
const generateLetterAvatar = (name, size = 200) => {
  // Extract initials from name
  const initials = name
    .split(' ')
    .map(part => part.charAt(0))
    .join('')
    .toUpperCase()
    .substring(0, 2); // Get at most 2 initials

  // Create canvas
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  // Define colors - pastel colors that work well with dark text
  const colors = [
    '#F4BFBF', // light pink
    '#FFD9C0', // peach
    '#FAF0D7', // cream
    '#8CC0DE', // light blue
    '#CCCCFF', // lavender
    '#D8F8B7', // light green
    '#FF9999', // salmon
    '#FFDAB9', // peachpuff
    '#B0E0E6', // powderblue
    '#FFC0CB', // pink
  ];

  // Get a consistent color based on the name
  const colorIndex = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
  const bgColor = colors[colorIndex];

  // Draw background
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, size, size);

  // Draw text
  ctx.fillStyle = '#333333'; // Dark text for contrast
  ctx.font = `bold ${size / 2}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(initials, size / 2, size / 2);

  return canvas.toBuffer('image/png');
};

module.exports = {
  generateLetterAvatar
}; 