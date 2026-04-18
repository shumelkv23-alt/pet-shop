import { emitCartChange } from '../lib/events.js';

const STORAGE_KEY = 'pet-shop:cart:v1';
const PROMO_SAVE10 = 'SAVE10';
const PROMO_DISCOUNT = 0.1;

let state = loadFromStorage();

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyState();
    const parsed = JSON.parse(raw);
    return {
      items: Array.isArray(parsed.items)
        ? parsed.items
            .filter((i) => Number.isFinite(i.id) && Number.isFinite(i.qty) && i.qty > 0)
            .map((i) => ({ id: i.id, qty: i.qty }))
        : [],
      promoCode: typeof parsed.promoCode === 'string' ? parsed.promoCode : null,
    };
  } catch {
    return emptyState();
  }
}

function emptyState() {
  return { items: [], promoCode: null };
}

function save(nextState) {
  state = nextState;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* storage full or disabled — UI продолжит работать in-memory */
  }
  emitCartChange(getSnapshot());
}

function getSnapshot() {
  return {
    items: state.items.map((i) => ({ ...i })),
    promoCode: state.promoCode,
  };
}

export function getCart() {
  return state.items.map((i) => ({ ...i }));
}

export function getPromoCode() {
  return state.promoCode;
}

export function getTotalCount() {
  return state.items.reduce((sum, i) => sum + i.qty, 0);
}

export function hasItem(id) {
  return state.items.some((i) => i.id === Number(id));
}

export function getItemQty(id) {
  const numericId = Number(id);
  const item = state.items.find((i) => i.id === numericId);
  return item ? item.qty : 0;
}

export function addItem(id) {
  const numericId = Number(id);
  const existing = state.items.find((i) => i.id === numericId);
  const nextItems = existing
    ? state.items.map((i) => (i.id === numericId ? { ...i, qty: i.qty + 1 } : i))
    : [...state.items, { id: numericId, qty: 1 }];
  save({ ...state, items: nextItems });
}

export function removeItem(id) {
  const numericId = Number(id);
  const nextItems = state.items.filter((i) => i.id !== numericId);
  save({ ...state, items: nextItems });
}

export function updateQty(id, qty) {
  const numericId = Number(id);
  const nextQty = Math.max(0, Math.floor(qty));
  if (nextQty === 0) {
    removeItem(numericId);
    return;
  }
  const nextItems = state.items.map((i) =>
    i.id === numericId ? { ...i, qty: nextQty } : i,
  );
  save({ ...state, items: nextItems });
}

export function clearCart() {
  save(emptyState());
}

/**
 * Пытается применить промокод. Возвращает true при успехе, false при ошибке.
 * Сейчас единственный валидный код — SAVE10 (регистр неважен).
 */
export function applyPromoCode(code) {
  const normalized = String(code ?? '').trim().toUpperCase();
  if (normalized !== PROMO_SAVE10) return false;
  save({ ...state, promoCode: PROMO_SAVE10 });
  return true;
}

export function clearPromoCode() {
  save({ ...state, promoCode: null });
}

/**
 * Считает итоги по корзине с учётом промокода. products — массив из products.js.
 * Возвращает { subtotal, discount, total, missing } (missing — id-шники товаров, которых нет в каталоге).
 */
export function getTotals(products) {
  const map = new Map(products.map((p) => [p.id, p]));
  const missing = [];
  let subtotal = 0;
  for (const { id, qty } of state.items) {
    const product = map.get(id);
    if (!product) {
      missing.push(id);
      continue;
    }
    subtotal += product.price * qty;
  }
  const discount = state.promoCode === PROMO_SAVE10 ? subtotal * PROMO_DISCOUNT : 0;
  const total = subtotal - discount;
  return { subtotal, discount, total, missing };
}
