import { expect } from 'chai';
import Range from './range';

describe('Range Public Interface', () => {
  it('Must have a constructor', () => {
    expect(new Range(1,1)).to.be.an.instanceof(Range);
  });

  it('Must have setValueAt(row, col, value)', () => {
    expect(Range.prototype.setValueAt).to.be.a('function');
    expect(Range.prototype.setValueAt.length).to.be.equal(3);
  });

  it('Must have serialize()', () => {
    expect(Range.prototype.serialize).to.be.a('function');
    expect(Range.prototype.serialize.length).to.be.equal(0);
  });
});

describe('Range Instance', () => {
  it('Must be properly instantiated', () => {
    expect(() => new Range()).to.throw();
    expect(() => new Range(1)).to.throw();
    expect(() => new Range(0, 1)).to.throw();
  });

  it('Must serialize itself', () => {
    let range;

    range = new Range(1, 1);
    range.setValueAt(0, 0, 1);
    expect(range.serialize()).to.equal(`[1]`);

    range = new Range(2, 2);
    range.setValueAt(0, 0, 1);
    range.setValueAt(1, 0, 2);
    range.setValueAt(0, 1, 3);
    range.setValueAt(1, 1, 4);
    expect(range.serialize()).to.equal(`[1, 2, 3, 4]`);

    range = new Range(1, 1);
    range.setValueAt(0,0, `$$("Sheet1!B5")`);
    expect(range.serialize()).to.equal(`[$$("Sheet1!B5")]`);

    range = new Range(2, 2);
    range.setValueAt(0, 0, 1);
    range.setValueAt(1, 0, `$$("Sheet1!B5")`);
    range.setValueAt(0, 1, 3);
    range.setValueAt(1, 1, `$$("Sheet1!B6")`);
    expect(range.serialize()).to.equal(`[1, $$("Sheet1!B5"), 3, $$("Sheet1!B6")]`);
  });
});
