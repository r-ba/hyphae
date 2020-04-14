import Operations from './operations.js';

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
  this.statements = [];
  this.defineStatements(statements);
  this.pipe = () => null;
}


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
};


/**
 * Evaluate a sequence of statements with respect to their ordering.
 */
Block.prototype.execute = async function() {
  for await (let output of this) {} // eslint-disable-line
};


/**
 * Evaluate the next statement in the sequence.
 *
 * @param {number} current The current statements index.
 * @param {number} last The total number of statements.
 */
Block.prototype.executeNext = async function(current, last) {
  if (current < last) {
    const value = this.statements[current].execute();
    this.pipe(value);
    
    return Promise.resolve({
      value : value,
      done : false
    });
  } else {
    return Promise.resolve({ done : true });
  }
};


/**
 * Define an asynchronous flow of execution such that the evaluation of
 * statement i is guaranteed to occur before statement j for all i < j.
 */
Block.prototype[Symbol.asyncIterator] = function() {
  let last = this.statements.length;
  let current = 0;

  return {
    next: async () => {
      return await this.executeNext(current++, last);
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
    return this.standardizeStatement(statement);
  });
};


/**
 * Standardize a non-Block statement.
 *
 * @param {object} statement A non-standardized statement.
 */
Block.prototype.standardizeStatement = function(statement) {
  if (Object.keys(Object.getPrototypeOf(statement)).length) {
    return statement;
  } else {
    const execute = async () => {
      const { f, argv, to } = statement;
      let output = Operations[f](...this.collect(argv));
      this.assign(to, output);
      return output;
    };

    return {
      execute : execute.bind(this)
    };
  }
};


/**
 * Insert a statement at the specified index.
 *
 * @param {number} index
 * @param {object} statement
 */
Block.prototype.insertStatement = function(index, statement) {
  this.statements.splice(index, 1, this.standardizeStatement(statement));
};


/**
 * Delete a statement at the specified index.
 *
 * @param {number} index
 */
Block.prototype.deleteStatement = function(index) {
  this.statements.splice(index, 1);
};


/**
 * Define an instance's encapsulating Block.
 *
 * @param {Block} parent
 */
Block.prototype.defineParent = function(parent) {
  Object.setPrototypeOf(this, parent);
};


/**
 * Check whether a given Block is an ancestor of this.
 *
 * @param {Block} block The potential ancestor.
 * @return {boolean}
 */
Block.prototype.isDescendantOf = function(block) {
  let ancestor = Object.getPrototypeOf(this);
  while (ancestor !== null) {
    if (ancestor === block) {
      return true;
    }
    ancestor = Object.getPrototypeOf(ancestor);
  }
  return false;
};


/**
 * Setup a function to exfiltrate output with.
 *
 * @param {function} pipe
 */
Block.prototype.definePipe = function(pipe) {
  if (typeof pipe === 'function') {
    this.pipe = pipe;
  } else {
    console.error(`definePipe error: ${pipe} is not function`);
  }
};


export default Block;
