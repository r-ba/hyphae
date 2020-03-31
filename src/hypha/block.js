import Operations from './operations.js'

/**
 * Emulate a block statement.
 *
 * @param {Block=} parent The enclosing Block object.
 * @param {object=} scope Local state variables.
 * @param {Array<object>=} statements A compound sequence of statements.
 */
function Block(parent = null, scope = {}, statements = []) {
  if (parent) {
    Object.setPrototypeOf(this, parent);
  }
  this.scope = scope;
  this.defineStatements(statements);
};


/**
 * Retrieve property from it's nearest scope in the Block hierarchy.
 *
 * @param {string} property Name of property being looked up.
 * @return {number|undefined} Corresponding property value, if it exists.
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


/**
 * Assign property to it's nearest scope in the Block hierarchy.
 *
 * @param {string} property Name of property being assigned to.
 * @param {number} value Corresponding value to be assigned.
 * @param {Block=} origin Initial Block to traverse upward from.
 */
Block.prototype.assign = function(property, value, origin = this) {
  if (!this.scope) {
    origin.scope[property] = value;
  } else {
    if (property in this.scope) {
      this.scope[property] = value;
    } else {
      Object.getPrototypeOf(this).assign(property, value, origin);
    }
  }
};


/**
 * Retrieve multiple properties from their nearest scope in the Block hierarchy.
 *
 * @param {Array<string>} properties The named properties to be retrieved.
 * @return {Array<number>} The current property values.
 */
Block.prototype.collect = function(properties) {
  return properties.map(property => this.get(property));
}


/**
 * Evaluate a sequence of statements with respect to their ordering.
 */
Block.prototype.execute = async function() {
  for await (const statementOutput of this) {};
};


/**
 * Define an asynchronous flow of execution such that the evaluation of
 * statement i is guaranteed to occur before statement j for all i < j.
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


/**
 * Define a standardized sequence of Blocks statements, ensuring that each
 * statement is equipped with an `execute` method.
 *
 * @param {Array<object>} statements A non-standardized sequence of statements.
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
