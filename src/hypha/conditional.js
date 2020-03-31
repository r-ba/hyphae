import Operations from './operations.js';


function ConditionalBlock(parent, statements=[], conditions=[]) {
  this.parent = parent;
  this.statements = statements;
  this.conditions = conditions;
};


ConditionalBlock.prototype.execute = async function() {
  for await (const statement of this) {};
};


ConditionalBlock.prototype[Symbol.asyncIterator] = function() {
  let last = this.conditions.length;
  let current = -1;

  return {
    next : async () => {
      current += 1;
      if (current < last) {
        const { f, argv } = this.conditions[current];
        if (Operations[f](...this.parent.collect(argv))) {
          return Promise.resolve({
            value : await this.statements[current].execute(),
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
          value : await this.statements[current].execute(),
          done : true
        });
      }
    }
  };
};


export default ConditionalBlock;
