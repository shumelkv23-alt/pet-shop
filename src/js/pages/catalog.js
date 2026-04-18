import '../../styles/tokens.css';
import '../../styles/global.css';

import { loadProducts } from '../store/products.js';
import { formatPrice } from '../lib/format.js';
import * as cartStore from '../store/cart.js';
import { onCartChange } from '../lib/events.js';

const products = loadProducts();
console.info('[catalog] loaded %d products', products.length);

// TEMP (removed on step 14): debug helpers для проверки в DevTools Console
window.__cart = {
  ...cartStore,
  products,
  formatPrice,
  totals: () => cartStore.getTotals(products),
};

onCartChange((detail) => {
  console.info('[cart:change]', {
    count: cartStore.getTotalCount(),
    totals: cartStore.getTotals(products),
    promo: detail.promoCode,
  });
});

console.info('[cart] initial count = %d', cartStore.getTotalCount());
