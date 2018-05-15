import { expect } from 'chai';
import { default as compiler, cellToFunModel, CodeGen } from './compiler';
import {Node} from "excel-formula-ast/index";

describe('compiler', () => {
  it('enforces config.outputs', () => {
    const config = {
      outputs: []
    };

    expect(() => compiler(config, null)).to.throw();
  });

  it('enforces Excel file to be non-null', () => {
    const config = {
      outputs: ['Sheet1!A1']
    };

    expect(() => compiler(config, null)).to.throw();
  });
});

describe('formulaToCode', () => {

  it('compiles formula to dynamic', () => {
    const mockWorkBook = {
      Sheets: {
        'Sheet1': {
          'A1': {
            f: 'NOW()',
            format: 'general',
            dataType: 'String'
          }
        }
      }
    };
    let codeGen = new CodeGen(mockWorkBook);
    codeGen.setCurrentSheet('Sheet1');
    const cell = {
      address: 'Sheet1!A1',
      formula: 'NOW()'
    };

    const actual = cellToFunModel(codeGen, cell);
    expect(actual).to.deep.equal({
      name: 'funSheet1$A1',
      address: 'Sheet1!A1',
      definition: 'function funSheet1$A1() { return EXCEL.NOW(); }'
    });
  });
});

describe('CodeGen', () => {
  describe('Public interface', () => {
    let codeGen = new CodeGen();

    it('must have enterFunction(node)', () => {
      expect(codeGen.enterFunction).to.be.a('function');
      expect(codeGen.enterFunction.length).to.be.equal(1);
    });

    it('must have enterCell(node)', () => {
      expect(codeGen.enterCell).to.be.a('function');
      expect(codeGen.enterCell.length).to.be.equal(1);
    });

    it('must have enterCellRange(node)', () => {
      expect(codeGen.enterCellRange).to.be.a('function');
      expect(codeGen.enterCellRange.length).to.be.equal(1);
    });

    it('must have enterText(node)', () => {
      expect(codeGen.enterText).to.be.a('function');
      expect(codeGen.enterText.length).to.be.equal(1);
    });

    it('must have enterLogical(node)', () => {
      expect(codeGen.enterLogical).to.be.a('function');
      expect(codeGen.enterLogical.length).to.be.equal(1);
    });

    it('must have enterBinaryExpression(node)', () => {
      expect(codeGen.enterBinaryExpression).to.be.a('function');
      expect(codeGen.enterBinaryExpression.length).to.be.equal(1);
    });

    it('must have enterUnaryExpression(node)', () => {
      expect(codeGen.enterUnaryExpression).to.be.a('function');
      expect(codeGen.enterUnaryExpression.length).to.be.equal(1);
    });

    it('must have enterNumber(node)', () => {
      expect(codeGen.enterNumber).to.be.a('function');
      expect(codeGen.enterNumber.length).to.be.equal(1);
    });

    it('must have enterScope()', () => {
      expect(codeGen.enterScope).to.be.a('function');
      expect(codeGen.enterScope.length).to.be.equal(0);
    });

    it('must have exitScope()', () => {
      expect(codeGen.exitScope).to.be.a('function');
      expect(codeGen.exitScope.length).to.be.equal(0);
    });

    it('must have jsCode()', () => {
      expect(codeGen.jsCode).to.be.a('function');
      expect(codeGen.jsCode.length).to.be.equal(0);
    });

    it('must have setCurrentSheet(sheetName)', () => {
      expect(codeGen.setCurrentSheet).to.be.a('function');
      expect(codeGen.setCurrentSheet.length).to.be.equal(1);
    });
  });

  describe('assertSheetNameFromAddress(address)', () => {
    it('throws error when address does not have sheet name', () => {
      expect(() => CodeGen.assertSheetNameFromAddress('A1')).to.throw();
    });

    it('returns the sheet name from address', () => {
      expect(CodeGen.assertSheetNameFromAddress('Sheet1!A1')).to.be.equal('Sheet1');
    });
  });

  describe('Function node transformation', () => {
    let codeGen;
    beforeEach(() => {
      codeGen = new CodeGen();
      codeGen.setCurrentSheet('Sheet1');
    });

    it('generates function with zero params', () => {
      const node = {
        type: 'function',
        name: 'NOW',
        arguments: []
      };
      codeGen.enterFunction(node);
      codeGen.exitFunction(node);

      const actual = codeGen.jsCode();
      expect(actual).to.equal('EXCEL.NOW()');
    });

    it('generates function with one static param', () => {
      const node = {
        type: 'function',
        name: 'SUM',
        arguments: [
          {
            type: 'number',
            value: 1
          }]
      };
      codeGen.enterFunction(node);
      codeGen.enterNumber(node.arguments[0]);
      codeGen.exitNumber(node.arguments[0]);
      codeGen.exitFunction(node);

      const actual = codeGen.jsCode();
      expect(actual).to.equal('EXCEL.SUM(1)');
    });

    it('generates function with one cell param, which is a constant', () => {
      const mockWorkBook = {
        Sheets: {
          'Sheet1': {
            'B4': {
              v: 1,
              format: 'general',
              dataType: 'String'
            }
          }
        }
      };
      codeGen = new CodeGen(mockWorkBook);
      codeGen.setCurrentSheet('Sheet1');

      const node = {
        type: 'function',
        name: 'SUM',
        arguments: [
          {
            type: 'cell',
            key: 'B4',
            refType: 'relative'
          }]
      };
      codeGen.enterFunction(node);
      codeGen.enterCell(node.arguments[0]);
      codeGen.exitCell(node.arguments[0]);
      codeGen.exitFunction(node);

      const actual = codeGen.jsCode();
      expect(actual).to.equal('EXCEL.SUM(1)');
    });

    it('generates function with one cell param, which is contains a formula', () => {
      /* TODO Optimize by immediately resolve constant params at compile time (ie, SUM(1,2,3) => 6)
         vs SUM(1, 2, A1) which cannot be reduced
         However, optimization should occur from bottom to top as A1 could be resolve to a constant (e.g. 3)
       */
      const mockWorkBook = {
        Sheets: {
          'Sheet1': {
            'B4': {
              f: 'SUM(1,2,3)',
              format: 'general',
              dataType: 'number'
            }
          }
        }
      };
      codeGen = new CodeGen(mockWorkBook);
      codeGen.setCurrentSheet('Sheet1');

      const node = {
        type: 'function',
        name: 'SUM',
        arguments: [
          {
            type: 'cell',
            key: 'B4',
            refType: 'relative'
          }]
      };
      codeGen.enterFunction(node);
      codeGen.enterCell(node.arguments[0]);
      codeGen.exitCell(node.arguments[0]);
      codeGen.exitFunction(node);

      const actual = codeGen.jsCode();
      expect(actual).to.equal('EXCEL.SUM($$("Sheet1!B4"))');
    });

    it('generates function with one cell-range param', () => {

    });

    it('generates function with two static params', () => {
      const node = {
        type: 'function',
        name: 'SUM',
        arguments: [
          {
            type: 'number',
            value: 1
          },
          {
            type: 'number',
            value: 2
          }]
      };
      codeGen.enterFunction(node);
      codeGen.enterNumber(node.arguments[0]);
      codeGen.exitNumber(node.arguments[0]);
      codeGen.enterNumber(node.arguments[1]);
      codeGen.exitNumber(node.arguments[1]);
      codeGen.exitFunction(node);

      const actual = codeGen.jsCode();
      expect(actual).to.equal('EXCEL.SUM(1, 2)');
    });

    it('generates function with two cell reference params, which are constants themselves', () => {
      const mockWorkBook = {
        Sheets: {
          'Sheet1': {
            'B4': {
              v: 1,
              format: 'general',
              dataType: 'String'
            },
            'B5': {
              v: 2,
              format: 'general',
              dataType: 'String'
            }
          }
        }
      };
      codeGen = new CodeGen(mockWorkBook);
      codeGen.setCurrentSheet('Sheet1');

      const node = {
        type: 'function',
        name: 'SUM',
        arguments: [
          {
            type: 'cell',
            key: 'B4',
            refType: 'relative'
          },
          {
            type: 'cell',
            key: 'B5',
            refType: 'relative'
          }]
      };
      codeGen.enterFunction(node);
      codeGen.enterCell(node.arguments[0]);
      codeGen.exitCell(node.arguments[0]);
      codeGen.enterCell(node.arguments[1]);
      codeGen.exitCell(node.arguments[1]);
      codeGen.exitFunction(node);

      const actual = codeGen.jsCode();
      expect(actual).to.equal('EXCEL.SUM(1, 2)');
    });
  });

  describe('enterNumber(node)', () => {
    let codeGen;
    beforeEach(() => {
      codeGen = new CodeGen();
      codeGen.setCurrentSheet('Sheet1');
    });
  });
});
