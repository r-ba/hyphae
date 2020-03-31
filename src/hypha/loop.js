import Block from './block.js';
import Operations from './operations.js';

function LoopBlock(parent, statements=[], conditions=[]) {
  this.body = new Block(parent, {}, statements);
  this.conditions = conditions;
};


LoopBlock.prototype.execute = async function() {
  while (await this.checkCondition()) this.body.execute();
};


LoopBlock.prototype.checkCondition = async function() {
  for (const { f, argv } of this.conditions) {
    if (!Operations[f](...this.body.collect(argv))) {
      return false;
    }
  }
  return true;
};


export default LoopBlock;
