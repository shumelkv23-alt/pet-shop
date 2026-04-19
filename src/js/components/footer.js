import '../../styles/footer.css';

const PAW_ICON = `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><circle cx="5.5" cy="9" r="2"/><circle cx="9.5" cy="5.5" r="2"/><circle cx="14.5" cy="5.5" r="2"/><circle cx="18.5" cy="9" r="2"/><path d="M12 11c-3 0-6 2.2-6 5.5 0 2 1.3 3.5 3 3.5 1.2 0 2-0.5 3-0.5s1.8 0.5 3 0.5c1.7 0 3-1.5 3-3.5 0-3.3-3-5.5-6-5.5z"/></svg>`;

const SEND_ICON = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg>`;

const FACEBOOK_ICON = `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M22 12a10 10 0 1 0-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.5 1.49-3.89 3.77-3.89 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.78l-.44 2.89h-2.34v6.99A10 10 0 0 0 22 12z"/></svg>`;

const TWITTER_ICON = `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>`;

const INSTAGRAM_ICON = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>`;

const SOCIAL_ICONS = {
  facebook: FACEBOOK_ICON,
  twitter: TWITTER_ICON,
  instagram: INSTAGRAM_ICON,
};

export function renderFooter() {
  const mount = document.getElementById('app-footer');
  if (!mount) return;

  mount.className = 'site-footer';
  mount.innerHTML = `
    <div class="container">
      <div class="site-footer__grid">
        <div class="site-footer__brand">
          <a class="site-header__logo" href="/index.html">
            <span class="site-header__logo-mark">${PAW_ICON}</span>
            <span class="site-header__logo-text">PawsStore</span>
          </a>
          <p class="site-footer__tagline">
            Your trusted source for premium pet products.
          </p>
        </div>

        <div>
          <h4 class="site-footer__heading">Quick Links</h4>
          <ul class="site-footer__list">
            <li><a class="site-footer__link" href="/index.html">Catalog</a></li>
            <li><a class="site-footer__link" href="#">New Arrivals</a></li>
            <li><a class="site-footer__link" href="#">Best Sellers</a></li>
            <li><a class="site-footer__link" href="#">Deals</a></li>
          </ul>
        </div>

        <div>
          <h4 class="site-footer__heading">Support</h4>
          <ul class="site-footer__list">
            <li><a class="site-footer__link" href="#">Contact Us</a></li>
            <li><a class="site-footer__link" href="#">Shipping</a></li>
            <li><a class="site-footer__link" href="#">Returns</a></li>
            <li><a class="site-footer__link" href="#">FAQ</a></li>
          </ul>
        </div>

        <div>
          <h4 class="site-footer__heading">Newsletter</h4>
          <p class="site-footer__newsletter-text">
            Subscribe to get special offers and news.
          </p>
          <form class="site-footer__newsletter-form" onsubmit="event.preventDefault()">
            <input
              class="site-footer__newsletter-input"
              type="email"
              placeholder="Your email"
              aria-label="Email for newsletter"
            />
            <button type="submit" class="site-footer__newsletter-btn" aria-label="Subscribe">
              ${SEND_ICON}
            </button>
          </form>
        </div>
      </div>

      <div class="site-footer__bottom">
        <span>© ${new Date().getFullYear()} PawsStore. All rights reserved.</span>
        <div class="site-footer__socials" aria-label="Social media">
          <a class="site-footer__social" href="#" aria-label="Facebook">${SOCIAL_ICONS.facebook}</a>
          <a class="site-footer__social" href="#" aria-label="Twitter">${SOCIAL_ICONS.twitter}</a>
          <a class="site-footer__social" href="#" aria-label="Instagram">${SOCIAL_ICONS.instagram}</a>
        </div>
      </div>
    </div>
  `;
}
