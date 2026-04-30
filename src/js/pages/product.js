import '../../styles/tokens.css';
import '../../styles/global.css';
import '../../styles/product.css';

import { loadProducts } from '../store/products.js';
import { formatPrice } from '../lib/format.js';
import { addItem, getItemQty, updateQty } from '../store/cart.js';
import { onCartChange } from '../lib/events.js';
import { renderHeader } from '../components/header.js';
import { renderFooter } from '../components/footer.js';

renderHeader('product');
renderFooter();

const CART_ICON = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>`;
const PREV_ICON = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="15 18 9 12 15 6"/></svg>`;
const NEXT_ICON = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="9 18 15 12 9 6"/></svg>`;

const params = new URLSearchParams(location.search);
const id = Number(params.get('id'));
const products = loadProducts();
const product = products.find((p) => p.id === id);

const main = document.querySelector('main');

if (!product) {
  main.innerHTML = `
    <div class="product-not-found container">
      <p class="product-not-found__title">Product not found</p>
      <a class="product-not-found__link" href="/index.html">← Back to catalog</a>
    </div>
  `;
} else {
  document.title = `${product.title} — PawsStore`;
  main.innerHTML = buildPage(product);
  initGallery();
  initAddBtn();
}

function buildPage(p) {
  const CATEGORY_LABELS = { food: 'Food', toys: 'Toys', accessories: 'Accessories', care: 'Care' };
  const categoryLabel = CATEGORY_LABELS[p.category] ?? p.category;

  const dots = p.images
    .map((_, i) => `<button type="button" class="gallery-dot${i === 0 ? ' gallery-dot--active' : ''}" data-index="${i}" aria-label="Photo ${i + 1}"></button>`)
    .join('');

  const highlightsList = (p.highlights ?? [])
    .map((h) => `<li class="product-highlights__item">• ${escapeHtml(h)}</li>`)
    .join('');

  return `
    <div class="container">
      <nav class="product-breadcrumb" aria-label="Breadcrumb">
        <a class="product-breadcrumb__link" href="/index.html">Home</a>
        <span class="product-breadcrumb__sep">›</span>
        <a class="product-breadcrumb__link" href="/index.html">${categoryLabel}</a>
        <span class="product-breadcrumb__sep">›</span>
        <span class="product-breadcrumb__current">${escapeHtml(p.title)}</span>
      </nav>
    </div>
    <section class="product-page">
      <div class="container product-layout">

        <div class="product-gallery">
          <div class="product-gallery__main">
            <img id="gallery-main-img" src="${p.images[0]}" alt="${escapeHtml(p.title)}" />
            <button type="button" class="gallery-arrow gallery-arrow--prev" id="gallery-prev" aria-label="Previous photo">${PREV_ICON}</button>
            <button type="button" class="gallery-arrow gallery-arrow--next" id="gallery-next" aria-label="Next photo">${NEXT_ICON}</button>
          </div>
          <div class="gallery-dots" id="gallery-dots">${dots}</div>
        </div>

        <div class="product-info">
          <span class="product-info__category">${categoryLabel}</span>
          <h1 class="product-info__title">${escapeHtml(p.title)}</h1>
          <div class="product-info__rating" aria-label="Rating ${p.rating} out of 5">
            <span class="product-info__stars" aria-hidden="true">${renderStars(p.rating)}</span>
            <span class="product-info__rating-text">${p.rating.toFixed(1)} out of 5 stars</span>
          </div>
          <p class="product-info__price">${formatPrice(p.price)}</p>

          ${highlightsList ? `
          <div class="product-highlights">
            <h3 class="product-highlights__title">Key Highlights</h3>
            <ul class="product-highlights__list">${highlightsList}</ul>
          </div>` : ''}

          <div class="product-description">
            <h3 class="product-description__title">Description</h3>
            <p class="product-description__text">${escapeHtml(p.description)}</p>
          </div>

          <div class="product-quantity">
            <span class="product-quantity__label">Quantity:</span>
            <div class="product-quantity__ctrl">
              <button type="button" class="product-quantity__btn" id="qty-dec" aria-label="Decrease">−</button>
              <span class="product-quantity__val" id="qty-val">1</span>
              <button type="button" class="product-quantity__btn" id="qty-inc" aria-label="Increase">+</button>
            </div>
          </div>

          <button type="button" class="product-info__add-btn" id="product-add-btn" aria-label="Add to cart">
            ${CART_ICON}
            <span id="add-btn-label">Add to Cart</span>
          </button>

          ${p.specs?.length ? `
          <div class="product-specs">
            <div class="product-specs__header">
              <span class="product-specs__icon" aria-hidden="true">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
              </span>
              <h3 class="product-specs__title">Technical Specifications</h3>
            </div>
            <div class="product-specs__grid">
              ${p.specs.map((s) => `
              <div class="product-specs__cell">
                <svg class="product-specs__cell-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                <div>
                  <span class="product-specs__cell-label">${escapeHtml(s.label)}</span>
                  <span class="product-specs__cell-value">${escapeHtml(s.value)}</span>
                </div>
              </div>`).join('')}
            </div>
          </div>` : ''}
        </div>

      </div>
    </section>
  `;
}

// --- Gallery ---

function initGallery() {
  const mainImg = document.getElementById('gallery-main-img');
  const dotsContainer = document.getElementById('gallery-dots');
  const dots = dotsContainer.querySelectorAll('.gallery-dot');
  let current = 0;

  function goTo(idx) {
    current = (idx + product.images.length) % product.images.length;
    mainImg.src = product.images[current];
    dots.forEach((d, i) => d.classList.toggle('gallery-dot--active', i === current));
  }

  document.getElementById('gallery-prev').addEventListener('click', () => goTo(current - 1));
  document.getElementById('gallery-next').addEventListener('click', () => goTo(current + 1));
  dots.forEach((dot) => dot.addEventListener('click', () => goTo(Number(dot.dataset.index))));
}

// --- Add to cart ---

function initAddBtn() {
  const btn = document.getElementById('product-add-btn');
  const qtyVal = document.getElementById('qty-val');
  const qtyDec = document.getElementById('qty-dec');
  const qtyInc = document.getElementById('qty-inc');
  const label = document.getElementById('add-btn-label');
  if (!btn) return;

  // Локальный счётчик: stepper меняет именно его, а корзина обновляется
  // только по клику на «Add to Cart».
  let pendingQty = 1;

  function renderStepper() {
    qtyVal.textContent = String(pendingQty);
  }

  function renderBtn() {
    const inCart = getItemQty(product.id);
    label.textContent = inCart > 0 ? `In Cart: ${inCart} — Add ${pendingQty} more` : 'Add to Cart';
  }

  qtyInc.addEventListener('click', () => {
    pendingQty += 1;
    renderStepper();
    renderBtn();
  });
  qtyDec.addEventListener('click', () => {
    if (pendingQty > 1) {
      pendingQty -= 1;
      renderStepper();
      renderBtn();
    }
  });

  btn.addEventListener('click', () => {
    const inCart = getItemQty(product.id);
    if (inCart === 0) {
      // updateQty работает только для уже существующих items, для нового — addItem
      addItem(product.id);
      if (pendingQty > 1) updateQty(product.id, pendingQty);
    } else {
      updateQty(product.id, inCart + pendingQty);
    }
  });

  onCartChange(renderBtn);
  renderStepper();
  renderBtn();
}

// --- Helpers ---

function renderStars(rating) {
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;
  const empty = 5 - full - (half ? 1 : 0);
  return '★'.repeat(full) + (half ? '⯨' : '') + '☆'.repeat(empty);
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
}
