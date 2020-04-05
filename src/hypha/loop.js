import Block from './block.js';
import Operations from './operations.js';

/**
 * Emulate a while loop.
 *
 * @param {Block} parent The enclosing Block statement.
 * @param {Array<object>=} statements The body of the loop.
 * @param {Array<object>=} conditions The execution conditions.
 */
function LoopBlock(parent, statements=[], conditions=[]) {
  this.body = new Block(parent, {}, statements);
  this.conditions = conditions;
}


/**
 * Continuously execute a body of statements until at least one condition
 * evaluates to false.
 */
LoopBlock.prototype.execute = async function() {
  while (await this.checkCondition()) this.body.execute();
};


/**
 * Evaluate a logical AND of the sequence of conditions.
 */
LoopBlock.prototype.checkCondition = async function() {
  for (const { f, argv } of this.conditions) {
    if (!Operations[f](...this.body.collect(argv))) {
      return false;
    }
  }
  return true;
};


/**
 * Check whether a given Block is an ancestor of this.
 *
 * @param {Block} block The potential ancestor.
 * @return {boolean}
 */
LoopBlock.prototype.isDescendantOf = function(block) {
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
LoopBlock.prototype.insertStatement = function(index, statement) {
  this.body.insertStatement(index, statement);
};


/**
 * Delete a statement at the specified index.
 *
 * @param {number} index
 */
LoopBlock.prototype.deleteStatement = function(index) {
  this.body.deleteStatement(index);
};


/**
 * Insert a condition at the specified index.
 *
 * @param {number} index
 * @param {object} condition
 */
LoopBlock.prototype.insertCondition = function(index, condition) {
  this.conditions.splice(index, 1, condition);
};


/**
 * Delete a condition at the specified index.
 *
 * @param {number} index
 */
LoopBlock.prototype.deleteCondition = function(index) {
  this.conditions.splice(index, 1);
};


export default LoopBlock;
