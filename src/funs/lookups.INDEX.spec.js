import { expect } from 'chai';
import { INDEX } from "./lookups";

describe('INDEX', () => {
  describe('INDEX against 1D array', () => {
    it('Must find the index in a 1D array', () => {
      const array = [1,2,3];

      expect(INDEX(array, 0)).to.be.equal(1);
      expect(INDEX(array, 1)).to.be.equal(1);
      expect(INDEX(array, 2)).to.be.equal(2);
      expect(INDEX(array, 3)).to.be.equal(3);
    });

    it('Must find the index in a 1D array', () => {
      const array = [1,2,3];

      expect(INDEX(array, 0, 0)).to.be.equal(1);
      expect(INDEX(array, 1, 0)).to.be.equal(1);
      expect(INDEX(array, 2, 0)).to.be.equal(2);
      expect(INDEX(array, 3, 0)).to.be.equal(3);
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

  describe('INDEX #VALUE!', () => {
    it('Must return error for negative index value', () => {
      let err;

      err = INDEX([1,2,3,4], -1);
      expect(err).to.be.an('error');
      expect(err.message).to.be.equal('#VALUE!');

      err = INDEX([[1,2],[3,4]], -1);
      expect(err).to.be.an('error');
      expect(err.message).to.be.equal('#VALUE!');
    });
  });

  describe('INDEX #REF!', () => {
    it('Must return #REF for invalid index params', () => {
      const array = [[1,2,3], [10,11,12]];

      expect(INDEX(array, 1)).to.be.an('error');
      expect(INDEX(array, 2)).to.be.an('error');
    });
  });

  describe('INDEX is array shape sensitive', () => {
    it('Must return first element for 1ROW array when index = 0, col_index = 0', () => {
      expect(INDEX([1,2,3,4], 0, 0)).to.be.equal(1);
    });

    xit('Must return an error for 1COL array when index = 0, col_index = 0', () => {
      let err = INDEX([1,2,3,4], 0, 0);
      expect(err).to.be.an('error');
      expect(err.message).to.be.equal('#VALUE!');
    });
  })
});
