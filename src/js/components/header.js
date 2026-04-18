import '../../styles/header.css';
import { getTotalCount } from '../store/cart.js';
import { onCartChange } from '../lib/events.js';

const NAV_LINKS = [
  { key: 'catalog', href: '/index.html', label: 'Каталог' },
  { key: 'cart', href: '/cart.html', label: 'Корзина', isCart: true },
];

const CART_ICON = `<svg class="cart-link__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 4h2l2.4 11.3a2 2 0 0 0 2 1.7h8.2a2 2 0 0 0 2-1.6L21 8H6"/><circle cx="9" cy="20" r="1.5"/><circle cx="18" cy="20" r="1.5"/></svg>`;

export function renderHeader(activeKey) {
  const mount = document.getElementById('app-header');
  if (!mount) return;

  mount.className = 'site-header';
  mount.innerHTML = `
    <div class="site-header__inner container">
      <a class="site-header__logo" href="/index.html" aria-label="Pet Shop — главная">
        <span class="site-header__logo-mark" aria-hidden="true">🐾</span>
        <span>Pet Shop</span>
      </a>
      <nav class="site-header__nav" aria-label="Основная навигация">
        ${NAV_LINKS.map((link) => renderLink(link, activeKey)).join('')}
      </nav>
    </div>
  `;

  const badge = mount.querySelector('[data-cart-badge]');
  if (badge) {
    updateBadge(badge, getTotalCount(), { animate: false });
    onCartChange(() => updateBadge(badge, getTotalCount(), { animate: true }));
  }
}

function renderLink(link, activeKey) {
  const current = link.key === activeKey ? 'aria-current="page"' : '';
  if (link.isCart) {
    return `
      <a class="site-header__link cart-link" href="${link.href}" ${current} aria-label="${link.label}">
        ${CART_ICON}
        <span class="cart-badge" data-cart-badge data-empty="true" aria-live="polite">0</span>
      </a>
    `;
  }
  return `<a class="site-header__link" href="${link.href}" ${current}>${link.label}</a>`;
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
