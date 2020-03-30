import Operations from './operations.js'

/*
 * Emulate a block statement
 */
function Block(parent, scope, statements) {
  if (parent)
    Object.setPrototypeOf(this, parent);
  this.scope = scope || {};
  this.statements = statements || [];
};


/*
 *
 */
Block.prototype.get = function(property) {
  if (!this.scope)
    return undefined;
  else {
    if (property in this.scope)
      return this.scope[property];
    else return Object.getPrototypeOf(this).get(property);
  }
};


/*
 *
 */
Block.prototype.assign = function(property, value, origin) {
  if (!this.scope)
    origin.scope[property] = value;
  else {
    if (property in this.scope)
      this.scope[property] = value;
    else
      Object.getPrototypeOf(this).assign(property, value, origin || this);
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
  for await (const statementOutput of this) {};
};


/*
 *
 */
Block.prototype[Symbol.asyncIterator] = function() {
  let numStatements = this.statements.length;
  let currStatement = 0;

  return {
    next: () => {
      if (currStatement < numStatements) {
        const { f, argv, to } = this.statements[currStatement++];
        const output = Operations[f](...this.collect(argv));
        this.assign(to, output);

        return Promise.resolve({ value : output, done : false });
      } else {
        return Promise.resolve({ done : true });
      }
    }
  };
};


export default Block;
