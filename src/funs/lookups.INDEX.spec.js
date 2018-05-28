import { expect } from 'chai';
import { INDEX } from "./lookups";

describe('INDEX', () => {
  describe('INDEX against 1D array', () => {
    const array = [1,2,3];

    it('Must find the index in a 1D array', () => {
      expect(INDEX(array, 1)).to.be.equal(1);
      expect(INDEX(array, 2)).to.be.equal(2);
      expect(INDEX(array, 3)).to.be.equal(3);
    });
  });

  describe('INDEX against 2D array', () => {
    const array = [[1,2,3], [10,11,12]];

    it('Must find the index in a 2D array', () => {
      expect(INDEX(array, 2, 1)).to.be.equal(10);
      expect(INDEX(array, 2, 2)).to.be.equal(11);
      expect(INDEX(array, 2, 3)).to.be.equal(12);
    });
  });

  describe('INDEX N/A', () => {
    it('Must return NaN for NaN lookup value', () => {
      expect(INDEX([1,2,3,4], 0, 0)).to.be.an('error');
    });
  });
});
