import '../../styles/tokens.css';
import '../../styles/global.css';
import '../../styles/product.css';

import { loadProducts } from '../store/products.js';
import { formatPrice } from '../lib/format.js';
import { addItem, getItemQty } from '../store/cart.js';
import { onCartChange } from '../lib/events.js';
import { renderHeader } from '../components/header.js';
import { renderFooter } from '../components/footer.js';

renderHeader('product');
renderFooter();

const params = new URLSearchParams(location.search);
const id = Number(params.get('id'));
const products = loadProducts();
const product = products.find((p) => p.id === id);

const main = document.querySelector('main');

if (!product) {
  main.innerHTML = `
    <div class="product-not-found container">
      <p class="product-not-found__title">Товар не найден</p>
      <a class="product-not-found__link" href="/index.html">← Вернуться в каталог</a>
    </div>
  `;
} else {
  document.title = `${product.title} — PawsStore`;
  main.innerHTML = buildPage(product);
  initGallery();
  initAccordion();
  initAddBtn();
}

function buildPage(p) {
  const CATEGORY_LABELS = {
    food: 'Корм',
    toys: 'Игрушки',
    accessories: 'Аксессуары',
    care: 'Уход',
  };

  const thumbs = p.images
    .map(
      (src, i) =>
        `<button type="button" class="product-gallery__thumb${i === 0 ? ' product-gallery__thumb--active' : ''}" data-index="${i}" aria-label="Фото ${i + 1}">
          <img src="${src}" alt="" />
        </button>`,
    )
    .join('');

  const stars = renderStars(p.rating);

  return `
    <section class="product-page">
      <div class="container product-layout">
        <div class="product-gallery">
          <div class="product-gallery__main">
            <img id="gallery-main-img" src="${p.images[0]}" alt="${escapeHtml(p.title)}" />
          </div>
          <div class="product-gallery__thumbs">${thumbs}</div>
        </div>
        <div class="product-info">
          <div>
            <span class="product-info__category">${CATEGORY_LABELS[p.category] ?? p.category}</span>
          </div>
          <div>
            <h1 class="product-info__title">${escapeHtml(p.title)}</h1>
            <p class="product-info__subtitle">${escapeHtml(p.subtitle)}</p>
          </div>
          <div class="product-info__rating" aria-label="Рейтинг ${p.rating} из 5">
            <span class="product-info__stars" aria-hidden="true">${stars}</span>
            <span>${p.rating.toFixed(1)}</span>
          </div>
          <p class="product-info__price">${formatPrice(p.price)}</p>
          <button type="button" class="product-info__add-btn" id="product-add-btn" aria-label="Добавить в корзину">
            В корзину
          </button>
          <div class="product-accordion">
            ${buildAccordion([
              { title: 'Описание', content: escapeHtml(p.description) },
              { title: 'Доставка', content: 'Доставка по России от 1 до 7 рабочих дней. Бесплатная доставка при заказе от 3 000 ₽.' },
              { title: 'Возврат', content: 'Возврат товара в течение 14 дней при сохранении упаковки и товарного вида.' },
            ])}
          </div>
        </div>
      </div>
    </section>
  `;
}

function buildAccordion(items) {
  const CHEVRON = `<svg class="product-accordion__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="6 9 12 15 18 9"/></svg>`;
  return items
    .map(
      (item, i) => `
    <div class="product-accordion__item${i === 0 ? ' product-accordion__item--open' : ''}">
      <button type="button" class="product-accordion__trigger" aria-expanded="${i === 0}" data-accordion-trigger>
        ${item.title}
        ${CHEVRON}
      </button>
      <div class="product-accordion__body" role="region">
        <div class="product-accordion__inner">
          <p class="product-accordion__content">${item.content}</p>
        </div>
      </div>
    </div>`,
    )
    .join('');
}

function initGallery() {
  const mainImg = document.getElementById('gallery-main-img');
  const thumbs = document.querySelectorAll('.product-gallery__thumb');
  thumbs.forEach((thumb) => {
    thumb.addEventListener('click', () => {
      const idx = Number(thumb.dataset.index);
      mainImg.src = product.images[idx];
      thumbs.forEach((t) => t.classList.toggle('product-gallery__thumb--active', t === thumb));
    });
  });
}

function initAccordion() {
  document.querySelectorAll('[data-accordion-trigger]').forEach((trigger) => {
    trigger.addEventListener('click', () => {
      const item = trigger.closest('.product-accordion__item');
      const isOpen = item.classList.contains('product-accordion__item--open');
      item.classList.toggle('product-accordion__item--open', !isOpen);
      trigger.setAttribute('aria-expanded', String(!isOpen));
    });
  });
}

function initAddBtn() {
  const btn = document.getElementById('product-add-btn');
  if (!btn) return;
  syncAddBtn(btn);
  btn.addEventListener('click', () => addItem(product.id));
  onCartChange(() => syncAddBtn(btn));
}

function syncAddBtn(btn) {
  const qty = getItemQty(product.id);
  if (qty === 0) {
    btn.textContent = 'В корзину';
    btn.dataset.state = 'idle';
  } else {
    btn.textContent = `В корзине: ${qty} шт.`;
    btn.dataset.state = 'added';
  }
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
