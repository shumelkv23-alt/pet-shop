import { formatPrice } from '../lib/format.js';
import { addItem } from '../store/cart.js';

const CART_ICON = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>`;
const CHECK_ICON = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>`;

const FLASH_MS = 1000;

const OVERLAY_MS = 1000;

export function createCard(product) {
  const card = document.createElement('article');
  card.className = 'product-card';
  card.dataset.productId = String(product.id);
  card.innerHTML = buildMarkup(product);

  // Overlay показываем по mouseenter и автоматически прячем через OVERLAY_MS,
  // даже если курсор всё ещё на карточке.
  let overlayTimer = null;
  card.addEventListener('mouseenter', () => {
    card.classList.add('product-card--show-overlay');
    clearTimeout(overlayTimer);
    overlayTimer = setTimeout(() => {
      card.classList.remove('product-card--show-overlay');
    }, OVERLAY_MS);
  });
  card.addEventListener('mouseleave', () => {
    clearTimeout(overlayTimer);
    card.classList.remove('product-card--show-overlay');
  });

  const btn = card.querySelector('.product-card__add-btn');
  if (btn) {
    btn.innerHTML = CART_ICON;
    let flashTimer = null;
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      addItem(product.id);
      btn.innerHTML = CHECK_ICON;
      btn.dataset.state = 'added';
      btn.setAttribute('aria-label', 'Added to cart');
      // На время флэша прячем overlay, чтобы не отвлекал
      clearTimeout(overlayTimer);
      card.classList.remove('product-card--show-overlay');
      clearTimeout(flashTimer);
      flashTimer = setTimeout(() => {
        btn.innerHTML = CART_ICON;
        btn.dataset.state = 'idle';
        btn.setAttribute('aria-label', 'Add to cart');
      }, FLASH_MS);
    });
  }

  return card;
}

function buildMarkup(product) {
  const href = `/product.html?id=${product.id}`;
  const ratingLabel = product.rating.toFixed(1);
  const stars = renderStars(product.rating);
  return `
    <a class="product-card__media" href="${href}" tabindex="-1" aria-hidden="true">
      <img src="${product.images[0]}" alt="" loading="lazy" width="600" height="600" />
      <span class="product-card__price-pill">${formatPrice(product.price)}</span>
      <div class="product-card__overlay">
        <div class="product-card__overlay-info">
          <span class="product-card__title-overlay">${escapeHtml(product.title)}</span>
          <div class="product-card__rating" aria-label="Rating ${ratingLabel} out of 5">
            <span class="product-card__stars" aria-hidden="true">${stars}</span>
            <span class="product-card__rating-count">(${ratingLabel})</span>
          </div>
        </div>
        <div class="product-card__overlay-footer">
          <p class="product-card__price">${formatPrice(product.price)}</p>
          <button type="button" class="product-card__add-btn" aria-label="Add to cart"></button>
        </div>
      </div>
    </a>
    <div class="product-card__footer">
      <a class="product-card__title" href="${href}">${escapeHtml(product.title)}</a>
      <div class="product-card__rating" aria-label="Rating ${ratingLabel} out of 5">
        <span class="product-card__stars" aria-hidden="true">${stars}</span>
        <span class="product-card__rating-count">(${ratingLabel})</span>
      </div>
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
