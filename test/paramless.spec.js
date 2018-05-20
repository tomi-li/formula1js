import { expect } from 'chai';
import moment from 'moment';

describe('Zero param cells', () => {
  const paramless = require('./output/paramless.js');
  beforeEach(() => {
    // TODO paramless.reset()
  })

  it('Must throw for "Sheet1!Z1"', () => {
    expect(() => paramless.execute('Sheet1!Z1')).to.throw();
  });

  it('Must evaluate Sheet1!B2 = NOW()', () => {
    let actual = paramless.execute('Sheet1!B2');
    expect(moment(actual).isValid()).to.be.true;
    expect(moment(actual).diff(moment())).to.be.below(1000);
  });
});

describe('One param cells', () => {
  const paramless = require('./output/paramless.js');
  beforeEach(() => {
    // TODO paramless.reset()
  })

  it('Must throw for "Sheet1!Z1"', () => {
    expect(() => paramless.execute('Sheet1!Z1')).to.throw();
  });

  it('Must evaluate Sheet1!B5 = SUM(1)', () => {
    let actual = paramless.execute('Sheet1!B5');
    expect(actual).to.be.equal(1);
  });

  it('Must evaluate Sheet1!B7 = SUM(B4)', () => {
    let actual = paramless.execute('Sheet1!B7');
    expect(actual).to.be.equal(1);
  });

  it('Must evaluate Sheet1!B9 = SUM(B4:D4)', () => {
    let actual = paramless.execute('Sheet1!B9');
    expect(actual).to.be.equal(6);
  });

  it('Must evaluate Sheet1!G5 = SUM(B5)', () => {
    let actual = paramless.execute('Sheet1!G5');
    expect(actual).to.be.equal(1);
  });

  it('Must evaluate Sheet1!B14 = SUM(SUM(1))', () =>  {
    let actual = paramless.execute('Sheet1!B14');
    expect(actual).to.be.equal(1);
  });

  it('Must evaluate Sheet1!B16 = SUM(SUM(B13))', () =>  {
    let actual = paramless.execute('Sheet1!B16');
    expect(actual).to.be.equal(1);
  });
});

describe('Two param cells', () => {
  const paramless = require('./output/paramless.js');

  it('Must evaluate SUM(1,2)', () => {
    let actual = paramless.execute('Sheet1!B6');
    expect(actual).to.be.equal(3);
  });

  it('Must evaluate Sheet1!G6 = SUM(B5,B6)', () => {
    let actual = paramless.execute('Sheet1!G6');
    expect(actual).to.be.equal(4);
  });

  it('Must evaluate Sheet1!G9 = SUM(B5:B8)', () => {
    let actual = paramless.execute('Sheet1!G9');
    expect(actual).to.be.equal(11);
  });

  it('Must evaluate Sheet1!B15 = SUM(SUM(1), SUM(2))', () =>  {
    let actual = paramless.execute('Sheet1!B15');
    expect(actual).to.be.equal(3);
  });

  it('Must evaluate Sheet1!B17 = SUM(SUM(B13), SUM(B14,B15))', () =>  {
    let actual = paramless.execute('Sheet1!B17');
    expect(actual).to.be.equal(6);
  });

  it('Must evaluate Sheet1!B18 = SUM(SUM(1), B5)', () =>  {
    let actual = paramless.execute('Sheet1!B18');
    expect(actual).to.be.equal(2);
  });

  it('Must evaluate Sheet1!G10 = SUM(B8,B9:B10)', () => {
    let actual = paramless.execute('Sheet1!G10');
    expect(actual).to.be.equal(18);
  });
});

describe('Three param cells', () => {
  const paramless = require('./output/paramless.js');

  it('Must evaluate Sheet1!B25 = MATCH($B$24,$B$21:$B$23,0)', () => {
    let actual = paramless.execute('Sheet1!B25');
    expect(actual).to.be.equal(1);
  });

  it('Must evaluate Sheet1!B26 = MATCH($B$24,$B$21:$B$23,1)', () => {
    let actual = paramless.execute('Sheet1!B26');
    expect(actual).to.be.equal(1);
  });

  it('Must evaluate Sheet1!B27 = MATCH($B$24,$B$21:$B$23,-1)', () => {
    let actual = paramless.execute('Sheet1!B27');
    expect(actual).to.be.equal(1);
  });
});

describe('Multiple param cells', () => {
  const paramless = require('./output/paramless.js');

  it('Must evaluate Sheet1!G8 = SUM(B5,B6,B7,B8)', () => {
    let actual = paramless.execute('Sheet1!G8');
    expect(actual).to.be.equal(11);
  });
});
