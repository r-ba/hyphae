import Block from './block.js';
import Operations from './operations.js';

/**
 * Emulate a conditional statement.
 *
 * @param {Block} parent The enclosing Block statement.
 * @param {Array<Block>=} statements A sequence of n Block-like statements.
 * @param {Array<object>=} conditions A sequence of n-1 conditional statements.
 */
function ConditionalBlock(parent, statements=[], conditions=[]) {
  this.body = new Block(parent, {}, statements);
  this.conditions = conditions;
}


/**
 * Execute the first statement whose corresponding condition evaulates to true.
 */
ConditionalBlock.prototype.execute = async function() {
  for await (const output of this) {} // eslint-disable-line
};


/**
 * Define an asynchronous flow of execution such that the potential evaluation
 * of statement i is guaranteed to occur before statement j for all i < j.
 */
ConditionalBlock.prototype[Symbol.asyncIterator] = function() {
  let last = this.conditions.length;
  let lastStatement = this.body.statements.length;
  let current = -1;

  return {
    next : async () => {
      current += 1;
      if (current < last) {
        const { f, argv } = this.conditions[current];
        if (Operations[f](...this.body.collect(argv))) {
          return Promise.resolve({
            value : await this.body.executeNext(current, lastStatement),
            done : true
          });
        } else {
          return Promise.resolve({
            vaue : undefined,
            done : false
          });
        }
      } else {
        return Promise.resolve({
          value : await this.body.executeNext(current, lastStatement),
          done : true
        });
      }
    }
  };
};


/**
 * Check whether a given Block is an ancestor of this.
 *
 * @param {Block} block The potential ancestor.
 * @return {boolean}
 */
ConditionalBlock.prototype.isDescendantOf = function(block) {
  let ancestor = Object.getPrototypeOf(this.body);
  while (ancestor !== null) {
    if (ancestor === block) {
      return true;
    }
    ancestor = Object.getPrototypeOf(ancestor);
  }
  return false;
};


/**
 * Insert a statement at the specified index.
 *
 * @param {number} index
 * @param {object} statement
 */
ConditionalBlock.prototype.insertStatement = function(index, statement) {
  this.body.insertStatement(index, statement);
};


/**
 * Delete a statement at the specified index.
 *
 * @param {number} index
 */
ConditionalBlock.prototype.deleteStatement = function(index) {
  this.body.deleteStatement(index);
};


/**
 * Insert a condition at the specified index.
 *
 * @param {number} index
 * @param {object} condition
 */
ConditionalBlock.prototype.insertCondition = function(index, condition) {
  this.conditions.splice(index, 1, condition);
};


/**
 * Delete a condition at the specified index.
 *
 * @param {number} index
 */
ConditionalBlock.prototype.deleteCondition = function(index) {
  this.conditions.splice(index, 1);
};


/**
 * Setup a function to exfiltrate output with.
 *
 * @param {function} pipe
 */
ConditionalBlock.prototype.definePipe = function(pipe) {
  if (typeof pipe === 'function') {
    this.body.pipe = pipe;
  } else {
    console.error(`definePipe error: ${pipe} is not function`);
  }
};


export default ConditionalBlock;
