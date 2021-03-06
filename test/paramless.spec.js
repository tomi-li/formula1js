import { expect } from 'chai';
import moment from 'moment';

describe('Zero param cells', () => {
  const paramless = require('./output/paramless.bundle');
  beforeEach(() => {
    // TODO paramless.reset()
  })

  it('Must be null for "Sheet1!Z1"', () => {
    expect(paramless.execute('Sheet1!Z1')).to.be.null;
  });

  it('Must evaluate Sheet1!B2 = NOW()', () => {
    let actual = paramless.execute('Sheet1!B2');
    expect(moment(actual).isValid()).to.be.true;
    expect(moment(actual).diff(moment())).to.be.below(1000);
  });
});

describe('One param cells', () => {
  const paramless = require('./output/paramless.bundle');
  beforeEach(() => {
    // TODO paramless.reset()
  })

  it('Must be null for "Sheet1!Z1"', () => {
    expect(paramless.execute('Sheet1!Z1')).to.be.null;
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

  it('Must evaluate Sheet1!AB9 = SUM(AB4:AD4)', () => {
    let actual = paramless.execute('Sheet1!AB9');
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
  const paramless = require('./output/paramless.bundle');

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

  it('Must evaluate Sheet1!G11 = SUM(Sheet2!B7:B10)', () => {
    let actual = paramless.execute('Sheet1!G11');
    expect(actual).to.be.equal(5555);
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
  const paramless = require('./output/paramless.bundle');

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

  it('Must evaluate Sheet1!B47 ', () => {
    let actual = paramless.execute('Sheet1!B47');
    expect(actual).to.be.an('error');
  });
  it('Must evaluate Sheet1!B48', () => {
    let actual = paramless.execute('Sheet1!B48');
    expect(actual).to.be.equal(1);
  });
  it('Must evaluate Sheet1!B49', () => {
    let actual = paramless.execute('Sheet1!B49');
    expect(actual).to.be.equal(1);
  });
  it('Must evaluate Sheet1!B50', () => {
    let actual = paramless.execute('Sheet1!B50');
    expect(actual).to.be.equal(2);
  });
  it('Must evaluate Sheet1!B51', () => {
    let actual = paramless.execute('Sheet1!B51');
    expect(actual).to.be.equal(1);
  });
  it('Must evaluate Sheet1!B52', () => {
    let actual = paramless.execute('Sheet1!B52');
    expect(actual).to.be.equal(1);
  });
  it('Must evaluate Sheet1!B53', () => {
    let actual = paramless.execute('Sheet1!B53');
    expect(actual).to.be.equal(1);
  });
  it('Must evaluate Sheet1!B54', () => {
    let actual = paramless.execute('Sheet1!B54');
    expect(actual).to.be.equal(2);
  });
  it('Must evaluate Sheet1!B55', () => {
    let actual = paramless.execute('Sheet1!B55');
    expect(actual).to.be.equal(1);
  });
  it('Must evaluate Sheet1!B56', () => {
    let actual = paramless.execute('Sheet1!B56');
    expect(actual).to.be.equal(10);
  });
  xit('Must evaluate Sheet1!B57', () => {
    // TODO Distinguish between 1D vs 2D array
    let actual = paramless.execute('Sheet1!B57');
    expect(actual).to.be.an('error');
  });
  it('Must evaluate Sheet1!B58', () => {
    let actual = paramless.execute('Sheet1!B58');
    expect(actual).to.be.an('error');
  });
  it('Must evaluate Sheet1!B59', () => {
    let actual = paramless.execute('Sheet1!B59');
    expect(actual).to.be.an('error');
  });
  it('Must evaluate Sheet1!B60', () => {
    let actual = paramless.execute('Sheet1!B60');
    expect(actual).to.be.an('error');
  });
});

describe('Four param cells', () => {
  const paramless = require('./output/paramless.bundle');

  it('Must evaluate Sheet1!B33 = VLOOKUP(0,$B$30:$D$32,3,FALSE())', () => {
    let actual = paramless.execute('Sheet1!B33');
    expect(actual).to.be.an('error');
    expect(actual.message).to.be.equal('#N/A');
  });

  it('Must evaluate Sheet1!B34 = VLOOKUP(1,$B$30:$D$32,3,FALSE())', () => {
    let actual = paramless.execute('Sheet1!B34');
    expect(actual).to.be.equal(3);
  });

  it('Must evaluate Sheet1!B35 = VLOOKUP(2,$B$30:$D$32,3,FALSE())', () => {
    let actual = paramless.execute('Sheet1!B35');
    expect(actual).to.be.an('error');
    expect(actual.message).to.be.equal('#N/A');
  });

  it('Must evaluate Sheet1!B36 = VLOOKUP(10,$B$30:$D$32,3,FALSE())', () => {
    let actual = paramless.execute('Sheet1!B36');
    expect(actual).to.be.equal(30);
  });

  it('Must evaluate Sheet1!B37 = VLOOKUP(10,$B$30:$D$32,3,FALSE())', () => {
    let actual = paramless.execute('Sheet1!B37');
    expect(actual).to.be.an('error');
    expect(actual.message).to.be.equal('#N/A');
  });

  it('Must evaluate Sheet1!B38 = VLOOKUP(10,$B$30:$D$32,3,FALSE())', () => {
    let actual = paramless.execute('Sheet1!B38');
    expect(actual).to.be.equal(3);
  });

  it('Must evaluate Sheet1!B39 = VLOOKUP(10,$B$30:$D$32,3,FALSE())', () => {
    let actual = paramless.execute('Sheet1!B39');
    expect(actual).to.be.equal(3);
  });

  it('Must evaluate Sheet1!B40 = VLOOKUP(10,$B$30:$D$32,3,FALSE())', () => {
    let actual = paramless.execute('Sheet1!B40');
    expect(actual).to.be.equal(30);
  });

  it('Must evaluate Sheet1!B41 = VLOOKUP(10,$B$30:$D$32,3,FALSE())', () => {
    let actual = paramless.execute('Sheet1!B41');
    expect(actual).to.be.equal(300);
  });

  it('Must evaluate BadSheet!B10 = VLOOKUP(0,$B$4:$C$6,2,0)', () => {
    let actual = paramless.execute('BadSheet!B10');
    expect(actual).to.be.an('error');
    expect(actual.message).to.be.equal('#N/A');
  });

  it('Must evaluate BadSheet!B11 = VLOOKUP(2,$B$4:$C$6,2,0)', () => {
    let actual = paramless.execute('BadSheet!B11');
    expect(actual).to.be.equal(11);
  });

  it('Must evaluate BadSheet!B12 = VLOOKUP(3,$B$4:$C$6,2,0)', () => {
    let actual = paramless.execute('BadSheet!B12');
    expect(actual).to.be.equal(0);
  });
});

describe('Multiple param cells', () => {
  const paramless = require('./output/paramless.bundle');

  it('Must evaluate Sheet1!G8 = SUM(B5,B6,B7,B8)', () => {
    let actual = paramless.execute('Sheet1!G8');
    expect(actual).to.be.equal(11);
  });
});

describe('Range extraction', function () {
  const paramless = require('./output/paramless.bundle');

  it('Must extract range B21:D23', () => {
    let actual = paramless.execute('Sheet1!B21:D23');
    expect(actual).to.be.deep.equal([
      [1, 2, 3],
      [10, 20, 30],
      [100, 200, 300]
    ]);
  });

  it('Must extract range B30:C31', () => {
    let actual = paramless.execute('Sheet1!B30:C31');
    expect(actual[0][0]).to.be.equal(1);
    expect(actual[0][1]).to.be.equal(2);
    expect(actual[1][0]).to.be.equal(10);
    expect(actual[1][1]).to.be.an('error');
    expect(actual[1][1].message).to.be.equal('#NUM!');
  });

  it('Must extract range BadSheet!B9', () => {
    let actual = paramless.execute('BadSheet!B9');
    expect(actual).to.be.equal(26);
  });
});
