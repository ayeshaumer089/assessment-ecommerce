import {
  calculateShipping,
  FREE_SHIPPING_THRESHOLD,
  SHIPPING_COST,
} from './shipping';

describe('calculateShipping', () => {
  it('charges the flat rate below the free-shipping threshold', () => {
    expect(calculateShipping(FREE_SHIPPING_THRESHOLD - 0.01)).toBe(SHIPPING_COST);
    expect(calculateShipping(0)).toBe(SHIPPING_COST);
  });

  it('is free exactly at the threshold', () => {
    expect(calculateShipping(FREE_SHIPPING_THRESHOLD)).toBe(0);
  });

  it('is free above the threshold', () => {
    expect(calculateShipping(FREE_SHIPPING_THRESHOLD + 100)).toBe(0);
  });
});
