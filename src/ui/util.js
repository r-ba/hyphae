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


const positionConnectors = (radii, position, connectors) => {
  const { x, y } = position;
  const n = connectors.length;
  const a = -1 * Math.PI / (2 * n);
  const r = radii.length;

  for (let i = 0; i < n; i++) {
    connectors[i].forEach((ele, j) => {
      const x0 = Math.cos((i + n/2 + 0.5) * a);
      const y0 = Math.sin((i + n/2 + 0.5) * a);
      ele.animate({
        position : {
          x : x - radii[j] * x0,
          y : y - radii[j] * y0
        }
      }, {
        duration : 750
      })
    });
  }
};
