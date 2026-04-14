const fs = require('fs');

// Create SVG-based placeholder images saved as .svg files renamed to expected filenames
const projects = [
  {
    file: 'project1.jpg',
    title: 'Aurora AI Pro',
    subtitle: 'Multilingual AI Voice & Text Translator',
    icon: '🌐',
    bg1: '#0f0c29', bg2: '#302b63',
    accent: '#00f2fe'
  },
  {
    file: 'project2.png',
    title: 'Deccan Fresh',
    subtitle: 'E-Commerce Grocery Platform',
    icon: '🛒',
    bg1: '#134e5e', bg2: '#71b280',
    accent: '#71b280'
  },
  {
    file: 'project3.png',
    title: 'Scanify v2',
    subtitle: 'QR Code Generator',
    icon: '📱',
    bg1: '#200122', bg2: '#6f0000',
    accent: '#a855f7'
  },
];

const certs = [
  {
    file: 'cert1.png',
    title: 'Generative AI Workshop',
    issuer: 'OutSkill',
    date: 'Feb 8, 2026',
    icon: '🤖',
    bg1: '#1a1a2e', bg2: '#16213e',
    accent: '#e94560'
  },
  {
    file: 'cert2.png',
    title: 'Python Programming Workshop',
    issuer: 'FOSSEE, IIT Bombay',
    date: 'May 9, 2025',
    icon: '🐍',
    bg1: '#003d4d', bg2: '#006994',
    accent: '#ffd700'
  },
  {
    file: 'OutSkill-Certificate.png',
    title: 'CEREBRO — Gemini AI Challenge',
    issuer: 'ACE Engineering College',
    date: 'Sept 9, 2025',
    icon: '🏆',
    bg1: '#0d0d2b', bg2: '#1a1a4e',
    accent: '#00f2fe'
  },
];

function makeSVG(width, height, title, subtitle, icon, bg1, bg2, accent, isCert = false) {
  const subtitleLines = subtitle.match(/.{1,30}/g) || [subtitle];
  const subtitleSVG = subtitleLines.map((line, i) =>
    `<text x="${width / 2}" y="${height / 2 + 30 + i * 26}" font-family="Arial,sans-serif" font-size="18" fill="${accent}99" text-anchor="middle">${line}</text>`
  ).join('\n');

  const badge = isCert
    ? `<rect x="${width / 2 - 50}" y="${height - 70}" width="100" height="28" rx="14" fill="${accent}33" stroke="${accent}" stroke-width="1"/>
       <text x="${width / 2}" y="${height - 50}" font-family="Arial" font-size="13" fill="${accent}" text-anchor="middle" font-weight="bold">VERIFIED ✓</text>`
    : '';

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${bg1};stop-opacity:1"/>
      <stop offset="100%" style="stop-color:${bg2};stop-opacity:1"/>
    </linearGradient>
    <linearGradient id="glow" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:${accent};stop-opacity:0.1"/>
      <stop offset="100%" style="stop-color:${accent};stop-opacity:0.3"/>
    </linearGradient>
  </defs>
  <rect width="${width}" height="${height}" fill="url(#bg)"/>
  <rect x="20" y="20" width="${width - 40}" height="${height - 40}" rx="12" fill="url(#glow)" stroke="${accent}" stroke-width="1" stroke-opacity="0.4"/>
  <!-- Grid lines -->
  <line x1="0" y1="${height / 3}" x2="${width}" y2="${height / 3}" stroke="${accent}" stroke-opacity="0.06" stroke-width="1"/>
  <line x1="0" y1="${height * 2 / 3}" x2="${width}" y2="${height * 2 / 3}" stroke="${accent}" stroke-opacity="0.06" stroke-width="1"/>
  <line x1="${width / 3}" y1="0" x2="${width / 3}" y2="${height}" stroke="${accent}" stroke-opacity="0.06" stroke-width="1"/>
  <line x1="${width * 2 / 3}" y1="0" x2="${width * 2 / 3}" y2="${height}" stroke="${accent}" stroke-opacity="0.06" stroke-width="1"/>
  <!-- Icon -->
  <text x="${width / 2}" y="${height / 2 - 20}" font-size="52" text-anchor="middle" dominant-baseline="middle">${icon}</text>
  <!-- Title -->
  <text x="${width / 2}" y="${height / 2 + 10}" font-family="Arial,sans-serif" font-size="22" font-weight="bold" fill="${accent}" text-anchor="middle">${title}</text>
  ${subtitleSVG}
  ${badge}
  <!-- Corner accent -->
  <circle cx="30" cy="30" r="8" fill="${accent}" opacity="0.5"/>
  <circle cx="${width - 30}" cy="${height - 30}" r="8" fill="${accent}" opacity="0.5"/>
</svg>`;
}

// Generate project images (800x500)
for (const p of projects) {
  const svg = makeSVG(800, 500, p.title, p.subtitle, p.icon, p.bg1, p.bg2, p.accent, false);
  fs.writeFileSync(p.file, svg, 'utf8');
  console.log('Created:', p.file);
}

// Generate certificate images (600x850 portrait)
for (const c of certs) {
  const svg = makeSVG(600, 850, c.title, `${c.issuer} — ${c.date}`, c.icon, c.bg1, c.bg2, c.accent, true);
  fs.writeFileSync(c.file, svg, 'utf8');
  console.log('Created:', c.file);
}

console.log('All placeholder images created!');
