import { describe, it, expect } from 'vitest';
import { calculatePosition } from '@/lib/calculatePosition';

describe('calculatePosition', () => {
  it('should return 1.0 when both positions are null', () => {
    const result = calculatePosition(null, null);
    expect(result).toBe(1.0);
  });

  it('should return nextPosition - 1 when prevPosition is null', () => {
    const result = calculatePosition(null, 5.0);
    expect(result).toBe(4.0);
  });

  it('should return prevPosition + 1 when nextPosition is null', () => {
    const result = calculatePosition(3.0, null);
    expect(result).toBe(4.0);
  });

  it('should return the middle position between two positions', () => {
    const result = calculatePosition(1.0, 2.0);
    expect(result).toBe(1.5);
  });

  it('should handle non-integer positions correctly', () => {
    const result = calculatePosition(1.5, 2.5);
    expect(result).toBe(2.0);
  });

  it('should work with very close positions', () => {
    const result = calculatePosition(1.0, 1.5);
    expect(result).toBe(1.25);
  });

  it('should handle nested insertions correctly', () => {
    // Initial: [1.0, 2.0, 3.0]
    // Insert between 1 and 2
    const pos1 = calculatePosition(1.0, 2.0);
    expect(pos1).toBe(1.5);
    
    // Insert between 1 and 1.5
    const pos2 = calculatePosition(1.0, 1.5);
    expect(pos2).toBe(1.25);
    
    // Insert between 1 and 1.25
    const pos3 = calculatePosition(1.0, 1.25);
    expect(pos3).toBe(1.125);
  });

  it('should allow infinite insertions without reindexing', () => {
    let prev = 1.0;
    const next = 2.0;
    
    // Perform 100 insertions
    for (let i = 0; i < 100; i++) {
      const newPos = calculatePosition(prev, next);
      expect(newPos).toBeGreaterThan(prev);
      expect(newPos).toBeLessThan(next);
      prev = newPos;
    }
    
    // Should still have valid position
    expect(prev).toBeGreaterThan(1.0);
    expect(prev).toBeLessThan(2.0);
  });

  it('should maintain ordering after multiple operations', () => {
    const positions = [1.0, 2.0, 3.0];
    
    // Insert between index 0 and 1
    const new1 = calculatePosition(positions[0], positions[1]);
    positions.splice(1, 0, new1);
    
    // Insert between index 1 and 2
    const new2 = calculatePosition(positions[1], positions[2]);
    positions.splice(2, 0, new2);
    
    // Verify all positions are in ascending order
    for (let i = 1; i < positions.length; i++) {
      expect(positions[i]).toBeGreaterThan(positions[i - 1]);
    }
  });
});
