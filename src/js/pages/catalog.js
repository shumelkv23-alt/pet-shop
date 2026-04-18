import '../../styles/tokens.css';
import '../../styles/global.css';
import '../../styles/catalog.css';
import '../../styles/card.css';

import { loadProducts } from '../store/products.js';
import { formatPrice } from '../lib/format.js';
import * as cartStore from '../store/cart.js';
import { renderHeader } from '../components/header.js';
import { renderFooter } from '../components/footer.js';
import { createCard } from '../components/productCard.js';

renderHeader('catalog');
renderFooter();

const products = loadProducts();
const grid = document.getElementById('catalog-grid');
const countLabel = document.getElementById('catalog-count');

const fragment = document.createDocumentFragment();
for (const product of products) {
  fragment.appendChild(createCard(product));
}
grid.appendChild(fragment);

if (countLabel) {
  countLabel.textContent = `${products.length} товаров`;
}

// TEMP (removed on step 14): debug helpers для проверки в DevTools Console
window.__cart = {
  ...cartStore,
  products,
  formatPrice,
  totals: () => cartStore.getTotals(products),
};
