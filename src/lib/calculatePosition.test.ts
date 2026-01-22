import { describe, it, expect } from 'vitest';
import { calculatePosition } from './calculatePosition';

describe('calculatePosition', () => {
  it('returns 1.0 for empty list (prev=null, next=null)', () => {
    expect(calculatePosition(null, null)).toBe(1.0);
  });

  it('inserts at start (prev=null, next=1.0)', () => {
    expect(calculatePosition(null, 1.0)).toBe(0.0);
  });

  it('inserts at end (prev=3.0, next=null)', () => {
    expect(calculatePosition(3.0, null)).toBe(4.0);
  });

  it('inserts in middle (prev=1.0, next=2.0)', () => {
    expect(calculatePosition(1.0, 2.0)).toBe(1.5);
  });
});
