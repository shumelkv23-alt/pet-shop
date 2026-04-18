import '../../styles/header.css';
import { getTotalCount } from '../store/cart.js';
import { onCartChange } from '../lib/events.js';

const PAW_ICON = `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><circle cx="5.5" cy="9" r="2"/><circle cx="9.5" cy="5.5" r="2"/><circle cx="14.5" cy="5.5" r="2"/><circle cx="18.5" cy="9" r="2"/><path d="M12 11c-3 0-6 2.2-6 5.5 0 2 1.3 3.5 3 3.5 1.2 0 2-0.5 3-0.5s1.8 0.5 3 0.5c1.7 0 3-1.5 3-3.5 0-3.3-3-5.5-6-5.5z"/></svg>`;

const SEARCH_ICON = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>`;

const CART_ICON = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>`;

export function renderHeader(activeKey) {
  const mount = document.getElementById('app-header');
  if (!mount) return;

  mount.className = 'site-header';
  mount.innerHTML = `
    <div class="site-header__inner container">
      <a class="site-header__logo" href="/index.html" aria-label="PawsStore — главная">
        <span class="site-header__logo-mark">${PAW_ICON}</span>
        <span class="site-header__logo-text">PawsStore</span>
      </a>
      <nav class="site-header__nav" aria-label="Основная навигация">
        <a class="site-header__link" href="/index.html" ${activeKey === 'catalog' ? 'aria-current="page"' : ''}>Каталог</a>
      </nav>
      <div class="site-header__actions">
        <button type="button" class="site-header__icon-btn" aria-label="Поиск (скоро)" disabled>
          ${SEARCH_ICON}
        </button>
        <a
          class="site-header__icon-btn cart-link"
          href="/cart.html"
          aria-label="Корзина"
          ${activeKey === 'cart' ? 'aria-current="page"' : ''}
        >
          ${CART_ICON}
          <span class="cart-badge" data-cart-badge data-empty="true" aria-live="polite">0</span>
        </a>
      </div>
    </div>
  `;

  const badge = mount.querySelector('[data-cart-badge]');
  if (badge) {
    updateBadge(badge, getTotalCount(), { animate: false });
    onCartChange(() => updateBadge(badge, getTotalCount(), { animate: true }));
  }
}

function updateBadge(badge, count, { animate }) {
  badge.textContent = String(count);
  badge.dataset.empty = count === 0 ? 'true' : 'false';
  if (animate && count > 0) {
    badge.classList.remove('cart-badge--pulse');
    void badge.offsetWidth;
    badge.classList.add('cart-badge--pulse');
  }
}
