import fs from 'fs';
import path from 'path';
import _ from 'lodash';

import xlsx from 'xlsx';
import { tokenize } from 'excel-formula-tokenizer';
import { buildTree, visit } from 'excel-formula-ast';

import Range from './range';
import { getFunctionByOperator } from './binaryOperators';
import {decodeColumn, encodeColumn} from "./supports";

const mainTemplate = _.template(fs.readFileSync(path.resolve(__dirname + '/../templates/main.template.tpl'), 'utf8'));
const functionTemplate = _.template(fs.readFileSync(path.resolve(__dirname + '/../templates/function.template.tpl'), 'utf8'));
const rangeTemplate = _.template(fs.readFileSync(path.resolve(__dirname + '/../templates/range.template.tpl'), 'utf8'));

/**
 * Compile Excel file against a given configuration to string
 *
 * @param config
 * @param excelFile
 * @returns {string}
 */
export default function (config, excelFile) {
  const {input: inputs, output: outputs} = config;
  const outputAddresses = extractOutputs(outputs);
  if (!outputAddresses || !outputAddresses.length) {
    throw new Error('No outputs cell specified');
  }
  if (!excelFile) {
    throw new Error('No Excel file specified');
  }

  const workbook = xlsx.read(excelFile, { type: 'file', cellFormula: true });

  const codeGen = new CodeGen(workbook, _.values(inputs).map(it => it.cell?it.cell:it));
  const sections = _.map(outputAddresses, (address) => {
    if (isRangeAddress(address)) {
      codeGen.setCurrentSheet(CodeGen.assertSheetNameFromAddress(address));

      const dynamicSection = codeGen.makeRange(address);
      codeGen.dynamicSections.push(dynamicSection);
      const name = `fun${address.replace(/\!/g,'$').replace(':','')}`;

      return {
        name,
        address,
        definition: `function ${name}() { return $$("${address}"); }`
      };
    } else {
      codeGen.setCurrentSheet(CodeGen.assertSheetNameFromAddress(address));

      const cell = codeGen.getCellByAddress(address);
      return cellToFunModel(codeGen, cell);
    }
  });

  return mainTemplate({
    inputMappings: inputs,
    outputMappings: JSON.stringify(outputs, null, 2),
    outputAddresses,
    publicSections: sections,
    dynamicDataSections: codeGen.dynamicSections
  });
}

/**
 * @param codeGen {CodeGen}
 * @param formula {string}
 */
export function cellToFunModel(codeGen, cell) {
  const {formula, address, serialize} = cell;
  const definedNames = codeGen.workbook.Workbook.Names;
  let code;

  if (codeGen.isAnInputAddress(address)) {
    code = `$["${address}"]`;
  } else if (formula) {
    const resolvedFormula = _.reduce(definedNames, (sum, current) => {
      return sum.replace(new RegExp(`\bcurrent.Name\b`), current.Ref)
    }, safelyRemove$(formula));

    console.log(`resolved formula from "${formula}" => "${resolvedFormula}"`)
    console.log(`Compiling cell[${address}] with formula ${formula}...`);

    visit(buildTree(tokenize(resolvedFormula)), codeGen);
    code = codeGen.jsCode();
  } else {
    code = `${serialize()}`;
  }

  const name = `fun${address.replace('!', '$')}`;

  return {
    name,
    address,
    definition: `function ${name}() { return ${code}; }`,
  };
}

export function extractOutputs(outputMappings) {
  const outputs = [];

  extract(outputMappings);

  return outputs;

  function extract (entry) {
    _.values(entry).forEach((maybeRef) => {
      if (typeof maybeRef === 'object') {
        if ('cell' in maybeRef) {
          if (!maybeRef.cell) {
            throw new Error('Invalid mapping config');
          }

          if (outputs.indexOf(maybeRef.cell) === -1) {
            outputs.push(maybeRef.cell);
          }
        } else {
          extract(maybeRef);
        }
      } else if (maybeRef instanceof Array) {
        extract(maybeRef);
      }
    });
  }
}
/**
 * JS CodeGenerator
 */
export class CodeGen {
  static NotImplemented() {
    return new Error('Not Implemented');
  };

  static InvalidEntry() {
    return new Error('Invalid Entry');
  }

  static CorruptionError() {
    return new Error('Corruption Entry');
  }

  static assertSheetNameFromAddress(addressString) {
    if (addressString.indexOf('!') === -1) {
      throw CodeGen.InvalidEntry();
    }

    const [sheetName,] = addressString.split('!');
    return sheetName;
  }

