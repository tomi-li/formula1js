import { expect } from 'chai';
import { default as compiler, cellToPublicSection, CodeGen } from './compiler';
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

    const actual = cellToPublicSection(codeGen, cell);
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

    it('must have jsCode()', () => {
      expect(codeGen.jsCode).to.be.a('function');
      expect(codeGen.jsCode.length).to.be.equal(0);
    });

    it('must have setCurrentSheet(sheetName)', () => {
      expect(codeGen.setCurrentSheet).to.be.a('function');
      expect(codeGen.setCurrentSheet.length).to.be.equal(1);
    });
  });

  describe('enterFunction(node)', () => {
    let codeGen;
    beforeEach(() => {
      codeGen = new CodeGen();
      codeGen.setCurrentSheet('Sheet1');
    });

    it('generate function with zero params', () => {
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

    it('generate function with one static param', () => {
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

    it('generate function with one cell param', () => {

    });

    it('generate function with one cell-range param', () => {

    });

    it('generate function with two params', () => {

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
