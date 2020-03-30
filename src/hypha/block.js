import Operations from './operations.js'

/*
 * Emulate a block statement
 */
function Block(parent, scope, statements = []) {
  if (parent) {
    Object.setPrototypeOf(this, parent);
  }
  this.scope = scope || {};
  this.defineStatements(statements);
};


/*
 *
 */
Block.prototype.get = function(property) {
  if (!this.scope) {
    return undefined;
  } else {
    if (property in this.scope) {
      return this.scope[property];
    } else {
      return Object.getPrototypeOf(this).get(property);
    }
  }
};


/*
 *
 */
Block.prototype.assign = function(property, value, origin) {
  if (!this.scope) {
    origin.scope[property] = value;
  } else {
    if (property in this.scope) {
      this.scope[property] = value;
    } else {
      Object.getPrototypeOf(this).assign(property, value, origin || this);
    }
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
        return Promise.resolve({
          value : this.statements[currStatement++].execute(),
          done : false
        });
      } else {
        return Promise.resolve({ done : true });
      }
    }
  };
};


/*
 *
 */
Block.prototype.defineStatements = function(statements) {
  this.statements = statements.map(statement => {
    if (statement instanceof Block) {
      return statement;
    } else {
      const execute = () => {
        const { f, argv, to } = statement;
        let output = Operations[f](...this.collect(argv));
        this.assign(to, output);
        return output;
      }

      return {
        execute : execute.bind(this)
      };
    }
  });
};


export default Block;
