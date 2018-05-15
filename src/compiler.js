import fs from 'fs';
import path from 'path';
import _ from 'lodash';

import xlsx from 'xlsx';
import {tokenize} from 'excel-formula-tokenizer';
import {buildTree, visit} from 'excel-formula-ast';

const mainTemplate = _.template(fs.readFileSync(path.resolve(__dirname + '/../templates/main.template.tpl'), 'utf8'));
const functionTemplate = _.template(fs.readFileSync(path.resolve(__dirname + '/../templates/function.template.tpl'), 'utf8'));

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
  return {
    name,
    address,
    definition: `function ${name}() { return ${codeGen.jsCode()}; }`,
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
    this._nodeStack = [];
    return flushed;
  }

  enterFunction(node) {
    console.log(`function is ${node.name}`);
    this.nodeStack.push(node);

    if (node.arguments.length === 0) {
      this.buffer.push(`EXCEL.${node.name}(`);
    } else {
      this.buffer.push(`EXCEL.${node.name}(`);
    }
  }

  exitFunction(node) {
    this.nodeStack.pop();
    this.buffer.push(`)`);
  }

  enterCell(node) {
    console.log(`cell is ${node.key}`);
    this.nodeStack.push(node);

    const address = node.key;
    const cell = this.getCellByAddress(address);

    let value;

    if (cell.formula) {
      this.enterScope();
      const section = cellToFunModel(this, cell);
      this.dynamicSections.push(section);
      this.exitScope();

      value = `$$("${cell.address}")`;

      if (this.buffer.length > 1 && this.buffer[this.buffer.length - 2].lastIndexOf("(") !== -1) {
        this.buffer.push(', ' + value);
      } else {
        this.buffer.push('' + value);
      }
    } else {
      value = cell.value;

      if (this.isNowFunctionParam()) {
        if (this.buffer[this.buffer.length - 1].lastIndexOf("(") === -1) {
          this.buffer.push(', ' + value);
        } else {
          this.buffer.push('' + value);
        }
      } else {
        this.buffer.push(value);
      }
    }
  }

  exitCell(node) {
    this.nodeStack.pop();
  }

  enterCellRange(node) {}

  enterNumber(node) {
    console.log(`number is ${node.value}`);
    this.nodeStack.push(node);

    const {value} = node;
    if (this.isNowFunctionParam()) {
      if (this.buffer[this.buffer.length - 1].lastIndexOf("(") === -1) {
        this.buffer.push(', ' + value);
      } else {
        this.buffer.push('' + value);
      }
    } else {
      this.buffer.push(value);
    }
  }

  exitNumber(numberNode) {
    this.nodeStack.pop();
  }

  enterText(node) {
    console.log(`text is ${numberNode.value}`);
    this.nodeStack.push(node);
    this.buffer.push(numberNode.value);
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
      return this.nodeStack[len - 2];
    } else {
      return null;
    }
  }

  isNowFunctionParam() {
    const node = this.getParentNode();
    if (node) {
      return node.type === 'function';
    }

    return false;
  }
  /**
   *
   * @param workbook {WorkBook}
   * @param codeGen {CodeGen}
   * @param addressString
   */
  getCellByAddress(addressString) {
    let sheet, addr;
    if (addressString.indexOf('!') !== -1) {
      [sheet, addr] = addressString.split('!');

    } else {
      sheet = this.currentSheet;
      addr = addressString;
    }

    console.log(`Accessing sheet ${sheet} cell ${addr}...`)
    const cell = this.workbook.Sheets[sheet][addr];
    return {
      address: `${sheet}!${addr}`,
      formula: cell.f,
      format: cell.F,
      value: cell.v,
      dataType: cell.t
    }
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
