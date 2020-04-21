import Chai from 'chai';
import {
  Block,
  LoopBlock
} from '../src/hypha/index.js';

const expect = Chai.expect;

describe('Loop methods:', function(){

  it('isDescendantOf', async function() {
    const main = new Block();
    const loop = new LoopBlock(main);
    expect(loop.isDescendantOf(main)).to.equal(true);
  });

  it('Pipe called on each iteration', async function() {
    const main = new Block(null, { i : 0, n: 100 });
    const empty = new Block();

    const loop = new LoopBlock(main, [empty], [{ f : '<', argv : [ 'i', 'n' ] }]);

    loop.definePipe(() => {
      main.scope.i += 1;
    });

    await loop.execute();
    expect(main.scope.i).to.equal(100);
  });

});

describe('Loop execution:', function(){

  it('False initial condition', async function() {
    const main = new Block(null, { i : 0, n: 100 });

    const loop = new LoopBlock(main, [
       { f : '+', argv : [ 'i', '1' ], to : 'i' },
     ],
     [{ f : '>', argv : [ 'i', 'n' ] }]);

     await loop.execute();
     expect(main.scope.i).to.equal(0);
  });

  it('Count to 100', async function() {
    const main = new Block(null, { i : 0, 1: 1, n: 100 });

    const loop = new LoopBlock(main, [
       { f : '+', argv : [ 'i', '1' ], to : 'i' },
     ],
     [{ f : '<', argv : [ 'i', 'n' ] }]);

     await loop.execute();
     expect(main.scope.i).to.equal(100);
  });

  it('Sum 1 .. 100', async function() {
    const main = new Block(null, { i : 0, sum: 0, 1: 1, n: 100 });

    const loop = new LoopBlock(main, [
       { f : '+', argv : [ 'i', 'sum' ], to : 'sum' },
       { f : '+', argv : [ 'i', '1' ], to : 'i' },
     ],
     [{ f : '<=', argv : [ 'i', 'n' ] }]);

     await loop.execute();
     expect(main.scope.sum).to.equal(5050);
  });

  it('Multiple conditions', async function() {
    const main = new Block(null, { i : 0, j : 10, 1: 1, n: 100 });

    const loop = new LoopBlock(main, [
       { f : '+', argv : [ 'i', '1' ], to : 'i' },
       { f : '-', argv : [ 'j', '1' ], to : 'j' },
     ],
     [
       { f : '<', argv : [ 'i', 'n' ] },
       { f : '>', argv : [ 'j', 'i' ] }
     ]);

     await loop.execute();
     expect(main.scope.i).to.equal(5);
     expect(main.scope.j).to.equal(5);
  });

});
