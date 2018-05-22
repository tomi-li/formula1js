import { expect } from 'chai';
import { VLOOKUP } from "./lookups";

describe('VLOOKUP', () => {
  describe('VLOOKUP exact against number array', () => {

    it('Must find the value in a sorted array', () => {
      const array = [[1,11,12,131], [10,11,12,132], [100,11,12,133]];

      expect(VLOOKUP(0, array, 4, 0)).to.be.an('error');
      expect(VLOOKUP(1, array, 4, 0)).to.be.equal(131);
      expect(VLOOKUP(10, array, 4, 0)).to.be.equal(132);
      expect(VLOOKUP(100, array, 4, 0)).to.be.equal(133);
    });
  });

  describe('VLOOKUP approx against number array', () => {

    it('Must find the value in a sorted array', () => {
      const array = [[1,11,12,131], [10,11,12,132], [100,11,12,133]];

      expect(VLOOKUP(0, array, 4, 1)).to.be.an('error');
      expect(VLOOKUP(1, array, 4, 1)).to.be.equal(131);
      expect(VLOOKUP(2, array, 4, 1)).to.be.equal(131);
      expect(VLOOKUP(10, array, 4, 1)).to.be.equal(132);
      expect(VLOOKUP(100, array, 4, 1)).to.be.equal(133);
      expect(VLOOKUP(101, array, 4, 1)).to.be.equal(133);
    });
  });


  describe('VLOOKUP N/A', () => {
    it('Must return NaN for NaN lookup value', () => {
      const array = [[1,11,12,131], [10,11,12,132], [100,11,12,133]];

      expect(VLOOKUP(Number.NaN, array, 2, 0)).to.be.an('error');
    });
  });
});
