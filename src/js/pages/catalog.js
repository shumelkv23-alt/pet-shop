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
const sortDropdown = document.getElementById('catalog-sort');
const sortTrigger = sortDropdown.querySelector('.sort-dropdown__trigger');
const sortMenu = sortDropdown.querySelector('.sort-dropdown__menu');
const sortValueEl = document.getElementById('sort-value');
const priceMinEl = document.getElementById('price-min');
const priceMaxEl = document.getElementById('price-max');

let activeSort = 'name-asc';
const selectedRatings = new Set();
let minPrice = Number(priceMinEl.value) || 0;
let maxPrice = Number(priceMaxEl.value) || Infinity;

function getSortedFiltered() {
  const minRating = selectedRatings.size > 0 ? Math.min(...selectedRatings) : 0;
  let list = allProducts.filter(
    (p) => p.rating >= minRating && p.price >= minPrice && p.price <= maxPrice,
  );
  if (activeSort === 'name-asc') list = [...list].sort((a, b) => a.title.localeCompare(b.title));
  else if (activeSort === 'name-desc') list = [...list].sort((a, b) => b.title.localeCompare(a.title));
  else if (activeSort === 'price-asc') list = [...list].sort((a, b) => a.price - b.price);
  else if (activeSort === 'price-desc') list = [...list].sort((a, b) => b.price - a.price);
  return list;
}

function renderGrid() {
  const products = getSortedFiltered();
  grid.innerHTML = '';
  const fragment = document.createDocumentFragment();
  for (const product of products) fragment.appendChild(createCard(product));
  grid.appendChild(fragment);
  if (countLabel) countLabel.textContent = `${products.length} items`;
}

// --- Custom sort dropdown ---

function setSort(value, label) {
  activeSort = value;
  sortValueEl.textContent = label;

  sortMenu.querySelectorAll('.sort-dropdown__option').forEach((opt) => {
    const isActive = opt.dataset.value === value;
    opt.classList.toggle('sort-dropdown__option--active', isActive);
    opt.setAttribute('aria-selected', String(isActive));
    const existing = opt.querySelector('.sort-dropdown__check');
    if (isActive && !existing) {
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('class', 'sort-dropdown__check');
      svg.setAttribute('width', '16');
      svg.setAttribute('height', '16');
      svg.setAttribute('viewBox', '0 0 16 16');
      svg.setAttribute('fill', 'none');
      svg.setAttribute('aria-hidden', 'true');
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', 'M3 8l3.5 3.5L13 5');
      path.setAttribute('stroke', 'currentColor');
      path.setAttribute('stroke-width', '1.5');
      path.setAttribute('stroke-linecap', 'round');
      path.setAttribute('stroke-linejoin', 'round');
      svg.appendChild(path);
      opt.appendChild(svg);
    } else if (!isActive && existing) {
      existing.remove();
    }
  });

  closeMenu();
  renderGrid();
}

function openMenu() {
  sortDropdown.classList.add('sort-dropdown--open');
  sortTrigger.setAttribute('aria-expanded', 'true');
}

function closeMenu() {
  sortDropdown.classList.remove('sort-dropdown--open');
  sortTrigger.setAttribute('aria-expanded', 'false');
}

sortTrigger.addEventListener('click', () => {
  sortDropdown.classList.contains('sort-dropdown--open') ? closeMenu() : openMenu();
});

sortMenu.addEventListener('click', (e) => {
  const opt = e.target.closest('.sort-dropdown__option');
  if (!opt) return;
  setSort(opt.dataset.value, opt.textContent.trim());
});

document.addEventListener('click', (e) => {
  if (!sortDropdown.contains(e.target)) closeMenu();
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeMenu();
});

// --- Other filters ---

document.querySelectorAll('input[name="rating"]').forEach((checkbox) => {
  checkbox.addEventListener('change', () => {
    const val = Number(checkbox.value);
    checkbox.checked ? selectedRatings.add(val) : selectedRatings.delete(val);
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

document.querySelectorAll('.filter-price__spin-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    const input = document.getElementById(btn.dataset.target);
    const step = 1;
    const current = Number(input.value) || 0;
    input.value = btn.dataset.dir === 'up' ? current + step : Math.max(0, current - step);
    input.dispatchEvent(new Event('input'));
  });
});

renderGrid();
