export const cartBus = new EventTarget();

export const CART_CHANGE = 'cart:change';

export function onCartChange(listener) {
  const handler = (event) => listener(event.detail);
  cartBus.addEventListener(CART_CHANGE, handler);
  return () => cartBus.removeEventListener(CART_CHANGE, handler);
}

export function emitCartChange(detail) {
  cartBus.dispatchEvent(new CustomEvent(CART_CHANGE, { detail }));
}
