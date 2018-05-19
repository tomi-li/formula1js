export function MATCH(value, array, match_type) {
  if (typeof value === 'undefined') {
    throw new Error();
  }

  if (!array || !array.length) {
    throw new Error();
  }

  if (Number.isNaN(value)) {
    return Number.NaN;
  }

  if (match_type === 0) {
    var index = array.indexOf(value);
    if (index !== -1) {
      return index + 1;
    }
  } else if (match_type === 1) {
    var index = Number.NaN;
    var max;
    for (var i = 0, len = array.length; i < len; i++) {
      if (array[i] < max) {
        throw new Error();
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

  return Number.NaN;
}
