// Static Link
var EXCEL = {};
var formulajs = require("formulajs");
Object.keys(formulajs).forEach(function(key) {
  EXCEL[key] = formulajs[key]
});


function inflate(evaluations, outputs) {
  if (typeof outputs === 'object') {
    Object.keys(outputs).forEach(function(key) {
      visit(outputs, key);
    });
  }

  return outputs;

  function visit(obj, prop) {
    if (typeof obj[prop] === 'object') {
      if ('cell' in obj[prop]) {
        var address = obj[prop].cell;
        setValue(obj, prop, evaluations[address]);
      } else {
        Object.keys(obj[prop]).forEach(function (key) {
          visit(obj[key], key);
        })
      }
    }
  }


  function setValue(obj, prop, value) {
    obj[prop] = value;
  }
}

function EQ(arg1, arg2) {
  return arg1 === arg2;
}

function ADD(arg1, arg2) {
  return arg1 + arg2;
}

function LESS_THAN(arg1, arg2){
  return arg1 < arg2;
}

function EQUAL_LESS_THAN(arg1, arg2){
  return arg1 <= arg2;
}

function GREATER_THAN(arg1, arg2){
  return arg1 > arg2
}

function EQUAL_GREATER_THAN(arg1, arg2){
  return arg1 >= arg2;
}

function MINUS(arg1, arg2){
  return arg1 - arg2;
}

function DIVIDE(arg1, arg2){
  return arg1 / arg2;
}

function MULTIPLY(arg1, arg2){
  return arg1 * arg2;
}

// Static Data section
/**
 * Upon calls to `execute`, $ is updated accordingly.
 * For example:
 * Considering the following Excel content
 * ```
 * A3 = SUM(B1:B3)
 * B1 = 10 * A1
 * B2 = 20 * A2
 * ```
 * When invoking `execute('A3', {A1:1, A2:2})` The output will be:
 * $['Sheet1!A1'] = 1
 * $['Sheet1!A2'] = 2
 */
var $ = {};


// Dynamic Data section
/**
 * Dynamic data evalation function `$$(cell)` is designed to resolve dynamic
 * chain of dependency.
 *
 * For example:
 * Considering the following Excel content
 * ```
 * A3 = SUM(B1:B3)
 * B1 = 10 * A1
 * B2 = 20 * A2
 * ```
 * When compiling, The output will be:
 * ```
 * function funSheet1$B1() { // CodeGen output... }
 *
 * function $$(cell) {
 *   switch (cell) {
 *     ...
 *     case 'Sheet1!B1': return funSheet1$B1();
 *     ...
 *   }
 * }
 *
 * ```
 */

/**
 * Evaluate data into a 1D or 2D array
 *
 */