  /**
   *
   * @param workbook {XLSX.Workbook} The Excel workbook to transform
   * @param inputs {Array<string>} Optional addresses for runtime value inputs
   */
  constructor(workbook, inputs) {
    if (!workbook) {
      throw new Error('Invalid argument');
    }

    const _buffer = [];
    const _nodeStack = [];
    this._scopes = [
      {
        buffer: _buffer,
        nodeStack: _nodeStack
      }

    ];
    this._buffer = _buffer;
    this._nodeStack = _nodeStack;

    this.currentSheet = null;
    this.workbook = workbook;

    this.dynamicSections = [];
    this.inputs = (inputs || []).reduce((acc, item) => {
      acc[item] = undefined;
      return acc;
    }, {});
  }

  get buffer() {
    return this._buffer;
  }

  get nodeStack() {
    return this._nodeStack;
  }

  flush() {
    const flushed = this._buffer.splice(0, this._buffer.length);
    const nodeStack = [];
    this._scopes[this._scopes.length - 1].nodeStack = nodeStack;
    this._nodeStack = nodeStack;

    return flushed;
  }

  enterFunction(node) {
    console.log(`function is ${node.name}`);
    this.nodeStack.push(node);
    if (node.arguments) {
      node.arguments.forEach(it => it.parent = node);
    }

    let value;
    if (node.arguments.length === 0) {
      value = `EXCEL.${node.name}(`;
    } else {
      value = `EXCEL.${node.name}(`;
    }

    if (this.nthFunctionParam(node) > 0) {
      this.buffer.push(', ' + value);
    } else {
      this.buffer.push('' + value);
    }
  }

  exitFunction(node) {
    this.nodeStack.pop();
    this.buffer.push(`)`);
  }

  enterCell(node) {
    if (node.skipped) {
      return;
    }

    console.log(`cell is ${node.key}`);
    this.nodeStack.push(node);

    const address = node.key;
    const cell = this.getCellByAddress(address);

    let value;

    if (this.isAnInputAddress(cell.address)) {
      value = `$["${cell.address}"]`;
    } else if (cell.formula) {
      const existing = this.dynamicSections.find(it => it.address === cell.address);
      if (existing) {
        value = `$$("${cell.address}")`;
      } else {
        this.enterScope();
        const section = cellToFunModel(this, cell);
        this.dynamicSections.push(section);
        this.exitScope();

        value = `$$("${cell.address}")`;
      }
    } else if (cell.dataType === 's') {
      value = `"${cell.value}"`;
    } else {
      value = cell.value;
    }

    if (this.nthFunctionParam(node) > 0) {
      this.buffer.push(', ' + value);
    } else {
      this.buffer.push('' + value);
    }
  }

  exitCell(node) {
    this.nodeStack.pop();
  }

  enterCellRange(node) {
    if (node.left) {
      node.left.skipped = true;
    }
    if (node.right) {
      node.right.skipped = true;
    }

    let sheet = this.currentSheet;
    const [refSheet,] = node.left.key.indexOf('!') !== -1 ? node.left.key.split('!'): [sheet];

    const [sc, sr] = splitCellAddress(node.left.key); // start column vs start row
    const [ec, er] = splitCellAddress(node.right.key); // end column vs end row

    if (sc.length > 2 || ec.leading > 2) {
      throw CodeGen.NotImplemented();
    }

    let range;
    if (sc < ec && sr < er) { // it's a 2D array
      range = new Range(decodeColumn(ec) - decodeColumn(sc) + 1, er - sr + 1);
    } else if (sc < ec) {
      range = new Range(decodeColumn(ec) - decodeColumn(sc) + 1, 1);
    } else if (sr < er) {
      range = new Range(1, er - sr + 1);
    } else {
      range = new Range(1, 1);
    }

    let i = 0, j = 0, colCount = range.colCount;
    for (let r = sr; r <= er; r++) {
      j = 0;
      for (let c = decodeColumn(sc); c <= decodeColumn(ec); c++) {
        let address = `${refSheet}!${encodeColumn(c)}${r}`;
        let cell = this.getCellByAddress(address);

        let value;
        if (this.isAnInputAddress(cell.address)) {
          value = `$["${cell.address}"]`;
        } if (cell.formula) {
          const existing = this.dynamicSections.find(it => it.address === cell.address);
          if (existing) {
            value = `$$("${cell.address}")`;
          } else {
            this.enterScope();

            this.setCurrentSheet(CodeGen.assertSheetNameFromAddress(address));
            const section = cellToFunModel(this, cell);
            this.setCurrentSheet(sheet); // Back to previous sheet

            this.dynamicSections.push(section);
            this.exitScope();

            value = `$$("${cell.address}")`;
          }

          range.setValueAt(j, i, value);
        } else if (typeof cell.value !== 'undefined') {
          value = cell.value;
        }
        range.setValueAt(j, i, value);

        j++;
      }

      i++;
    }

    // const existing = this.dynamicSections.find(it => it.address === cell.address);
    const rangeAddress = `${refSheet}!${sc}${sr}:${ec}${er}`;
    if (!this.dynamicSections.find(it => it.address === rangeAddress)) {
      const name = `fun${refSheet}$${sc}${sr}${ec}${er}`;
      const definition = rangeTemplate({
        name,
        colCount: range.colCount,
        rowCount: range.rowCount,
        dataStringified: range.serialize()
      });
      const section = {
        name,
        definition,
        address: rangeAddress
      };
      this.dynamicSections.push(section);
    }

    const value = `$$("${rangeAddress}")`;
    if (this.nthFunctionParam(node) > 0) {
      this.buffer.push(', ' + value);
    } else {
      this.buffer.push('' + value);
    }
  }

