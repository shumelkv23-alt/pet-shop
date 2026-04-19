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

const products = loadProducts();
const main = document.querySelector('main');

main.innerHTML = `
  <section class="cart-page">
    <div class="container">
      <h1 class="cart-page__title">Cart</h1>
      <div class="cart-layout" id="cart-layout"></div>
    </div>
  </section>
`;

const layout = document.getElementById('cart-layout');

render();
onCartChange(render);

function render() {
  const cartItems = cartStore.getCart();

  if (cartItems.length === 0) {
    layout.innerHTML = buildEmpty();
    return;
  }

  const totals = cartStore.getTotals(products);
  const promoCode = cartStore.getPromoCode();

  layout.innerHTML = `
    <div class="cart-items" id="cart-items-list">
      ${cartItems.map((item) => buildItem(item)).join('')}
    </div>
    <aside class="cart-summary">
      ${buildSummary(totals, promoCode)}
    </aside>
  `;

  wireItems();
  wirePromo(promoCode);
}

function buildItem({ id, qty }) {
  const p = products.find((pr) => pr.id === id);
  if (!p) return '';
  return `
    <div class="cart-item" data-id="${id}">
      <img class="cart-item__img" src="${p.images[0]}" alt="" />
      <div class="cart-item__info">
        <a class="cart-item__title" href="/product.html?id=${id}" title="${escapeHtml(p.title)}">${escapeHtml(p.title)}</a>
        <span class="cart-item__subtitle">${escapeHtml(p.subtitle)}</span>
        <span class="cart-item__price">${formatPrice(p.price * qty)}</span>
      </div>
      <div class="cart-item__actions">
        <div class="cart-item__qty">
          <button type="button" class="cart-item__qty-btn" data-action="dec" aria-label="Decrease quantity">−</button>
          <span class="cart-item__qty-val" aria-live="polite">${qty}</span>
          <button type="button" class="cart-item__qty-btn" data-action="inc" aria-label="Increase quantity">+</button>
        </div>
        <button type="button" class="cart-item__remove" data-action="remove" aria-label="Remove from cart">Remove</button>
      </div>
    </div>
  `;
}

function buildSummary(totals, promoCode) {
  const discountLine = totals.discount > 0
    ? `<div class="cart-summary__line cart-summary__line--discount">
        <span>Discount SAVE10</span>
        <span>−${formatPrice(totals.discount)}</span>
      </div>`
    : '';

  return `
    <p class="cart-summary__title">Order Summary</p>
    <div class="cart-summary__line">
      <span>Items</span>
      <span>${formatPrice(totals.subtotal)}</span>
    </div>
    ${discountLine}
    <hr class="cart-summary__divider" />
    <div class="cart-summary__total">
      <span>Total</span>
      <span class="cart-summary__total-val">${formatPrice(totals.total)}</span>
    </div>
    ${buildPromo(promoCode)}
    <button type="button" class="cart-checkout-btn">Checkout</button>
  `;
}

function buildPromo(promoCode) {
  if (promoCode) {
    return `
      <div class="cart-promo">
        <div class="cart-summary__line cart-summary__line--discount">
          <span>Promo code <strong>${promoCode}</strong> applied</span>
          <button type="button" class="cart-promo__remove-btn" id="promo-remove">Remove</button>
        </div>
      </div>
    `;
  }
  return `
    <div class="cart-promo">
      <label class="cart-promo__label" for="promo-input">Promo code</label>
      <div class="cart-promo__row">
        <input class="cart-promo__input" id="promo-input" type="text" placeholder="SAVE10" autocomplete="off" />
        <button type="button" class="cart-promo__apply-btn" id="promo-apply">Apply</button>
      </div>
      <p class="cart-promo__msg" id="promo-msg" aria-live="polite"></p>
    </div>
  `;
}

function buildEmpty() {
  const CART_ICON = `<svg class="cart-empty__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>`;
  return `
    <div class="cart-empty">
      ${CART_ICON}
      <h2 class="cart-empty__title">Your cart is empty</h2>
      <p class="cart-empty__sub">Add something from the catalog — your pets will love it!</p>
      <a class="cart-empty__link" href="/index.html">Go to catalog</a>
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
      msg.textContent = 'Invalid promo code. Try SAVE10';
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
