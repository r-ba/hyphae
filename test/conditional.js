import Chai from 'chai';
import {
  Block,
  ConditionalBlock
} from '../src/hypha/index.js';

const expect = Chai.expect;

describe('Conditional methods:', function(){
 
  it('isDescendantOf', async function() {
    const main = new Block(null, { x : 100, y : 100 });
    const b1 = new Block(main);
    const b2 = new Block(main);
    const c = new ConditionalBlock(main, [ b1, b2 ], [{ f: '<', argv: ['x', 'y']}]);

    expect(c.isDescendantOf(main)).to.equal(true);
  });

  it('Pipe only called once per call to execute', async function() {

    const main = new Block(null, { x : 100, y : 100 });
    const b1 = new Block(main);
    const b2 = new Block(main);
    const b3 = new Block(main);
    const b4 = new Block(main);

    const c = new ConditionalBlock(main, [ b1, b2, b3, b4 ], [
      { f: '<', argv: ['x', 'y']},
      { f: '>', argv: ['x', 'y']},
      { f: '===', argv: ['x', 'y']}
    ]);

    let a = 0;
    c.definePipe(() => {
      a++;
    });

    await c.execute();
    expect(a).to.equal(1);

  });

});

describe('Conditional execution:', function(){

  it('First condition is true, evaluate first statement', async function() {

    const s = [{ f : '+', argv : [ 'a', 'b' ], to : 'c' }];
    const main = new Block(null, { c : 0, x : 100, y : 101 });
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
    expect(await c.body.get('c')).to.equal(3);

  });

  it('Second condition is true, evaluate second statement', async function() {

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
    expect(await c.body.get('c')).to.equal(7);

  });

  it('All conditions are false, evaluate default statement', async function() {

    const s = [{ f : '+', argv : [ 'a', 'b' ], to : 'c' }];
    const main = new Block(null, { c : 0, x : 100, y : 100 });
    const b1 = new Block(main, { a : 1, b : 2 }, s);
    const b2 = new Block(main, { a : 3, b : 4 }, s);
    const b3 = new Block(main, { a : 5, b : 6 }, s);
    const b4 = new Block(main, { a : 7, b : 8 }, s);

    const c = new ConditionalBlock(main, [ b1, b2, b3, b4 ], [
      { f: '<', argv: ['x', 'y']},
      { f: '>', argv: ['x', 'y']},
      { f: '-', argv: ['x', 'y']}
    ]);

    await c.execute();
    expect(await c.body.get('c')).to.equal(15);

  });

});
