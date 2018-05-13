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
  })
});

describe('One param cells', () => {

});

describe('Two param cells', () => {

});
