/*
 * Emulate a block statement
 */
function Block(parent, scope, statements) {
  if (parent)
    this.__proto__ = parent;
  this.scope = scope || {};
  this.statements = statements || [];
};

// What does "statements" look like? How should it behave?
// Idea: statements is an array of objects, with each object
//       containing a function name, parameter name(s), and
//       output name.

/*
 *
 */
Block.prototype.get = function(property) {
  if (!this.scope)
    return undefined;
  else {
    if (property in this.scope)
      return this.scope[property];
    else return this.__proto__.get(property);
  }
};


/*
 *  Notes:
 *        - Does the origin parameter encapsulate the most useful behaviour?
 *        - Should there be an optional "depth" parameter to specify where
 *          we want to declare a new variable?
 *        - How do we handle, in the UI, the creation of new variables?
 */
Block.prototype.assign = function(property, value, origin) {
  if (!this.scope)
    origin.scope[property] = value;
  else {
    if (property in this.scope)
      this.scope[property] = value;
    else
      this.__proto__.assign(property, value, origin || this);
  }
};


/*
 *
 */
Block.prototype.collect = function(properties) {
  return properties.map(property => this.get(property));
}


/*
 *
 */
Block.prototype.execute = async function() {
  for await (const statementOutput of this) {
    // Empty body -- the motivation for this was to ensure that the execution
    // of statement i occurs before the execution of statement j for all i < j.
    //
    // Since we pass the output of each statement back to the body of this for..of loop,
    // how might we leverage this setup to introduce the behaviour of a "pipe"?
  };
};


/*
 *
 */
Block.prototype[Symbol.asyncIterator] = function() {
  let statement = { value: undefined, done: false };
  let length = this.statements.length;
  let i = 0;

  return {
    next: () => {
      if (i < length) {
        const { f, params, returnAddress } = this.statements[i++];
        const output = operations[f](...this.collect(params))
        this.assign(returnAddress, output);

        return Promise.resolve({ value : output, done : false });
      } else {
        return Promise.resolve({ done : true });
      }
    }
  };
};


// example usage

const operations = {
  '+' : (x,y) => x+y,
};
const parent = null;
const scope = { a: 1, b: 2 };
const statements = [
  {
    f : '+',
    params : [ 'a', 'b' ],
    returnAddress : 'c'
  },
  {
    f : '+',
    params : [ 'c', 'c' ],
    returnAddress : 'c'
  },
];


(async function() {
  const b1 = new Block(parent, scope, statements);
  await b1.execute();
})();

// let b1 = new Block(null, { a : 1 });
// let b2 = new Block(b1, { b : 2 });
// let b3 = new Block(b2, { c : 3 });
// b3.get('a'); // -> 1
