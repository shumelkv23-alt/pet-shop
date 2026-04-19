import '../../styles/tokens.css';
import '../../styles/global.css';
import '../../styles/catalog.css';
import '../../styles/card.css';

import { loadProducts } from '../store/products.js';
import { renderHeader } from '../components/header.js';
import { renderFooter } from '../components/footer.js';
import { createCard } from '../components/productCard.js';

renderHeader('catalog');
renderFooter();

const allProducts = loadProducts();
const grid = document.getElementById('catalog-grid');
const countLabel = document.getElementById('catalog-count');
const sortEl = document.getElementById('catalog-sort');
const priceMinEl = document.getElementById('price-min');
const priceMaxEl = document.getElementById('price-max');

let activeSort = 'default';
let minRating = 0;
let minPrice = 0;
let maxPrice = Infinity;

function getSortedFiltered() {
  let list = allProducts.filter(
    (p) => p.rating >= minRating && p.price >= minPrice && p.price <= maxPrice,
  );
  if (activeSort === 'price-asc') list = [...list].sort((a, b) => a.price - b.price);
  else if (activeSort === 'price-desc') list = [...list].sort((a, b) => b.price - a.price);
  else if (activeSort === 'rating-desc') list = [...list].sort((a, b) => b.rating - a.rating);
  return list;
}

function renderGrid() {
  const products = getSortedFiltered();
  grid.innerHTML = '';
  const fragment = document.createDocumentFragment();
  for (const product of products) fragment.appendChild(createCard(product));
  grid.appendChild(fragment);
  if (countLabel) countLabel.textContent = `${products.length} товаров`;
}

sortEl.addEventListener('change', () => {
  activeSort = sortEl.value;
  renderGrid();
});

document.querySelectorAll('input[name="rating"]').forEach((radio) => {
  radio.addEventListener('change', () => {
    minRating = radio.checked ? Number(radio.value) : 0;
    renderGrid();
  });
});

priceMinEl.addEventListener('input', () => {
  minPrice = Number(priceMinEl.value) || 0;
  renderGrid();
});

priceMaxEl.addEventListener('input', () => {
  maxPrice = Number(priceMaxEl.value) || Infinity;
  renderGrid();
});

renderGrid();
