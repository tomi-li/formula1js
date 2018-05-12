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
    const cell = codeGen.getCellByAddress(address);
    return cellToDynamicSection(codeGen, cell);
  });

  return mainTemplate({
    dynamicDataSections: sections
  });
}

/**
 * @param codeGen {CodeGen}
 * @param formula {string}
 */
export function cellToDynamicSection(codeGen, cell) {
  const {formula, address} = cell;
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
  constructor(workbook) {
    this.buffer = [];
    this.currentSheet = null;
    this.workbook = workbook;
  }

  enterFunction(node) {
    console.log(`function is ${node.name}`);
    if (node.arguments.length === 0) {
      this.buffer.push(`EXCEL.${node.name}()`);
    } else {
      // TODO Handle non-empty args functions
    }
  }

  exitFunction(node) {}

  enterCell(node) {

  }

  enterCellRange(node) {}

  enterNumber(numberNode) {
    console.log(`number is ${numberNode.value}`)
  }

  enterText(node) {}

  enterLogical(node) {}

  enterBinaryExpression(node) {}

  enterUnaryExpression(unaryNode) {

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
      sheet = codeGen.currentSheet;
      addr = addressString;
    }

    const cell = this.workbook.Sheets[sheet][addr];
    return {
      address: `${sheet}!${addr}`,
      formula: cell.f,
      format: cell.F,
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
    return this.buffer.pop();
  }

  setCurrentSheet(sheetName) {
    this.currentSheet = sheetName;
  }
}
