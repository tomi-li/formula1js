import {CodeGen} from "./compiler";

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const RADIX = ALPHABET.length;
const COLUMNS = new Array(702).fill(0).map((_, index) => {
  if (index < RADIX) {
    return ALPHABET[index];
  }

  let acc = [];
  let int = index;
  let rem = index % RADIX;

  acc.push(ALPHABET[rem]);
  int = Math.floor(index / RADIX) - 1;
  let significance = 1;

  do {
    if (int < RADIX) {
      acc.push(ALPHABET[int]);
      break;
    } else {
      rem = int % Math.pow(RADIX, significance);
      acc.push(ALPHABET[rem]);

      int = Math.floor(int / RADIX);
    }
  } while (int);

  return acc.reverse().join('');
});

/**
 * Takes a column name 'A', 'AA', 'AZ' to 0, 26, 51...
 * @param col
 */
export function decodeColumn(col) {
  if (!col || !col.length) {
    throw CodeGen.CorruptionError();
  }

  // return col.split('').reverse().reduce((acc, char, significance) => {
  //   return acc + (ALPHABET.indexOf(char) + 1) * Math.pow(RADIX, significance);
  // }, 0) - 1;
  return COLUMNS.indexOf(col);
}

/**
 * Take a column number and turns into ASCII A, AB, AZ...
 * @param colIndex
 * @return {any}
 */
export function encodeColumn(colIndex) {
  return COLUMNS[colIndex];
}
