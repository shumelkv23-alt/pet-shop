import '../../styles/tokens.css';
import '../../styles/global.css';

import { loadProducts } from '../store/products.js';
import { formatPrice } from '../lib/format.js';

const products = loadProducts();
console.info('[catalog] loaded %d products', products.length);
console.table(
  products.map((p) => ({
    id: p.id,
    title: p.title,
    price: formatPrice(p.price),
    rating: p.rating,
    category: p.category,
  })),
);
