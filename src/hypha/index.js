import Block from './block.js';

// example usage
const parent = null;
const scope = { a: 1, b: 2 };
const statements = [
  {
    f : '+',
    argv : [ 'a', 'b' ],
    to : 'c'
  },
  {
    f : '+',
    argv : [ 'c', 'c' ],
    to : 'c'
  },
];


(async function() {
  const b1 = new Block(parent, scope, statements);
  await b1.execute();
  console.log(b1.scope);
})();
