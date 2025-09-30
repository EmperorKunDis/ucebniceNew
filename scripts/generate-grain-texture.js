const fs = require('fs');
const { createCanvas } = require('canvas');

// Create a canvas
const width = 512;
const height = 512;
const canvas = createCanvas(width, height);
const ctx = canvas.getContext('2d');

// Fill with dark background
ctx.fillStyle = '#111111';
ctx.fillRect(0, 0, width, height);

// Create grain effect
const imageData = ctx.getImageData(0, 0, width, height);
const data = imageData.data;

for (let i = 0; i < data.length; i += 4) {
  // Add random noise
  const noise = Math.random() * 30 - 15;
  data[i] += noise;     // Red
  data[i + 1] += noise; // Green
  data[i + 2] += noise; // Blue
  // Alpha stays the same
}

ctx.putImageData(imageData, 0, 0);

// Save as PNG
const buffer = canvas.toBuffer('image/png');
fs.writeFileSync('./public/images/grain-texture.png', buffer);

console.log('Grain texture generated successfully!');