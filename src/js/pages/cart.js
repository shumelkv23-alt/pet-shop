import '../../styles/tokens.css';
import '../../styles/global.css';

import { renderHeader } from '../components/header.js';
import { renderFooter } from '../components/footer.js';

renderHeader('cart');
renderFooter();

console.info('[cart] entry loaded');
