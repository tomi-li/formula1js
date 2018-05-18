// Static Link
var EXCEL = {};
var formulajs = require("formulajs");
Object.keys(formulajs).forEach(function(key) {
  EXCEL[key] = formulajs[key]
});

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
<% _.forEach(dynamicDataSections, function (section) { %>
<%= section.definition %>
<% }) %>

<% if(dynamicDataSections && dynamicDataSections.length) { %>
function $$(cell) {
  switch (cell) {
    <% _.forEach(dynamicDataSections, function (section) { %>
    case "<%= section.address %>": return <%= section.name %>();
    <% }) %>
  }
}
<% } %>

// Public section
/**
 * @param address {string} Fully qualified cell address (eg. Sheet1!A1)
 * @param params {Map<string,*>} Variadic parameters to update $
 */
exports.execute = function(address) {
  $ = {};
  var params = arguments.length === 2 ? arguments[1]: null;
  if (params) {
    Object.keys(params).forEach(function(key) {
      $[key] = params[key];
    });
  }

  switch (address) {
    <% _.forEach(publicSections, function (section) { %>
    case "<%= section.address %>": return (<%= section.definition %>)();
    <% }) %>
    default: throw new Error('Address not executable');
  }
};
