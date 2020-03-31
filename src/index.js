import {
  Block,
  ConditionalBlock,
  LoopBlock
} from './hypha/index.js';


(async function() {

  await BlockExample();
  await ConditionalExample();
  await LoopExample();

})();


/* Example usage of each `Block` object */

async function BlockExample() {
  const b1 = new Block();
  const b2 = new Block();

  b1.scope = { a: 1, b: 2 };
  b2.defineParent(b1);
  b1.defineStatements([
    { f : '+', argv : [ 'a', 'b' ], to : 'c' },
    b2
  ]);
  b2.defineStatements([
    { f : '+', argv : [ 'c', 'c' ], to : 'c' }
  ]);

  await b1.execute();
  console.log(b1.scope.c);
};

async function ConditionalExample() {
  const s = [{ f : '+', argv : [ 'a', 'b' ], to : 'c' }];
  const main = new Block(null, { c : 0, x : 101, y : 100 });
  const b1 = new Block(main, { a : 1, b : 2 }, s);
  const b2 = new Block(main, { a : 3, b : 4 }, s);
  const b3 = new Block(main, { a : 5, b : 6 }, s);
  const b4 = new Block(main, { a : 7, b : 8 }, s);

  const c = new ConditionalBlock(main, [ b1, b2, b3, b4 ], [
    { f: '<', argv: ['x', 'y']},
    { f: '>', argv: ['x', 'y']},
    { f: '===', argv: ['x', 'y']}
  ]);

  await c.execute();
  console.log(c.parent.scope.c)
};

async function LoopExample() {
  const main = new Block(null, { i : 0, triangular_num: 0, 1: 1, n: 100 });

  const loop = new LoopBlock(main, [
     { f : '+', argv : [ 'i', 'triangular_num' ], to : 'triangular_num' },
     { f : '+', argv : [ 'i', '1' ], to : 'i' },
   ],
   [{ f : '<', argv : [ 'i', 'n' ] }]);

   await loop.execute();
   console.log(main.scope['triangular_num']); // 5050
};
