import '../../styles/tokens.css';
import '../../styles/global.css';
import '../../styles/cart.css';

import { loadProducts } from '../store/products.js';
import { formatPrice } from '../lib/format.js';
import * as cartStore from '../store/cart.js';
import { onCartChange } from '../lib/events.js';
import { renderHeader } from '../components/header.js';
import { renderFooter } from '../components/footer.js';

renderHeader('cart');
renderFooter();

const TAX_RATE = 0.08;
const FREE_SHIP_THRESHOLD = 50;

const products = loadProducts();
const main = document.querySelector('main');

const TAG_ICON = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><circle cx="7.5" cy="7.5" r="1.5" fill="currentColor"/></svg>`;
const CHECK_ICON = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>`;
const TRASH_ICON = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"/></svg>`;
const CLOCK_ICON = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15 14"/></svg>`;
const PIN_ICON = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>`;
const CARD_ICON = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>`;

main.innerHTML = `
  <section class="cart-page" id="cart-section">
    <div class="container">
      <div class="cart-page__head">
        <div class="cart-page__heading">
          <h1 class="cart-page__title gradient-text">Shopping Bag</h1>
          <p class="cart-page__subtitle" id="cart-subtitle"></p>
        </div>
        <ol class="cart-stepper" aria-label="Checkout progress">
          <li class="cart-stepper__step cart-stepper__step--active">
            <span class="cart-stepper__num">1</span>
            <span class="cart-stepper__label">Cart</span>
          </li>
          <span class="cart-stepper__sep" aria-hidden="true">›</span>
          <li class="cart-stepper__step">
            <span class="cart-stepper__num">2</span>
            <span class="cart-stepper__label">Checkout</span>
          </li>
          <span class="cart-stepper__sep" aria-hidden="true">›</span>
          <li class="cart-stepper__step">
            <span class="cart-stepper__num">3</span>
            <span class="cart-stepper__label">Complete</span>
          </li>
        </ol>
      </div>

      <div class="cart-shipping-banner" id="cart-shipping-banner" hidden>
        <span class="cart-shipping-banner__icon">${TAG_ICON}</span>
        <span class="cart-shipping-banner__text">
          Free shipping on orders over <strong>$${FREE_SHIP_THRESHOLD}</strong>
        </span>
        <span class="cart-shipping-banner__status" id="cart-shipping-status"></span>
      </div>

      <div class="cart-layout" id="cart-layout"></div>
    </div>
  </section>
`;

const layout = document.getElementById('cart-layout');
const subtitle = document.getElementById('cart-subtitle');
const banner = document.getElementById('cart-shipping-banner');
const bannerStatus = document.getElementById('cart-shipping-status');
const section = document.getElementById('cart-section');

render();
onCartChange(render);

function render() {
  const cartItems = cartStore.getCart();
  const totalCount = cartStore.getTotalCount();

  subtitle.textContent = totalCount === 0
    ? 'Your bag is empty'
    : `${totalCount} ${totalCount === 1 ? 'item' : 'items'} ready for checkout`;

  if (cartItems.length === 0) {
    banner.hidden = true;
    section.classList.add('cart-page--empty');
    layout.classList.add('cart-layout--empty');
    layout.innerHTML = buildEmpty();
    return;
  }

  section.classList.remove('cart-page--empty');
  layout.classList.remove('cart-layout--empty');

  const totals = cartStore.getTotals(products);
  const promoCode = cartStore.getPromoCode();
  const tax = (totals.subtotal - totals.discount) * TAX_RATE;
  const totalWithTax = totals.total + tax;

  updateShippingBanner(totals.subtotal);

  layout.innerHTML = `
    <div class="cart-items">
      ${cartItems.map((item) => buildItem(item)).join('')}
    </div>
    <aside class="cart-summary">
      ${buildSummary({ totals, promoCode, tax, totalWithTax, totalCount })}
    </aside>
  `;

  wireItems();
  wirePromo(promoCode);
}

