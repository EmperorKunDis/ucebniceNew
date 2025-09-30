const fs = require('fs');

// Create SVG grain texture
const svg = `<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <filter id="grain">
      <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="4" stitchTiles="stitch"/>
      <feColorMatrix type="saturate" values="0"/>
    </filter>
  </defs>
  <rect width="100%" height="100%" filter="url(#grain)" opacity="0.5"/>
</svg>`;

// Convert SVG to base64
const base64 = Buffer.from(svg).toString('base64');
const dataUrl = `data:image/svg+xml;base64,${base64}`;

console.log('SVG grain texture created!');
console.log('Data URL:', dataUrl);

// Save as HTML file for preview
const html = `<!DOCTYPE html>
<html>
<head>
  <title>Grain Texture</title>
  <style>
    body {
      margin: 0;
      background: #000;
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
    }
    .grain {
      width: 512px;
      height: 512px;
      background-image: url('${dataUrl}');
      background-size: 100px 100px;
    }
  </style>
</head>
<body>
  <div class="grain"></div>
</body>
</html>`;

fs.writeFileSync('./scripts/grain-preview.html', html);
console.log('Preview saved to scripts/grain-preview.html');