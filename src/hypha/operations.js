const Operations = {

  // Arithmetical operators
  '+' : (x, y) => x + y,
  '-' : (x, y) => x - y,
  '*' : (x, y) => x * y,
  '/' : (x, y) => x / y,
  '**' : (x, y) => x ** y,
  '%' : (x, y) => x % y,

  // Bitwise operators
  '^' : (x, y) => x ^ y,
  '&' : (x, y) => x & y,
  '|' : (x, y) => x | y,
  '<<' : (x, y) => x << y,
  '>>' : (x, y) => x >> y,
  '>>>' : (x, y) => x >>> y,
  '~' : x => ~x,

  // Logical operators
  '&&' : (x, y) => x && y,
  '||' : (x, y) => x || y,
  '!' : x => !x,

  // Comparison operators
  '==' : (x, y) => x == y,
  '===' : (x, y) => x === y,
  '!=' : (x, y) => x != y,
  '!==' : (x, y) => x !== y,
  '<' : (x, y) => x < y,
  '<=' : (x, y) => x <= y,
  '>' : (x, y) => x > y,
  '>=' : (x, y) => x >= y,

  // Math library
  'abs' : x => Math.abs(x),
  'floor' : x => Math.floor(x),
  'max' : function() {
    return Math.max(...arguments);
  },
  'min' : function() {
    return Math.min(...arguments);
  },
  // ...
};

export default Operations;
