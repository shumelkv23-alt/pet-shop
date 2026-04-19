import { formatPrice } from '../lib/format.js';
import { addItem, getItemQty } from '../store/cart.js';
import { onCartChange } from '../lib/events.js';

const CART_ICON = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>`;

const CHECK_ICON = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>`;

export function createCard(product) {
  const card = document.createElement('article');
  card.className = 'product-card';
  card.dataset.productId = String(product.id);
  card.innerHTML = buildMarkup(product);

  const btn = card.querySelector('.product-card__add-btn');
  if (btn) {
    syncBtn(btn, product.id);
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      addItem(product.id);
    });
    onCartChange(() => syncBtn(btn, product.id));
  }

  return card;
}

function syncBtn(btn, id) {
  const qty = getItemQty(id);
  if (qty === 0) {
    btn.innerHTML = CART_ICON;
    btn.dataset.state = 'idle';
    btn.setAttribute('aria-label', 'Добавить в корзину');
  } else {
    btn.innerHTML = CHECK_ICON;
    btn.dataset.state = 'added';
    btn.setAttribute('aria-label', `В корзине: ${qty} шт.`);
    btn.dataset.qty = qty;
  }
}

function buildMarkup(product) {
  const href = `/product.html?id=${product.id}`;
  return `
    <a class="product-card__media" href="${href}" tabindex="-1" aria-hidden="true">
      <img src="${product.images[0]}" alt="" loading="lazy" width="600" height="600" />
      <span class="product-card__price-pill">${formatPrice(product.price)}</span>
      <button type="button" class="product-card__add-btn" aria-label="Добавить в корзину"></button>
    </a>
    <div class="product-card__body">
      <a class="product-card__title" href="${href}">${escapeHtml(product.title)}</a>
      <div class="product-card__rating" aria-label="Рейтинг ${product.rating} из 5">
        <span class="product-card__stars" aria-hidden="true">${renderStars(product.rating)}</span>
        <span class="product-card__rating-count">(${Math.round(product.rating * 10)})</span>
      </div>
      <p class="product-card__price">${formatPrice(product.price)}</p>
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
