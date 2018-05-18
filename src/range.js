/* global: $, $$ */

export default class Range {
  constructor(colCount, rowCount) {
    if (!colCount || !rowCount || colCount <= 0 || rowCount <= 0) {
      throw new Error('Invalid argument');
    }

    this.colCount = colCount;
    this.rowCount = rowCount;

    this.data = new Array(rowCount * colCount);
  }

  serialize() {
    const dataStringified = this.data.map((it) => {
      if (typeof it === 'function') {
        return it.name;
      } else if (typeof it === 'undefined') {
        return null;
      } else {
        return '' + it;
      }
    }).join(', ');

    return `[${dataStringified}]`;
  }

  setValueAt(col, row, value) {
    if (col < 0 || col >= this.colCount) {
      throw new Error('Invalid argument');
    }
    if (row < 0 || row >= this.rowCount) {
      throw new Error('Illegal argument');
    }

    this.data[row * this.colCount + col] = value;
  }
}