function updateShippingBanner(subtotal) {
  banner.hidden = false;
  const qualified = subtotal >= FREE_SHIP_THRESHOLD;
  banner.classList.toggle('cart-shipping-banner--qualified', qualified);
  bannerStatus.innerHTML = qualified
    ? `${CHECK_ICON}<span>Qualified!</span>`
    : `<span>$${(FREE_SHIP_THRESHOLD - subtotal).toFixed(2)} to go</span>`;
}

function buildItem({ id, qty }) {
  const p = products.find((pr) => pr.id === id);
  if (!p) return '';
  return `
    <article class="cart-item" data-id="${id}">
      <img class="cart-item__img" src="${p.images[0]}" alt="" />
      <div class="cart-item__info">
        <a class="cart-item__title" href="/product.html?id=${id}" title="${escapeHtml(p.title)}">${escapeHtml(p.title)}</a>
        <span class="cart-item__subtitle">${escapeHtml(p.subtitle)}</span>
      </div>
      <div class="cart-item__qty" role="group" aria-label="Quantity">
        <button type="button" class="cart-item__qty-btn" data-action="dec" aria-label="Decrease quantity">−</button>
        <span class="cart-item__qty-val" aria-live="polite">${qty}</span>
        <button type="button" class="cart-item__qty-btn" data-action="inc" aria-label="Increase quantity">+</button>
      </div>
      <div class="cart-item__price-block">
        <span class="cart-item__price">${formatPrice(p.price * qty)}</span>
        <span class="cart-item__unit">${formatPrice(p.price)} each</span>
      </div>
      <button type="button" class="cart-item__remove" data-action="remove" aria-label="Remove from cart">
        ${TRASH_ICON}
      </button>
    </article>
  `;
}

function buildSummary({ totals, promoCode, tax, totalWithTax, totalCount }) {
  const discountLine = totals.discount > 0
    ? `<div class="cart-summary__line cart-summary__line--discount">
        <span>Discount (SAVE10)</span>
        <span>−${formatPrice(totals.discount)}</span>
      </div>`
    : '';

  return `
    <header class="cart-summary__header">
      <h2 class="cart-summary__title">Order Summary</h2>
      <p class="cart-summary__count">${totalCount} ${totalCount === 1 ? 'item' : 'items'} in your bag</p>
    </header>

    <div class="cart-summary__body">
      ${buildPromo(promoCode)}

      <div class="cart-summary__lines">
        <div class="cart-summary__line">
          <span>Subtotal</span>
          <span>${formatPrice(totals.subtotal)}</span>
        </div>
        ${discountLine}
        <div class="cart-summary__line">
          <span>Tax (${Math.round(TAX_RATE * 100)}%)</span>
          <span>${formatPrice(tax)}</span>
        </div>
      </div>

      <div class="cart-summary__total">
        <span>Total</span>
        <span class="cart-summary__total-val">${formatPrice(totalWithTax)}</span>
      </div>

      <div class="cart-summary__info">
        <div class="cart-info-card cart-info-card--blue">
          <span class="cart-info-card__icon">${CLOCK_ICON}</span>
          <div class="cart-info-card__text">
            <span class="cart-info-card__title">Delivery Time</span>
            <span class="cart-info-card__value">3-5 business days</span>
          </div>
        </div>
        <div class="cart-info-card cart-info-card--purple">
          <span class="cart-info-card__icon">${PIN_ICON}</span>
          <div class="cart-info-card__text">
            <span class="cart-info-card__title">Shipping To</span>
            <span class="cart-info-card__value">123 Main Street, NY 10001</span>
          </div>
        </div>
      </div>

      <button type="button" class="cart-checkout-btn">
        ${CARD_ICON}
        <span>Proceed to Checkout</span>
      </button>

      <a class="cart-continue" href="/index.html">← Continue Shopping</a>
    </div>
  `;
}