function funSheet1$B4D4 () {
  var data = [1, 2, 3];
  var colCount = 3;
  var rowCount = 1;

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


function funSheet1$B5() { return EXCEL.SUM(1); }

function funSheet1$B6() { return EXCEL.SUM(1, 2); }

function funSheet1$B7() { return EXCEL.SUM($["Sheet1!B4"]); }

function funSheet1$B8() { return EXCEL.SUM($["Sheet1!B4"], 2, 3); }

/**
 * Evaluate data into a 1D or 2D array
 *
 */
function funSheet1$B5B8 () {
  var data = [$$("Sheet1!B5"), $$("Sheet1!B6"), $$("Sheet1!B7"), $$("Sheet1!B8")];
  var colCount = 1;
  var rowCount = 4;

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


/**
 * Evaluate data into a 1D or 2D array
 *
 */
function funSheet1$B4D4 () {
  var data = [1, 2, 3];
  var colCount = 3;
  var rowCount = 1;

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


function funSheet1$B9() { return EXCEL.SUM($$("Sheet1!B4:D4")); }

/**
 * Evaluate data into a 1D or 2D array
 *
 */
function funSheet1$C4D4 () {
  var data = [2, 3];
  var colCount = 2;
  var rowCount = 1;

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


function funSheet1$B10() { return EXCEL.SUM($["Sheet1!B4"], $$("Sheet1!C4:D4")); }

/**
 * Evaluate data into a 1D or 2D array
 *
 */
function funSheet1$B9B10 () {
  var data = [$$("Sheet1!B9"), $$("Sheet1!B10")];
  var colCount = 1;
  var rowCount = 2;

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




function $$(cell) {
  switch (cell) {
    
    case "Sheet1!B4:D4": return funSheet1$B4D4();
    
    case "Sheet1!B5": return funSheet1$B5();
    
    case "Sheet1!B6": return funSheet1$B6();
    
    case "Sheet1!B7": return funSheet1$B7();
    
    case "Sheet1!B8": return funSheet1$B8();
    
    case "Sheet1!B5:B8": return funSheet1$B5B8();
    
    case "Sheet1!B4:D4": return funSheet1$B4D4();
    
    case "Sheet1!B9": return funSheet1$B9();
    
    case "Sheet1!C4:D4": return funSheet1$C4D4();
    
    case "Sheet1!B10": return funSheet1$B10();
    
    case "Sheet1!B9:B10": return funSheet1$B9B10();
    
  }
}


// Public section
/**
 * @param address {string} Fully qualified cell address (eg. Sheet1!A1)
 * @param params {Map<string,*>} Variadic parameters to update $
 */
function execute(address) {
  $ = {};
  var params = arguments.length === 2 ? arguments[1]: null;
  if (params) {
    Object.keys(params).forEach(function(key) {
      $[key] = params[key];
    });
  }

  switch (address) {
    
    case "Sheet1!B2": return (function funSheet1$B2() { return EXCEL.NOW(); })();
    
    case "Sheet1!B5": return (function funSheet1$B5() { return EXCEL.SUM(1); })();
    
    case "Sheet1!B6": return (function funSheet1$B6() { return EXCEL.SUM(1, 2); })();
    
    case "Sheet1!B7": return (function funSheet1$B7() { return EXCEL.SUM($["Sheet1!B4"]); })();
    
    case "Sheet1!B8": return (function funSheet1$B8() { return EXCEL.SUM($["Sheet1!B4"], 2, 3); })();
    
    case "Sheet1!B9": return (function funSheet1$B9() { return EXCEL.SUM($$("Sheet1!B4:D4")); })();
    
    case "Sheet1!G5": return (function funSheet1$G5() { return EXCEL.SUM($$("Sheet1!B5")); })();
    
    case "Sheet1!G6": return (function funSheet1$G6() { return EXCEL.SUM($$("Sheet1!B5"), $$("Sheet1!B6")); })();
    
    case "Sheet1!G8": return (function funSheet1$G8() { return EXCEL.SUM($$("Sheet1!B5"), $$("Sheet1!B6"), $$("Sheet1!B7"), $$("Sheet1!B8")); })();
    
    case "Sheet1!G9": return (function funSheet1$G9() { return EXCEL.SUM($$("Sheet1!B5:B8")); })();
    
    case "Sheet1!G10": return (function funSheet1$G10() { return EXCEL.SUM($$("Sheet1!B8"), $$("Sheet1!B9:B10")); })();
    
    case "Sheet1!B14": return (function funSheet1$B14() { return EXCEL.SUM(EXCEL.SUM(1)); })();
    
    case "Sheet1!B15": return (function funSheet1$B15() { return EXCEL.SUM(EXCEL.SUM(1), EXCEL.SUM(2)); })();
    
    case "Sheet1!B16": return (function funSheet1$B16() { return EXCEL.SUM(EXCEL.SUM(1)); })();
    
    case "Sheet1!B17": return (function funSheet1$B17() { return EXCEL.SUM(EXCEL.SUM(1), EXCEL.SUM(2, 3)); })();
    
    case "Sheet1!B18": return (function funSheet1$B18() { return EXCEL.SUM(EXCEL.SUM(1), $$("Sheet1!B5")); })();
    
    default: throw new Error('Address not executable');
  }
}
exports.execute = execute;

/**
 * @param inputs {Map<string, anything>}
 * For example: { input1: 10 }
 */
exports.executeFormulas = function(inputs) {
  var assignedInputs = {};
  var evaluations = {};
  
  assignedInputs["Sheet1!B2"] = inputs["input1"];
  assignedInputs["Sheet1!B3"] = inputs["input2"];
  assignedInputs["Sheet1!B4"] = inputs["input3"];

  var outputs = [{"cell":"Sheet1!B2"},{"cell":"Sheet1!B5"},{"cell":"Sheet1!B6"},{"cell":"Sheet1!B7"},{"cell":"Sheet1!B8"},{"cell":"Sheet1!B9"},{"cell":"Sheet1!G5"},{"cell":"Sheet1!G6"},{"cell":"Sheet1!G8"},{"cell":"Sheet1!G9"},{"cell":"Sheet1!G10"},{"cell":"Sheet1!B14"},{"cell":"Sheet1!B15"},{"cell":"Sheet1!B16"},{"cell":"Sheet1!B17"},{"cell":"Sheet1!B18"}];
  
  evaluations["Sheet1!B2"] = execute("Sheet1!B2", assignedInputs);
  evaluations["Sheet1!B5"] = execute("Sheet1!B5", assignedInputs);
  evaluations["Sheet1!B6"] = execute("Sheet1!B6", assignedInputs);
  evaluations["Sheet1!B7"] = execute("Sheet1!B7", assignedInputs);
  evaluations["Sheet1!B8"] = execute("Sheet1!B8", assignedInputs);
  evaluations["Sheet1!B9"] = execute("Sheet1!B9", assignedInputs);
  evaluations["Sheet1!G5"] = execute("Sheet1!G5", assignedInputs);
  evaluations["Sheet1!G6"] = execute("Sheet1!G6", assignedInputs);
  evaluations["Sheet1!G8"] = execute("Sheet1!G8", assignedInputs);
  evaluations["Sheet1!G9"] = execute("Sheet1!G9", assignedInputs);
  evaluations["Sheet1!G10"] = execute("Sheet1!G10", assignedInputs);
  evaluations["Sheet1!B14"] = execute("Sheet1!B14", assignedInputs);
  evaluations["Sheet1!B15"] = execute("Sheet1!B15", assignedInputs);
  evaluations["Sheet1!B16"] = execute("Sheet1!B16", assignedInputs);
  evaluations["Sheet1!B17"] = execute("Sheet1!B17", assignedInputs);
  evaluations["Sheet1!B18"] = execute("Sheet1!B18", assignedInputs);

  inflate(evaluations, outputs);
  return outputs;
};
