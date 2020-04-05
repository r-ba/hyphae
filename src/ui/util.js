// To-do: prevent or mitigate risk of collisions
const generateId = () => {
  let result = '';
  const characters = '0123456789ABCDEF';
  const charactersLength = characters.length;
  for ( let i = 0; i < 16; i++ ) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

const operatorArity = {
  // Arithmetical operators
  '+' : 2,
  '-' : 2,
  '*' : 2,
  '/' : 2,
  '**' : 2,
  '%' : 2,

  // Bitwise operators
  '^' : 2,
  '&' : 2,
  '|' : 2,
  '<<' : 2,
  '>>' : 2,
  '>>>' : 2,
  '~' : 1,

  // Logical operators
  '&&' : 2,
  '||' : 2,
  '!' : 1,

  // Comparison operators
  '==' : 2,
  '===' : 2,
  '!=' : 2,
  '!==' : 2,
  '<' : 2,
  '<=' : 2,
  '>' : 2,
  '>=' : 2,

  // Math library
  'abs' : 1,
  'floor' : 1,
  'max' : 2,
  'min' : 2,
};
