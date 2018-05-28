export function INDEX(array, index, col_index, area_num) {
  if (!array || !array.length) {
    throw new Error('Invalid array');
  }

  if (array instanceof Error) {
    return array;
  }
  if (index instanceof Error) {
    return index;
  }
  if (col_index instanceof Error) {
    return col_index;
  }

  if (area_num) {
    throw new Error('Not supported');
  }

  if (typeof index === 'undefined' && typeof col_index === 'undefined') {
    return new Error('#VALUE!');
  }

  if (index < 0) {
    return new Error('#VALUE!');
  } else if (index === 0) {
    index = 1;
  }

  if (array[0] instanceof Array) {
    if (typeof col_index === 'undefined') {
      return new Error('#REF!');
    }

    return array[index - 1][col_index - 1];
  } else {
    return array[index - 1];
  }
}

export function MATCH(value, array, match_type) {
  if (!array || !array.length) {
    throw new Error('Invalid array');
  }

  if (value instanceof Error) {
    return value;
  }

  if (typeof value === 'undefined') {
    return new Error('#N/A');
  }

  if (Number.isNaN(value)) {
    return new Error('#N/A');
  }

  if (match_type === 0) {
    var index = array.indexOf(value);
    if (index !== -1) {
      return index + 1;
    }
  } else if (match_type === 1) {
    var index = new Error('#N/A');
    var max;
    for (var i = 0, len = array.length; i < len; i++) {
      if (array[i] < max) {
        return new Error('#N/A');
      }

      if (array[i] <= value && (!max || array[i] >= max)) {
        index = i + 1;
      }

      if (!max || array[i] > max) {
        max = array[i];
      }
    }
    return index;
  } else if (match_type === -1) {
    for (var i = 0, len = array.length; i < len; i++) {
      if (array[i] >= value) {
        return i + 1;
      }
    }
  }

  return new Error('#N/A');
}

export function VLOOKUP(value, array, col_index, approx) {
  if (!array || !array.length) {
    throw new Error('Invalid array');
  }

  if (typeof value === 'undefined') {
    return new Error('#N/A');
  }

  if (Number.isNaN(value)) {
    return new Error('#N/A');
  }

  if (value instanceof Error) {
    return value;
  }

  var result = new Error('#N/A');
  if (approx) {
    for (var i = array.length - 1; i >= 0; i--) {
      if (array[i][0] <= value) {
        result = array[i][col_index - 1];
        break;
      }
    }
  } else {
    var result = new Error('#N/A');
    for (var i = 0, len = array.length; i < len; i++) {
      if (array[i][0] === value) {
        result = array[i][col_index - 1];
        break;
      }
    }

    if (result === null) {
      result = 0;
    }
  }

  return result;
}
