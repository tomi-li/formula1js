import { expect } from 'chai';
import moment from 'moment';

describe('Zero param cells', () => {
  const compiled = require('./output/compiled.js');
  beforeEach(() => {
    // TODO compiled.reset()
  })

  it('Must evaluate NOW()', () => {
    let actual = compiled.execute('Sheet1!B2');
    expect(moment(actual).isValid()).to.be.true;
    expect(moment(actual).diff(moment())).to.be.below(1000);
  });
});

describe('One param cells', () => {
  const compiled = require('./output/compiled.js');
  beforeEach(() => {
    // TODO compiled.reset()
  })

  it('Must evaluate SUM(1)', () => {
    let actual = compiled.execute('Sheet1!B5');
    expect(actual).to.be.equal(1);
  });
});

describe('Two param cells', () => {
  const compiled = require('./output/compiled.js');

  it('Must evaluate SUM(1,2)', () => {
    let actual = compiled.execute('Sheet1!B6');
    expect(actual).to.be.equal(3);
  });
});
