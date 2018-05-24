import { expect } from 'chai';
import { decodeColumn, encodeColumn } from "./supports";

describe('decodeColumn', () => {
  it('must turn A into 0', () => {
    expect(decodeColumn('A')).to.be.equal(0)
  });

  it('must turn B into 1', () => {
    expect(decodeColumn('B')).to.be.equal(1)
  });

  it('must turn AA into 26', () => {
    expect(decodeColumn('AA')).to.be.equal(26)
  });

  it('must turn AZ into 51', () => {
    expect(decodeColumn('AZ')).to.be.equal(51)
  });

  it('must turn ZZ into 701', () => {
    expect(decodeColumn('ZZ')).to.be.equal(701)
  });
});

describe('encodeColumn', () => {
  it('must turn 0 into A', () => {
    expect(encodeColumn(0)).to.be.equal('A')
  });

  it('must turn 1 into B', () => {
    expect(encodeColumn(1)).to.be.equal('B')
  });

  it('must turn 26 into AA', () => {
    expect(encodeColumn(26)).to.be.equal('AA')
  });

  it('must turn 51 into AZ', () => {
    expect(encodeColumn(51)).to.be.equal('AZ')
  });

  it('must turn 701 into ZZ', () => {
    expect(encodeColumn(701)).to.be.equal('ZZ')
  });
});
