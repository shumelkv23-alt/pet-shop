import productsData from '../../data/products.json';

let cache = null;

export function loadProducts() {
  if (cache === null) {
    cache = Object.freeze(productsData.map((p) => Object.freeze({ ...p })));
  }
  return cache;
}

export function findById(id) {
  const numericId = Number(id);
  return loadProducts().find((p) => p.id === numericId) ?? null;
}
