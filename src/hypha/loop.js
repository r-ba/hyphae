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


export default LoopBlock;
