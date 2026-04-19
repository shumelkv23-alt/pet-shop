import { formatPrice } from '../lib/format.js';
import { addItem, getItemQty } from '../store/cart.js';
import { onCartChange } from '../lib/events.js';

export function createCard(product) {
  const card = document.createElement('article');
  card.className = 'product-card';
  card.dataset.productId = String(product.id);
  card.innerHTML = buildMarkup(product);

  const btn = card.querySelector('.product-card__add-btn');
  if (btn) {
    syncBtn(btn, product.id);
    btn.addEventListener('click', () => addItem(product.id));
    onCartChange(() => syncBtn(btn, product.id));
  }

  return card;
}

function syncBtn(btn, id) {
  const qty = getItemQty(id);
  if (qty === 0) {
    btn.textContent = 'В корзину';
    btn.dataset.state = 'idle';
    btn.setAttribute('aria-label', 'Добавить в корзину');
  } else {
    btn.textContent = `В корзине: ${qty}`;
    btn.dataset.state = 'added';
    btn.setAttribute('aria-label', `В корзине: ${qty} шт.`);
  }
}

function buildMarkup(product) {
  const href = `/product.html?id=${product.id}`;
  return `
    <a class="product-card__media" href="${href}" tabindex="-1" aria-hidden="true">
      <img src="${product.images[0]}" alt="" loading="lazy" width="600" height="600" />
      <span class="product-card__price-pill">${formatPrice(product.price)}</span>
    </a>
    <div class="product-card__body">
      <a class="product-card__title" href="${href}">${escapeHtml(product.title)}</a>
      <p class="product-card__subtitle">${escapeHtml(product.subtitle)}</p>
      <div class="product-card__rating" aria-label="Рейтинг ${product.rating} из 5">
        <span class="product-card__stars" aria-hidden="true">${renderStars(product.rating)}</span>
        <span class="product-card__rating-count">${product.rating.toFixed(1)}</span>
      </div>
      <button type="button" class="product-card__add-btn" aria-label="Добавить в корзину"></button>
    </div>
  `;
}

function renderStars(rating) {
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;
  const empty = 5 - full - (half ? 1 : 0);
  return '★'.repeat(full) + (half ? '⯨' : '') + '☆'.repeat(empty);
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[c]);
}