function buildPromo(promoCode) {
  if (promoCode) {
    return `
      <div class="cart-promo">
        <div class="cart-promo__head">
          <span class="cart-promo__icon">${TAG_ICON}</span>
          <span class="cart-promo__label">Promo Code</span>
        </div>
        <div class="cart-promo__applied">
          <span><strong>${promoCode}</strong> applied — 10% off</span>
          <button type="button" class="cart-promo__remove-btn" id="promo-remove">Remove</button>
        </div>
      </div>
    `;
  }
  return `
    <div class="cart-promo">
      <div class="cart-promo__head">
        <span class="cart-promo__icon">${TAG_ICON}</span>
        <label class="cart-promo__label" for="promo-input">Promo Code</label>
      </div>
      <div class="cart-promo__row">
        <input class="cart-promo__input" id="promo-input" type="text" placeholder="Enter code" autocomplete="off" />
        <button type="button" class="cart-promo__apply-btn" id="promo-apply">Apply</button>
      </div>
      <p class="cart-promo__msg" id="promo-msg" aria-live="polite"></p>
    </div>
  `;
}

function buildEmpty() {
  const BAG_ICON = `<svg viewBox="0 0 64 64" fill="none" aria-hidden="true"><rect x="10" y="24" width="44" height="34" rx="6" fill="url(#bag-fill)" opacity="0.15"/><rect x="10" y="24" width="44" height="34" rx="6" stroke="url(#bag-stroke)" stroke-width="3" fill="none"/><path d="M22 24v-4a10 10 0 0 1 20 0v4" stroke="url(#bag-stroke)" stroke-width="3" stroke-linecap="round" fill="none"/><circle cx="32" cy="41" r="4" fill="url(#bag-stroke-def)"/><defs><linearGradient id="bag-fill" x1="10" y1="24" x2="54" y2="58" gradientUnits="userSpaceOnUse"><stop stop-color="#F97316"/><stop offset="1" stop-color="#FF1E87"/></linearGradient><linearGradient id="bag-stroke" x1="10" y1="18" x2="54" y2="58" gradientUnits="userSpaceOnUse"><stop stop-color="#F97316"/><stop offset="1" stop-color="#FF1E87"/></linearGradient><linearGradient id="bag-stroke-def" x1="28" y1="37" x2="36" y2="45" gradientUnits="userSpaceOnUse"><stop stop-color="#F97316"/><stop offset="1" stop-color="#FF1E87"/></linearGradient></defs></svg>`;
  const ARROW_ICON = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="9 6 15 12 9 18"/></svg>`;
  return `
    <div class="cart-empty">
      <div class="cart-empty__circle">
        <span class="cart-empty__icon">${BAG_ICON}</span>
      </div>
      <h2 class="cart-empty__title">Your cart is empty</h2>
      <p class="cart-empty__sub">Discover amazing products for your furry friends!</p>
      <a class="cart-empty__link" href="/index.html">
        <span>Start Shopping</span>
        <span class="cart-empty__arrow">${ARROW_ICON}</span>
      </a>
    </div>
  `;
}

function wireItems() {
  layout.querySelectorAll('.cart-item').forEach((row) => {
    const id = Number(row.dataset.id);
    row.querySelector('[data-action="inc"]').addEventListener('click', () => {
      cartStore.updateQty(id, cartStore.getItemQty(id) + 1);
    });
    row.querySelector('[data-action="dec"]').addEventListener('click', () => {
      cartStore.updateQty(id, cartStore.getItemQty(id) - 1);
    });
    row.querySelector('[data-action="remove"]').addEventListener('click', () => {
      cartStore.removeItem(id);
    });
  });
}

function wirePromo(promoCode) {
  if (promoCode) {
    const removeBtn = document.getElementById('promo-remove');
    removeBtn?.addEventListener('click', () => cartStore.clearPromoCode());
    return;
  }

  const input = document.getElementById('promo-input');
  const applyBtn = document.getElementById('promo-apply');
  const msg = document.getElementById('promo-msg');

  applyBtn?.addEventListener('click', () => applyPromo());
  input?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') applyPromo();
  });

  function applyPromo() {
    const code = input.value.trim();
    if (!code) return;
    const ok = cartStore.applyPromoCode(code);
    if (ok) {
      msg.textContent = 'Promo code applied — 10% off!';
      msg.className = 'cart-promo__msg cart-promo__msg--ok';
      input.classList.remove('cart-promo__input--error');
    } else {
      msg.textContent = 'Invalid code. Try SAVE10';
      msg.className = 'cart-promo__msg cart-promo__msg--err';
      input.classList.add('cart-promo__input--error');
    }
  }
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
