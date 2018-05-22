import { expect } from 'chai';
import { default as compiler, cellToFunModel, CodeGen } from './compiler';

import { tokenize } from 'excel-formula-tokenizer';
import { buildTree, visit } from 'excel-formula-ast';

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
      Workbook: { Names: [] },
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
    let codeGen;
    beforeEach(() => {
      const mockWorkbook = {};
      codeGen = new CodeGen(mockWorkbook);
    });

    it('must have a constructor', () => {
      expect(CodeGen).to.be.a('function');
      expect(CodeGen.length).to.be.equal(2);

      expect(() => new CodeGen()).to.throw();
    });

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

  describe('makeRange', function () {
    let codeGen;

    beforeEach(() => {
      codeGen = new CodeGen({
        Workbook: { Names: [] },
        Sheets: {
          Sheet1: {
            A1: { value: 1 },
            A2: { value: 2 },
            B1: { value: 3 },
            B2: { value: 4 }
          }
        }
      });
    });

    it('Must throw when lacking sheet name', () => {
      expect(() => codeGen.makeRange('A1:B2')).to.throw();
    });

    it('Must throw when input is not a range', () => {
      expect(() => codeGen.makeRange('Sheet1!A1')).to.throw();
    });

    it('Must resolve range Sheet1!A1:B2 to an array of addresses', () => {
      expect(codeGen.makeRange('Sheet1!A1:B2')).to.deep.equal({
        name: 'funSheet1$A1B2',
        address: 'Sheet1!A1:B2',
        definition: '/**\n' +
        ' * Evaluate data into a 1D or 2D array\n' +
        ' *\n' +
        ' */\n' +
        'function funSheet1$A1B2 () {\n' +
        '  var data = [];\n' +
        '  var colCount = 2;\n' +
        '  var rowCount = 2;\n' +
        '\n' +
        '  if (colCount === 1 || rowCount === 1) {\n' +
        '    return data;\n' +
        '  }\n' +
        '\n' +
        '  let slice = new Array(rowCount);\n' +
        '\n' +
        '  for (let i = 0; i < rowCount; i++) {\n' +
        '    slice[i] = new Array(colCount);\n' +
        '\n' +
        '    for (let j = 0; j < colCount; j++) {\n' +
        '      slice[i][j] = data[i * colCount + j];\n' +
        '    }\n' +
        '  }\n' +
        '\n' +
        '  return slice;\n' +
        '}\n'
      });
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

  describe('Parameterless CodeGen transformation', () => {
    let codeGen;
    beforeEach(() => {
      const mockWorkbook = {};
      codeGen = new CodeGen(mockWorkbook);
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
        Workbook: { Names: [] },
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

    it('generates function with one cell-range param, all of which are static values', () => {
      const mockWorkBook = {
        Workbook: { Names: [] },
        Sheets: {
          'Sheet1': {
            'B4': {
              v: 1,
              format: 'general',
              dataType: 'number'
            },
            'C4': {
              v: 2,
              format: 'general',
              dataType: 'number'
            },
            'D4': {
              v: 3,
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
            type: 'cell-range',
            left: {
              type: 'cell',
              key: 'B4',
              refType: 'relative'
            },
            right: {
              type: 'cell',
              key: 'D4',
              refType: 'relative'
            }
          }]
      };
      codeGen.enterFunction(node);
      codeGen.enterCellRange(node.arguments[0]);
      codeGen.exitCellRange(node.arguments[0]);
      codeGen.exitFunction(node);

      const actual = codeGen.jsCode();
      expect(actual).to.equal('EXCEL.SUM($$("Sheet1!B4:D4"))');
      // NOTE: dynamic section definition below is a snapshot
      expect(codeGen.dynamicSections).to.deep.equal([
        {
          name: 'funSheet1$B4D4',
          address: 'Sheet1!B4:D4',
          definition: '/**\n' +
          ' * Evaluate data into a 1D or 2D array\n' +
          ' *\n' +
          ' */\n' +
          'function funSheet1$B4D4 () {\n' +
          '  var data = [1, 2, 3];\n' +
          '  var colCount = 3;\n' +
          '  var rowCount = 1;\n' +
          '\n' +
          '  if (colCount === 1 || rowCount === 1) {\n' +
          '    return data;\n' +
          '  }\n' +
          '\n' +
          '  let slice = new Array(rowCount);\n' +
          '\n' +
          '  for (let i = 0; i < rowCount; i++) {\n' +
          '    slice[i] = new Array(colCount);\n' +
          '\n' +
          '    for (let j = 0; j < colCount; j++) {\n' +
          '      slice[i][j] = data[i * colCount + j];\n' +
          '    }\n' +
          '  }\n' +
          '\n' +
          '  return slice;\n' +
          '}\n'
        }
      ]);
    });

    it('generates function with one cell param, which contains a formula', () => {
      /* TODO Optimize by immediately resolve constant params at compile time (ie, SUM(1,2,3) => 6)
         vs SUM(1, 2, A1) which cannot be reduced
         However, optimization should occur from bottom to top as A1 could be resolve to a constant (e.g. 3)
       */
      const mockWorkBook = {
        Workbook: { Names: [] },
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

    it('generates function with one function param', () => {
      const node = {
        type: 'function',
        name: 'SUM',
        arguments: [
          {
            type: 'function',
            name: 'SUM',
            arguments: [{
              type: 'number',
              value: 1
            }]
          }]
      };
      codeGen.enterFunction(node);
      codeGen.enterFunction(node.arguments[0]);
      codeGen.enterNumber(node.arguments[0].arguments[0]);
      codeGen.exitNumber(node.arguments[0].arguments[0]);
      codeGen.exitFunction(node.arguments[0]);
      codeGen.exitFunction(node);

      const actual = codeGen.jsCode();
      expect(actual).to.equal('EXCEL.SUM(EXCEL.SUM(1))');
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
        Workbook: { Names: [] },
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

    it('generates function with two cell params, which contain a formula', () => {
      /* TODO Optimize by immediately resolve constant params at compile time (ie, SUM(1,2,3) => 6)
         vs SUM(1, 2, A1) which cannot be reduced
         However, optimization should occur from bottom to top as A1 could be resolve to a constant (e.g. 3)
       */
      const mockWorkBook = {
        Workbook: { Names: [] },
        Sheets: {
          'Sheet1': {
            'B4': {
              f: 'SUM(1)',
              format: 'general',
              dataType: 'number'
            },
            'B5': {
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
      expect(actual).to.equal('EXCEL.SUM($$("Sheet1!B4"), $$("Sheet1!B5"))');
    });

    it('generates function with two function params', () => {
      const node = {
        type: 'function',
        name: 'SUM',
        arguments: [
          {
            type: 'function',
            name: 'NOW',
            arguments: []
          },
          {
            type: 'function',
            name: 'SUM',
            arguments: [{
              type: 'number',
              value: 2
            }]
          }]
      };
      codeGen.enterFunction(node);
      codeGen.enterFunction(node.arguments[0]);
      codeGen.exitFunction(node.arguments[0]);
      codeGen.enterFunction(node.arguments[1]);
      codeGen.enterNumber(node.arguments[1].arguments[0]);
      codeGen.exitNumber(node.arguments[1].arguments[0]);
      codeGen.exitFunction(node.arguments[1]);
      codeGen.exitFunction(node);

      const actual = codeGen.jsCode();
      expect(actual).to.equal('EXCEL.SUM(EXCEL.NOW(), EXCEL.SUM(2))');
    });

    it('generates function with two mixed params: SUM(SUM(1), B4)', () => {
      const mockWorkBook = {
        Workbook: { Names: [] },
        Sheets: {
          'Sheet1': {
            'B4': {
              f: 'SUM(1)',
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
            type: 'function',
            name: 'SUM',
            arguments: [{
              type: 'number',
              value: 1
            }]
          },
          {
            type: 'cell',
            key: 'B4',
            refType: 'relative'
          }]
      };
      codeGen.enterFunction(node);
      codeGen.enterFunction(node.arguments[0]);
      codeGen.enterNumber(node.arguments[0].arguments[0]);
      codeGen.exitNumber(node.arguments[0].arguments[0]);
      codeGen.exitFunction(node.arguments[0]);
      codeGen.enterCell(node.arguments[1]);
      codeGen.exitCell(node.arguments[1]);
      codeGen.exitFunction(node);

      const actual = codeGen.jsCode();
      expect(actual).to.equal('EXCEL.SUM(EXCEL.SUM(1), $$("Sheet1!B4"))');
    });
  });

  describe('Parameterized CodeGen transformation', () => {
    let codeGen;
    beforeEach(() => {
      const mockWorkbook = {
        Workbook: { Names: [] },
        Sheets: {
          Sheet1: {
            B2: {
              v: 10,
              format: 'general',
              dataType: 'number'
            },
            B3: {
              v: 20,
              format: 'general',
              dataType: 'number'
            },
            B4: {
              v: 30,
              format: 'general',
              dataType: 'number'
            }
          },
          Sheet2: {
            B2: {
              v: 1,
              format: 'general',
              dataType: 'number'
            },
            B3: {
              v: 2,
              format: 'general',
              dataType: 'number'
            },
            B4: {
              v: 3,
              format: 'general',
              dataType: 'number'
            }
          }
        }
      };
      codeGen = new CodeGen(mockWorkbook, ['Sheet2!B2', 'Sheet2!B3']);
      codeGen.setCurrentSheet('Sheet2');
    });

    it('generates function with one cell param', () => {
      const node = {
        type: 'function',
        name: 'SUM',
        arguments: [{
          type: 'cell',
          key: 'B2',
          refType: 'relative'
        }]
      };
      codeGen.enterFunction(node);
      codeGen.enterCell(node.arguments[0]);
      codeGen.exitCell(node.arguments[0]);
      codeGen.exitFunction(node);

      const actual = codeGen.jsCode();
      expect(actual).to.equal('EXCEL.SUM($["Sheet2!B2"])');
    });

    it('generates function with one cell-range param', () => {
      const node = {
        type: 'function',
        name: 'SUM',
        arguments: [
          {
            type: 'cell-range',
            left: {
              type: 'cell',
              key: 'B2',
              refType: 'relative'
            },
            right: {
              type: 'cell',
              key: 'B4',
              refType: 'relative'
            }
          }
        ]
      };
      codeGen.enterFunction(node);
      codeGen.enterCellRange(node.arguments[0]);
      codeGen.exitCellRange(node.arguments[0]);
      codeGen.exitFunction(node);

      const actual = codeGen.jsCode();
      expect(actual).to.equal('EXCEL.SUM($$("Sheet2!B2:B4"))');
      expect(codeGen.dynamicSections).to.deep.equal([
        {
          name: 'funSheet2$B2B4',
          address: 'Sheet2!B2:B4',
          definition: '/**\n' +
          ' * Evaluate data into a 1D or 2D array\n' +
          ' *\n' +
          ' */\n' +
          'function funSheet2$B2B4 () {\n' +
          '  var data = [1, 2, 3];\n' +
          '  var colCount = 1;\n' +
          '  var rowCount = 3;\n' +
          '\n' +
          '  if (colCount === 1 || rowCount === 1) {\n' +
          '    return data;\n' +
          '  }\n' +
          '\n' +
          '  let slice = new Array(rowCount);\n' +
          '\n' +
          '  for (let i = 0; i < rowCount; i++) {\n' +
          '    slice[i] = new Array(colCount);\n' +
          '\n' +
          '    for (let j = 0; j < colCount; j++) {\n' +
          '      slice[i][j] = data[i * colCount + j];\n' +
          '    }\n' +
          '  }\n' +
          '\n' +
          '  return slice;\n' +
          '}\n'
        }
      ]);
    });

    it('generates function with one cell-range param, which resides from another sheet', () => {
      const node = {
        type: 'function',
        name: 'SUM',
        arguments: [
          {
            type: 'cell-range',
            left: {
              type: 'cell',
              key: 'Sheet1!B2',
              refType: 'relative'
            },
            right: {
              type: 'cell',
              key: 'B4',
              refType: 'relative'
            }
          }
        ]
      };
      codeGen.enterFunction(node);
      codeGen.enterCellRange(node.arguments[0]);
      codeGen.exitCellRange(node.arguments[0]);
      codeGen.exitFunction(node);

      const actual = codeGen.jsCode();
      expect(actual).to.equal('EXCEL.SUM($$("Sheet1!B2:B4"))');
      expect(codeGen.dynamicSections).to.deep.equal([
        {
          name: 'funSheet1$B2B4',
          address: 'Sheet1!B2:B4',
          definition: '/**\n' +
          ' * Evaluate data into a 1D or 2D array\n' +
          ' *\n' +
          ' */\n' +
          'function funSheet1$B2B4 () {\n' +
          '  var data = [10, 20, 30];\n' +
          '  var colCount = 1;\n' +
          '  var rowCount = 3;\n' +
          '\n' +
          '  if (colCount === 1 || rowCount === 1) {\n' +
          '    return data;\n' +
          '  }\n' +
          '\n' +
          '  let slice = new Array(rowCount);\n' +
          '\n' +
          '  for (let i = 0; i < rowCount; i++) {\n' +
          '    slice[i] = new Array(colCount);\n' +
          '\n' +
          '    for (let j = 0; j < colCount; j++) {\n' +
          '      slice[i][j] = data[i * colCount + j];\n' +
          '    }\n' +
          '  }\n' +
          '\n' +
          '  return slice;\n' +
          '}\n'
        }
      ]);
    });
  });

  describe('enterNumber(node)', () => {
    let codeGen;
    beforeEach(() => {
      codeGen = new CodeGen();
      codeGen.setCurrentSheet('Sheet1');
    });
  });

  describe('Binary operator code generation', () => {
    let codeGen;
    beforeEach(() => {
      codeGen = new CodeGen({
        Workbook: { Names: [] }
      });
      codeGen.setCurrentSheet('Sheet1');
    });

    it('generates correct equivalence for polynomial for 1 + 2 - 3', () => {
      visit(buildTree(tokenize('1 + 2 - 3')), codeGen);

      const actual = codeGen.jsCode();
      expect(actual).to.equal('MINUS(ADD(1, 2), 3)');
    });

    it('generates correct equivalence for polynomial for 1 * 2 + 3', () => {
      visit(buildTree(tokenize('1 * 2 + 3')), codeGen);

      const actual = codeGen.jsCode();
      expect(actual).to.equal('ADD(MULTIPLY(1, 2), 3)');
    });

    it('generates correct equivalence for polynomial for 1 * (2 + 3)', () => {
      visit(buildTree(tokenize('1 * (2 + 3)')), codeGen);

      const actual = codeGen.jsCode();
      expect(actual).to.equal('MULTIPLY(1, ADD(2, 3))');
    });

    it('generates correct equivalence for polynomial for 1 + 2 * 3', () => {
      visit(buildTree(tokenize('1 + 2 * 3')), codeGen);

      const actual = codeGen.jsCode();
      expect(actual).to.equal('ADD(1, MULTIPLY(2, 3))');
    });
  });
});
