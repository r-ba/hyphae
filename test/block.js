import Chai from 'chai';
import {
  Block
} from '../src/hypha/index.js';

const expect = Chai.expect;

describe('Block methods:', function(){

  it('get', async function() {
    const b1 = new Block();
    const b2 = new Block(b1);
    const b3 = new Block(b2);

    b1.scope = { a : 1 };

    expect(b1.get('a')).to.equal(1);
    expect(b1.get('b')).to.equal(undefined);
    expect(b3.get('a')).to.equal(1);
    expect(b3.get('b')).to.equal(undefined);

  });

  it('assign', async function() {
    const b1 = new Block();
    const b2 = new Block(b1);

    b1.scope.c = 0;
    b2.scope.d = 0;

    b1.assign('a', 1);
    b2.assign('b', 2);
    b2.assign('c', 3);
    b2.assign('d', 4);

    expect(b1.scope.a).to.equal(1);
    expect(b1.scope.b).to.equal(undefined);
    expect(b2.scope.b).to.equal(2);
    expect(b1.scope.c).to.equal(3);
    expect(b2.scope.c).to.equal(undefined);
    expect(b1.scope.d).to.equal(undefined);
    expect(b2.scope.d).to.equal(4);
  });

  it('collect', async function() {
    const b1 = new Block();
    const b2 = new Block(b1);

    b1.scope = { 'a' : 1, 'b' : 2 };
    expect(b1.collect(['a', 'b'])).to.deep.equal([1, 2]);
    expect(b2.collect(['a', 'b'])).to.deep.equal([1, 2]);
  });

  it('executeNext', async function() {
    const b1 = new Block();
    b1.scope = { 'a' : 1, 'b' : 2 };
    b1.defineStatements([
      { f : '+', argv : [ 'a', 'b' ], to : 'b' },
      { f : '-', argv : [ 'b', 'a' ], to : 'b' },
    ]);

    await b1.executeNext(1, 2);
    const bVal1 = b1.scope.b;

    await b1.executeNext(0, 2);
    const bVal2 = b1.scope.b;

    expect(bVal1).to.equal(1);
    expect(bVal2).to.equal(2);

  });

  it('defineParent', async function() {
    const b1 = new Block();
    const b2 = new Block();
    const b3 = new Block();

    b1.name = 'Parent block';
    b2.defineParent(b1);
    b3.defineParent(b2);

    expect(b2.__proto__.name).to.equal('Parent block');
    expect(b3.__proto__.__proto__.name).to.equal('Parent block');
  });

  it('insertStatement', async function() {
    const b1 = new Block();
    b1.scope = { 'a' : 1, 'b' : 2 };

    b1.insertStatement(0, {
      f : '+', argv : [ 'a', 'b' ], to : 'c'
    });

    await b1.statements[0].execute();

    expect(b1.scope.c).to.equal(3);

  });

  it('deleteStatement', async function() {
    const b1 = new Block();
    b1.scope = { 'a' : 10, 'b' : 10 };

    b1.defineStatements([
     { f : '+', argv : [ 'a', 'b' ], to : 'c' },
     { f : '-', argv : [ 'a', 'b' ], to : 'c' },
     { f : '*', argv : [ 'a', 'b' ], to : 'c' }
    ]);

    b1.deleteStatement(1);

    await b1.statements[1].execute();

    expect(b1.scope.c).to.equal(100);
  });


  it('isDescendantOf', async function() {
    const b0 = new Block();
    const b1 = new Block();
    const b2 = new Block(b1);
    const b3 = new Block(b2);

    expect(b3.isDescendantOf(b3)).to.equal(false);
    expect(b3.isDescendantOf(b2)).to.equal(true);
    expect(b3.isDescendantOf(b1)).to.equal(true);
    expect(b3.isDescendantOf(b0)).to.equal(false);
    expect(b2.isDescendantOf(b1)).to.equal(true);
    expect(b2.isDescendantOf(b0)).to.equal(false);
    expect(b1.isDescendantOf(b0)).to.equal(false);
    expect(b1.isDescendantOf(Block.prototype)).to.equal(true);
  });

  it('definePipe', async function() {
    const b1 = new Block();
    const b2 = new Block();

    b1.defineStatements([ b2 ]);

    let a = 0;
    b1.definePipe(() => {
      a = 1;
    });

    await b1.execute();
    expect(a).to.equal(1);
  });

});

describe('Block execution:', function() {
  it('Multiple operation statements', async function() {

    const b1 = new Block();

    b1.scope = { a: 1, b: 2, c: 5 };
    b1.defineStatements([
      { f : '+', argv : [ 'a', 'b' ], to : 'out1' },
      { f : '%', argv : [ 'c', 'b' ], to : 'out2' }
    ]);

    await b1.execute();
    expect(b1.scope.out1).to.equal(3);
    expect(b1.scope.out2).to.equal(1);

  });

  it('Deeply nested block statements', async function() {

    const b1 = new Block();
    const b2 = new Block(b1);
    const b3 = new Block(b2);

    b1.scope = { a: 1, b: 2 };
    b1.defineStatements([
      { f : '+', argv : [ 'a', 'b' ], to : 'c' },
      b2
    ]);
    b2.defineStatements([
      { f : '+', argv : [ 'c', 'c' ], to : 'c' },
      b3
    ]);
    b3.defineStatements([
      { f : '+', argv : [ 'c', 'c' ], to : 'c' }
    ]);

    await b1.execute();
    expect(b1.scope.c).to.equal(12);

  });
});
