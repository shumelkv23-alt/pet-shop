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

const CATEGORY_LABELS = {
  all: 'Все',
  food: 'Корм',
  toys: 'Игрушки',
  accessories: 'Аксессуары',
  care: 'Уход',
};

const allProducts = loadProducts();
const grid = document.getElementById('catalog-grid');
const countLabel = document.getElementById('catalog-count');
const categoriesEl = document.getElementById('catalog-categories');
const sortEl = document.getElementById('catalog-sort');

let activeCategory = 'all';
let activeSort = 'default';

function buildCategoryPills() {
  const categories = ['all', ...new Set(allProducts.map((p) => p.category))];
  categoriesEl.innerHTML = categories
    .map(
      (cat) =>
        `<button type="button" class="catalog__cat-pill${cat === activeCategory ? ' catalog__cat-pill--active' : ''}" data-cat="${cat}">
          ${CATEGORY_LABELS[cat] ?? cat}
        </button>`,
    )
    .join('');

  categoriesEl.querySelectorAll('.catalog__cat-pill').forEach((btn) => {
    btn.addEventListener('click', () => {
      activeCategory = btn.dataset.cat;
      categoriesEl.querySelectorAll('.catalog__cat-pill').forEach((b) => {
        b.classList.toggle('catalog__cat-pill--active', b.dataset.cat === activeCategory);
      });
      renderGrid();
    });
  });
}

function getSortedFiltered() {
  let list = activeCategory === 'all'
    ? allProducts
    : allProducts.filter((p) => p.category === activeCategory);

  if (activeSort === 'price-asc') list = [...list].sort((a, b) => a.price - b.price);
  else if (activeSort === 'price-desc') list = [...list].sort((a, b) => b.price - a.price);
  else if (activeSort === 'rating-desc') list = [...list].sort((a, b) => b.rating - a.rating);

  return list;
}

function renderGrid() {
  const products = getSortedFiltered();
  grid.innerHTML = '';
  const fragment = document.createDocumentFragment();
  for (const product of products) {
    fragment.appendChild(createCard(product));
  }
  grid.appendChild(fragment);
  if (countLabel) countLabel.textContent = `${products.length} товаров`;
}

sortEl.addEventListener('change', () => {
  activeSort = sortEl.value;
  renderGrid();
});

buildCategoryPills();
renderGrid();

