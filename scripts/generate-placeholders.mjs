/**
 * Генерирует SVG-плейсхолдеры 600x600 для всех товаров (3 варианта на каждый).
 * Файлы кладутся в public/images/products/<id>-<variant>.svg
 * Запуск:  node scripts/generate-placeholders.mjs
 */

import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = resolve(__dirname, '..', 'public', 'images', 'products');
mkdirSync(outDir, { recursive: true });

// Products + visual metadata (must match src/data/products.json ids)
const items = [
  { id: 1,  title: 'Premium Cat',       cat: 'food',        icon: 'fish' },
  { id: 2,  title: 'Meat Feast',        cat: 'food',        icon: 'bone' },
  { id: 3,  title: 'Puppy Start',       cat: 'food',        icon: 'bone' },
  { id: 4,  title: 'Squeaky Ball',      cat: 'toys',        icon: 'ball' },
  { id: 5,  title: 'Cat Wand',          cat: 'toys',        icon: 'feather' },
  { id: 6,  title: 'Tug Rope',          cat: 'toys',        icon: 'rope' },
  { id: 7,  title: 'Nylon Collar',      cat: 'accessories', icon: 'collar' },
  { id: 8,  title: 'Retract Leash 5m',  cat: 'accessories', icon: 'leash' },
  { id: 9,  title: 'Pet Carrier M',     cat: 'accessories', icon: 'carrier' },
  { id: 10, title: 'Double Bowl',       cat: 'accessories', icon: 'bowl' },
  { id: 11, title: 'Deep Cat Litter',   cat: 'accessories', icon: 'tray' },
  { id: 12, title: 'Long-hair Shampoo', cat: 'care',        icon: 'bottle' },
  { id: 13, title: 'Slicker Brush',     cat: 'care',        icon: 'brush' },
  { id: 14, title: 'Nail Clipper',      cat: 'care',        icon: 'clipper' },
];

// Category palettes — варьируем по 3 оттенка для вариантов a/b/c
const palettes = {
  food:        [ ['#FFE8D1', '#E8A96E'], ['#FFDFB8', '#D6935A'], ['#FFEFD9', '#F0B574'] ],
  toys:        [ ['#D8F0E1', '#4EA883'], ['#C5E8CF', '#3F9672'], ['#E3F4EA', '#5FB895'] ],
  accessories: [ ['#EDE4D3', '#A88B62'], ['#E0D4BD', '#947548'], ['#F3EBDB', '#B79A74'] ],
  care:        [ ['#E8DEF5', '#8A6EC2'], ['#D9CCE9', '#755AAD'], ['#F0E8F8', '#9E86D0'] ],
};

const variants = ['a', 'b', 'c'];

// Unicode-иконки — простые эмодзи-подобные символы через SVG text
const icons = {
  fish:    '🐟',
  bone:    '🦴',
  ball:    '🎾',
  feather: '🪶',
  rope:    '🪢',
  collar:  '📿',
  leash:   '🔗',
  carrier: '🧺',
  bowl:    '🥣',
  tray:    '📦',
  bottle:  '🧴',
  brush:   '🪮',
  clipper: '✂️',
};

function makeSvg({ title, palette, icon, variant }) {
  const [bg, accent] = palette;
  const rotate = { a: -6, b: 0, c: 6 }[variant];
  const shift = { a: -40, b: 0, c: 40 }[variant];
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="600" height="600">
  <defs>
    <radialGradient id="g" cx="50%" cy="40%" r="75%">
      <stop offset="0%" stop-color="${bg}"/>
      <stop offset="100%" stop-color="${accent}" stop-opacity="0.25"/>
    </radialGradient>
  </defs>
  <rect width="600" height="600" fill="url(#g)"/>
  <circle cx="${300 + shift}" cy="280" r="160" fill="${accent}" opacity="0.18"/>
  <g transform="translate(${300 + shift} 300) rotate(${rotate})">
    <text x="0" y="0" font-size="220" text-anchor="middle" dominant-baseline="central"
          font-family="Apple Color Emoji, Segoe UI Emoji, sans-serif">${icon}</text>
  </g>
  <text x="300" y="520" text-anchor="middle" font-family="Inter, Segoe UI, sans-serif"
        font-size="28" font-weight="700" fill="#2a2a2a">${title}</text>
  <text x="300" y="560" text-anchor="middle" font-family="Inter, Segoe UI, sans-serif"
        font-size="18" fill="#2a2a2a" opacity="0.55">view ${variant.toUpperCase()}</text>
</svg>`;
}

let count = 0;
for (const item of items) {
  const icon = icons[item.icon] ?? '🐾';
  for (let i = 0; i < variants.length; i += 1) {
    const variant = variants[i];
    const palette = palettes[item.cat][i];
    const svg = makeSvg({ title: item.title, palette, icon, variant });
    const file = resolve(outDir, `${item.id}-${variant}.svg`);
    writeFileSync(file, svg, 'utf8');
    count += 1;
  }
}

console.log(`Generated ${count} placeholders in ${outDir}`);
