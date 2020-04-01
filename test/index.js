const expect = require('chai').expect;
const {
  Block,
  ConditionalBlock,
  LoopBlock
} = require('../build/hyphae.umd.js');


describe('Block:', function(){

  it('Nested block statement', async function() {

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
    expect(b1.scope.c).to.equal(6);

  });

});


describe('ConditionalBlock:', function(){

  it('Elif evaluates to true', async function() {

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
    expect(c.parent.scope.c).to.equal(7);

  });

});


describe('LoopBlock:', function(){

  it('Sum the numbers 1 to 100', async function() {
   const main = new Block(null, { i : 0, sum: 0, 1: 1, n: 100 });

   const loop = new LoopBlock(main, [
      { f : '+', argv : [ 'i', 'sum' ], to : 'sum' },
      { f : '+', argv : [ 'i', '1' ], to : 'i' },
    ],
    [{ f : '<', argv : [ 'i', 'n' ] }]);

    await loop.execute();

    expect(main.scope.sum).to.equal(5050);

  });

});
