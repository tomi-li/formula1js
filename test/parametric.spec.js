import { expect } from 'chai';
import moment from 'moment';

describe('One param cells', () => {
  const parametric = require('./output/parametric.js');
  beforeEach(() => {
    // TODO parametric.reset()
  })

  it('Must throw for "Sheet1!Z1"', () => {
    expect(() => paramless.execute('Sheet1!Z1')).to.throw();
  });

  it('Must be stateless for every execution', () => {
    let actual;

    actual = parametric.execute('Sheet2!B13');
    expect(actual).to.be.equal(0);

    actual = parametric.execute('Sheet2!B13', { 'Sheet2!B2': 10 });
    expect(actual).to.be.equal(10);

    actual = parametric.execute('Sheet2!B13');
    expect(actual).to.be.equal(0);
  });

  it('Must evaluate Sheet2!B13 = SUM(B2)', () => {
    let actual;

    actual = parametric.execute('Sheet2!B13', { 'Sheet2!B2': 10 });
    expect(actual).to.be.equal(10);

    actual = parametric.execute('Sheet2!B13', { 'Sheet2!B2': 20 });
    expect(actual).to.be.equal(20);
  });
});

describe('Multiple param cells', () => {
  const parametric = require('./output/parametric.js');

  it('Must evaluate Sheet2!B14 = SUM(B2,B3)', () => {
    let actual;

    actual = parametric.execute('Sheet2!B14', { 'Sheet2!B2': 10, 'Sheet2!B3': 20 });
    expect(actual).to.be.equal(30);

    actual = parametric.execute('Sheet2!B14', { 'Sheet2!B2': 11, 'Sheet2!B3': 22 });
    expect(actual).to.be.equal(33);


  });
});
