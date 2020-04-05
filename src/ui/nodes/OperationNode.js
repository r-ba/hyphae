/**
 * Operation type UI node.
 *
 * @param {object} position The location to render the node.
 */
function OperationNode(position, f) {
  Node.call(this, 'operation', position);

  this.defineOperation(f);
}


/* Inherit from Node */
OperationNode.prototype = Object.create(Node.prototype);
OperationNode.prototype.constructor = OperationNode;


/**
 * Setup options and add connector nodes with respect to the operation's arity.
 *
 * @param {string} f The function symbol.
 */
OperationNode.prototype.defineOperation = function(f) {
  const arity = operatorArity[f];
  this.options = {
    f : f,
    argv : Array(arity).fill(''),
    to : ''
  };

  const nodes = [], edges = [];
  for (let i = 0; i < arity; i++) {
    const id = `${this.id}-C${i}`;
    nodes.push({
      data : {
        id : id,
        index : i,
        targetId : this.id,
        targetType : 'operation',
        connected : false,
        handleable : false,
        type : 'connector'
      },
      position : this.getOffsetPosition(50 - 50 * i, -75),
      classes : [ 'connector' ]
    });
    edges.push({
      data : {
        source : id,
        target : this.id
      }
    });
  }

  cy.add({
    nodes : nodes,
    edges : edges
  });
};
