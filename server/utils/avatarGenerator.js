const { createCanvas } = require('canvas');

// Generate a consistent color based on the name
function generateColor(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  // Generate a pastel color
  const hue = hash % 360;
  return `hsl(${hue}, 70%, 85%)`;
}

/**
 * Generates a letter avatar with initials from a name
 * @param {string} name - The full name to generate initials from
 * @param {number} width - The width of the avatar in pixels
 * @param {number} height - The height of the avatar in pixels
 * @returns {Buffer} - A PNG buffer containing the avatar
 */
async function generateLetterAvatar(name, width = 200, height = 200) {
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // Set background color
  ctx.fillStyle = generateColor(name);
  ctx.fillRect(0, 0, width, height);

  // Get initials (up to 3 characters)
  const initials = name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 3);

  // Configure text
  ctx.fillStyle = '#1e293b';
  ctx.font = `bold ${Math.min(width, height) * 0.4}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Draw text
  ctx.fillText(initials, width / 2, height / 2);

  // Return buffer
  return canvas.toBuffer('image/png');
}

module.exports = {
  generateLetterAvatar
}; 