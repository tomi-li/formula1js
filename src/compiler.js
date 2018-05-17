import fs from 'fs';
import path from 'path';
import _ from 'lodash';

import xlsx from 'xlsx';
import {tokenize} from 'excel-formula-tokenizer';
import {buildTree, visit} from 'excel-formula-ast';

import Range from './range';

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
  const {inputs, outputs} = config;
  if (!outputs || !outputs.length) {
    throw new Error('No outputs cell specified');
  }
  if (!excelFile) {
    throw new Error('No Excel file specified');
  }

  const workbook = xlsx.read(excelFile, {type:'file', cellFormula: true});

  const codeGen = new CodeGen(workbook);
  const sections = _.map(outputs, (address) => {
    codeGen.setCurrentSheet(CodeGen.assertSheetNameFromAddress(address));

    const cell = codeGen.getCellByAddress(address);
    return cellToFunModel(codeGen, cell);
  });

  return mainTemplate({
    publicSections: sections,
    dynamicDataSections: codeGen.dynamicSections
  });
}

/**
 * @param codeGen {CodeGen}
 * @param formula {string}
 */
export function cellToFunModel(codeGen, cell) {
  const {formula, address} = cell;

  console.log(`Compiling cell[${address}] with formula ${formula}...`);
  visit(buildTree(tokenize(formula)), codeGen);

  const name = `fun${address.replace('!','$')}`;
  const code = codeGen.jsCode();
  return {
    name,
    address,
    definition: `function ${name}() { return ${code}; }`,
  };
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

  static assertSheetNameFromAddress(addressString) {
    if (addressString.indexOf('!') === -1) {
      throw CodeGen.InvalidEntry();
    }

    const [sheetName, ] = addressString.split('!');
    return sheetName;
  }

  constructor(workbook) {
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

    if (cell.formula) {
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

      if (this.nthFunctionParam(node) > 0) {
        this.buffer.push(', ' + value);
      } else {
        this.buffer.push('' + value);
      }
    } else {
      value = cell.value;

      if (this.nthFunctionParam(node) > 0) {
        this.buffer.push(', ' + value);
      } else {
        this.buffer.push('' + value);
      }
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

    const [sc, sr] = splitCellAddress(node.left.key); // start column vs start row
    const [ec, er] = splitCellAddress(node.right.key); // end column vs end row

    if (sc.length > 1 || ec.leading > 1) {
      throw CodeGen.NotImplemented();
    }

    let range;
    if (sc < ec && sr < er) { // it's a 2D array
      range = new Range(ec.charCodeAt(0) - sc.charCodeAt(0) + 1, er - sr + 1);
    } else if (sc < ec) {
      range = new Range(ec.charCodeAt(0) - sc.charCodeAt(0) + 1, 1);
    } else if (sr < er) {
      range = new Range(1, er - sr + 1);
    } else {
      range = new Range(1, 1);
    }

    let i = 0, j = 0, colCount = range.colCount;
    for (let r = sr; r<=er; r++) {
      j = 0;
      for (let c = sc.charCodeAt(0); c <= ec.charCodeAt(0); c++) {
        let address = `${sheet}!${String.fromCharCode(c)}${r}`;
        let cell = this.getCellByAddress(address);

        if (cell.formula) {
          throw CodeGen.NotImplemented();
          // range.setValueAt(j, i, `$$("${address}")`);
        } else if (cell.value) {
          range.setValueAt(j, i, cell.value);
        }

        j++;
      }

      i++;
    }

    // const existing = this.dynamicSections.find(it => it.address === cell.address);
    const name = `fun${sheet}$${node.left.key}${node.right.key}`;
    const rangeAddress = `${sheet}!${node.left.key}:${node.right.key}`;
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

    const {value} = node;
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
    this.nodeStack.push(node);
    this.buffer.push(node.value);
  }

  exitText(node) {}

  enterLogical(node) {}

  enterBinaryExpression(node) {}

  enterUnaryExpression(unaryNode) {

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

  getParentNode() {
    const len = this.nodeStack.length;
    if (len > 1) {
      return this.nodeStack[len - 1].parent;
    } else {
      return null;
    }
  }

  nthFunctionParam(childNode) {
    const node = this.getParentNode();
    if (node && node.arguments) {
      return node.arguments.indexOf(childNode);
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
    addressString = this.findRef(addressString);
    addressString = this.safelyRemove$(addressString);

    if (addressString.indexOf('!') !== -1) {
      [sheet, addr] = addressString.split('!');

    } else {
      sheet = this.currentSheet;
      addr = addressString;
    }

    console.log(`Accessing sheet ${sheet} cell ${addr}...`);

    const cell = this.workbook.Sheets[sheet][addr];
    return {
      address: `${sheet}!${addr}`,
      formula: cell.f,
      format: cell.F,
      value: cell.v,
      dataType: cell.t
    }
  }

  findRef(name) {
    const nameList = this.workbook.Workbook.Names;
    const result = _.find(nameList, { Name: name });
    return _.isNil(result)
      ? name
      : result.Ref
  }

  safelyRemove$(address) {
    return _.replace(address, /\$/g, '');
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

  setCurrentSheet(sheetName) {
    this.currentSheet = sheetName;
  }
}

function splitCellAddress(addressString) {
  return addressString.replace(/(\$?[A-Z]*)(\$?\d*)/,"$1,$2").split(",");
}
