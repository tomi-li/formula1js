/**
 * Evaluate data into a 1D or 2D array
 *
 */
function <%= name %> () {
  var data = <%= dataStringified %>;
  var colCount = <%= colCount %>;
  var rowCount = <%= rowCount %>;

  if (colCount === 1 || rowCount === 1) {
    return data;
  }

  let slice = new Array(rowCount);

  for (let i = 0; i < rowCount; i++) {
    slice[i] = new Array(colCount);

    for (let j = 0; j < colCount; j++) {
      slice[i][j] = data[i * colCount + j];
    }
  }

  return slice;
}
