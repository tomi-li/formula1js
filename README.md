# formula1js

[![Build Status](https://travis-ci.org/khanhhua/formula1js.svg?branch=master)](https://travis-ci.org/khanhhua/formula1js)

Compile formulas in an Excel workbook into ES6 module and/or a standalone bundle.

## Command

```
fcompile --config mapping.json --excel my-excel.xlsx --output compiled.js
```

## Implementing standard EXCEL functions

### Return values

- Returns an error if a function fails to generate the desired output. Error message represents the Excel error type,
i.e #N/A, #DIV/0, #REF...
- Return data type could be any of JS data types

### Exceptions

- Throws an error only when such a behavior does not represent Excel. For example: VLOOKUP's second param must always be
a non-empty array

### Variadic functions

- Functions such as SUM, MAX, MIN are variadic
- During parameter evaluation, if an error is found, it is to be immediately returned as a function output
