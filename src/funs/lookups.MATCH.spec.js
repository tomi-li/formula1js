import { expect } from 'chai';
import { MATCH } from "./lookups";

describe('MATCH', () => {
  describe('MATCH exact against number array', () => {

    it('Must find the index in a sorted array', () => {
      const array = [10,11,12,13];
      expect(MATCH(10, array, 0)).to.be.equal(1);
      expect(MATCH(11, array, 0)).to.be.equal(2);
      expect(MATCH(12, array, 0)).to.be.equal(3);
      expect(MATCH(13, array, 0)).to.be.equal(4);

      expect(MATCH(1, array, 0)).to.be.an('error');
      expect(MATCH(20, array, 0)).to.be.an('error');
    });

    it('Must find the index in an unsorted array', () => {
      const array = [10,13,11,12];
      expect(MATCH(10, array, 0)).to.be.equal(1);
      expect(MATCH(13, array, 0)).to.be.equal(2);
      expect(MATCH(11, array, 0)).to.be.equal(3);
      expect(MATCH(12, array, 0)).to.be.equal(4);

      expect(MATCH(1, array, 0)).to.be.an('error');
      expect(MATCH(20, array, 0)).to.be.an('error');
    });
  });

  describe('MATCH ascending', () => {
    it('Must find the index in a sorted array', () => {
      const array = [10,20,30,40];
      expect(MATCH(10, array, 1)).to.be.equal(1);
      expect(MATCH(11, array, 1)).to.be.equal(1);
      expect(MATCH(22, array, 1)).to.be.equal(2);
      expect(MATCH(33, array, 1)).to.be.equal(3);
      expect(MATCH(40, array, 1)).to.be.equal(4);
      expect(MATCH(41, array, 1)).to.be.equal(4);

      expect(MATCH(1, array, 1)).to.be.NaN;
    });

    xit('Must find the index in an ansorted array', () => {
      const array = [10,40,20,30];
      expect(MATCH(1, array, 1)).to.be.NaN;

      expect(MATCH(10, array, 1)).to.be.equal(1);
      expect(MATCH(11, array, 1)).to.be.equal(1);
      expect(MATCH(22, array, 1)).to.be.equal(1);
      expect(MATCH(33, array, 1)).to.be.equal(1);
      expect(MATCH(40, array, 1)).to.be.equal(2);
      expect(MATCH(41, array, 1)).to.be.equal(4);
    });
  });

  describe('MATCH descending (tho the lookup array is sorted ascending)', () => {
    it('Must find the index in a sorted array', () => {
      const array = [10,20,30,40];
      expect(MATCH(1, array, -1)).to.be.equal(1);
      expect(MATCH(10, array, -1)).to.be.equal(1);
      expect(MATCH(11, array, -1)).to.be.equal(2);
      expect(MATCH(22, array, -1)).to.be.equal(3);
      expect(MATCH(33, array, -1)).to.be.equal(4);
      expect(MATCH(40, array, -1)).to.be.equal(4);

      expect(MATCH(41, array, -1)).to.be.an('error');
    });

    xit('Must find the index in an ansorted array', () => {
      const array = [10,40,20,30];
      expect(MATCH(1, array, -1)).to.be.equal(4);
      expect(MATCH(10, array, -1)).to.be.equal(1);

      expect(MATCH(11, array, -1)).to.be.NaN;
      expect(MATCH(22, array, -1)).to.be.NaN;
      expect(MATCH(33, array, -1)).to.be.NaN;
      expect(MATCH(40, array, -1)).to.be.NaN;
      expect(MATCH(41, array, -1)).to.be.NaN;
    });
  });

  describe('MATCH N/A', () => {
    it('Must return NaN for NaN lookup value', () => {
      expect(MATCH(Number.NaN, [1,2,3,4], 0)).to.be.an('error');
    });
  });
});