  exitCellRange(node) {
    this.nodeStack.pop();
  }

  enterNumber(node) {
    console.log(`number is ${node.value}`);
    this.nodeStack.push(node);

    const { value } = node;
    if (this.nthFunctionParam(node) !== -1) {
      if (this.nthFunctionParam(node) > 0) {
        this.buffer.push(', ' + value);
      } else {
        this.buffer.push('' + value);
      }
    } else {
      this.buffer.push(value);
    }
  }

  exitNumber(numberNode) {
    // this.nodeStack.pop();
  }

  enterText(node) {
    console.log(`text is ${node.value}`);
    const value = serializeText(node.value);

    this.nodeStack.push(node);
    if (this.nthFunctionParam(node) > 0) {
      this.buffer.push(', ' + value);
    } else {
      this.buffer.push(value);
    }
  }

  exitText(node) {
  }

  enterLogical(node) {
  }

  enterBinaryExpression(node) {
    console.log(`bin exp is ${node.operator}`);
    this.nodeStack.push(node);
    [node.left, node.right].forEach(it => it.parent = node);
    const jsOperatorFunction = getFunctionByOperator(node.operator);

    const value = `${jsOperatorFunction}(`;
    if (this.nthFunctionParam(node) > 0) {
      this.buffer.push(', ' + value);
    } else {
      this.buffer.push('' + value);
    }
  }

  exitBinaryExpression(node) {
    this.buffer.push(')');
  }

  enterUnaryExpression(node) {
    console.log(node);
    const { operator: value } = node;

    if (this.nthFunctionParam(node) > 0) {
      this.buffer.push(', ' + value);
    } else {
      this.buffer.push('' + value);
    }
  }

  enterScope() {
    const _buffer = [];
    const _nodeStack = [];
    this._scopes.push({
      buffer: _buffer,
      nodeStack: _nodeStack
    });
    this._buffer = _buffer;
    this._nodeStack = _nodeStack;
  }

  exitScope() {
    if (this._buffer.length !== 0) {
      console.warn('Current buffer is not empty. Exiting scope...')
    }

    this._scopes.pop();
    const scope = this._scopes[this._scopes.length - 1];
    this._buffer = scope.buffer;
    this._nodeStack = scope.nodeStack;
  }

  nthFunctionParam(childNode) {
    const node = childNode.parent;
    if (!node) {
      return -1;
    }

    if (node.type === 'function') {
      if (node && node.arguments) {
        return node.arguments.indexOf(childNode);
      }
    } else if (node.type === 'binary-expression') {
      return node.left === childNode ? 0 : node.right === childNode ? 1 : -1;
    }

    return -1;
  }

  /**
   *
   * @param workbook {WorkBook}
   * @param codeGen {CodeGen}
   * @param addressString
   */
  getCellByAddress(addressString) {
    let sheet, addr;
    addressString = safelyRemove$(addressString);

    if (addressString.indexOf('!') !== -1) {
      [sheet, addr] = addressString.split('!');

    } else {
      sheet = this.currentSheet;
      addr = addressString;
    }

    console.log(`Accessing sheet ${sheet} cell ${addr}...`);

    const cell = this.workbook.Sheets[sheet][addr];
    if (cell === undefined) {
      return new Error('#REF!');
    }
    return {
      address: `${sheet}!${addr}`,
      formula: cell.f,
      format: cell.F,
      value: cell.v,
      dataType: cell.t,
      serialize() {
        switch (cell.t) {
          case 's': return serializeText(cell.v);
          default: return `${cell.v}`;
        }
      }
    }
  }

