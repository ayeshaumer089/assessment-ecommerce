// Shipping rules shared across checkout + seeding.
// Orders at or above the threshold ship free; otherwise a flat rate applies.
export const FREE_SHIPPING_THRESHOLD = 50;
export const SHIPPING_COST = 9.99;

/** Returns the shipping cost for a given order subtotal. */
export function calculateShipping(subtotal: number): number {
  return subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
}
