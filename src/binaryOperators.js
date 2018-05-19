export const getFunctionByOperator = (operator) => {

  switch (operator) {
    case '=':
      return 'EQ';
    case '+':
      return 'ADD';
    case '>':
      return 'GREATER_THAN';
    case '>=':
      return 'EQUAL_GREATER_THAN';
    case '<':
      return 'LESS_THAN';
    case '<=':
      return 'EQUAL_LESS_THAN';
    case '-':
      return 'MINUS';
    case '/':
      return 'DIVIDE';
    case '*':
      return 'MULTIPLY';

    default:
      throw new Error(`unsupport operator: ${operator}`);
  }
};