  findRef(name) {
    const nameList = this.workbook.Workbook.Names;
    const result = _.find(nameList, { Name: name });
    return _.isNil(result)
      ? name
      : result.Ref
  }

  isAnInputAddress(address) {
    return address && address in this.inputs;
  }
  /**
   * Return a JS code model
   * - type: VARIABLE | FUNCTION
   * - name: name of variable or function
   * In case of type VARIABLE:
   * - value: native JS variable
   * In case of type FUNCTION
   * - definition: native JS code
   * @returns {number}
   */
  jsCode() {
    const flushed = this.flush();
    const output = flushed.join('');

    return output;
  }

  makeRange(addressString) {
    const [start, end] = addressString.split(':');
    if (!end) {
      throw CodeGen.InvalidEntry();
    }
    if (start === end) {
      throw CodeGen.CorruptionError();
    }

    const refSheet = CodeGen.assertSheetNameFromAddress(start);
    const [sc, sr] = splitCellAddress(start); // start column vs start row
    const [ec, er] = splitCellAddress(end); // end column vs end row

    if (sc.length > 2 || ec.leading > 2) {
      throw CodeGen.NotImplemented();
    }


    let range;
    if (sc < ec && sr < er) { // it's a 2D array
      range = new Range(decodeColumn(ec) - decodeColumn(sc) + 1, er - sr + 1);
    } else if (sc < ec) {
      range = new Range(decodeColumn(ec) - decodeColumn(sc) + 1, 1);
    } else if (sr < er) {
      range = new Range(1, er - sr + 1);
    } else {
      range = new Range(1, 1);
    }

    let i = 0, j = 0, colCount = range.colCount;
    for (let r = sr; r <= er; r++) {
      j = 0;
      for (let c = decodeColumn(sc); c <= decodeColumn(ec); c++) {
        let address = `${refSheet}!${encodeColumn(c)}${r}`;
        let cell = this.getCellByAddress(address);

        let value;
        if (this.isAnInputAddress(cell.address)) {
          value = `$["${cell.address}"]`;
        } if (cell.formula) {
          const existing = this.dynamicSections.find(it => it.address === cell.address);
          if (existing) {
            value = `$$("${cell.address}")`;
          } else {
            this.enterScope();
            const section = cellToFunModel(this, cell);
            this.dynamicSections.push(section);
            this.exitScope();

            value = `$$("${cell.address}")`;
          }

          range.setValueAt(j, i, value);
        } else if (typeof cell.value !== 'undefined') {
          value = cell.value;
        }
        range.setValueAt(j, i, value);

        j++;
      }

      i++;
    }

    // const existing = this.dynamicSections.find(it => it.address === cell.address);
    const rangeAddress = `${refSheet}!${sc}${sr}:${ec}${er}`;
    const name = `fun${refSheet}$${sc}${sr}${ec}${er}`;
    const definition = rangeTemplate({
      name,
      colCount: range.colCount,
      rowCount: range.rowCount,
      dataStringified: range.serialize()
    });

    return {
      name,
      definition,
      address: rangeAddress
    };
  }

  setCurrentSheet(sheetName) {
    this.currentSheet = sheetName;
  }
}

function isRangeAddress(addressString) {
  return addressString && addressString.indexOf(':') !== -1;
}

function splitCellAddress(addressString) {
  const resolvedAddress = safelyRemove$(addressString);
  const [c, r] = resolvedAddress.replace(/(?:\w+!)?(\$?[A-Z]*)(\$?\d*)/, "$1,$2").split(",");
  return [c, parseInt(r, 10)];
}

/**
 * Wrap single-line text into double quotation marks
 * Wrap multi-line text into concatenation of string with newline character
 *
 * @param text
 * @return {string}
 */
function serializeText(text) {
  const lines = text.split('\r\n');

  if (lines.length === 1) {
    return `"${text}"`;
  } else {
    return `${lines.map(it => `"${it}\\n"`).join('\n\t\t + ')}`;
  }
}

function safelyRemove$(address) {
  return _.replace(address, /\$/g, '');
}
