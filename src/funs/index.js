import * as lookups from './lookups';

export function exportInto(EXCEL) {
  Object.keys(lookups).forEach(fn => EXCEL[fn.name] = fn);
}
