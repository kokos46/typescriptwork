import { describe, it, expect } from 'vitest';
import { sum, average } from './Equations';

describe('Equations', () => {
  describe('sum', () => {
    it('returns 0 for empty array', () => {
      expect(sum([])).toBe(0);
    });

    it('sums numbers', () => {
      expect(sum([1, 2, 3])).toBe(6);
    });
  });

  describe('average', () => {
    it('returns average of numbers', () => {
      expect(average([2, 4, 6])).toBe(4);
    });

    it('returns NaN for empty array', () => {
      expect(average([])).toBeNaN();
    });
  });
});
