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


/**
 * Setup the appropriate logic between this node and some source node, if applicable.
 *
 * @param {object} target The Cytoscape target node.
 * @param {object} edge The added Cytoscape edge object added.
 */
OperationNode.prototype.connectNode = function(target, edge) {
  const {
    id,
    type,
    index,
    midPoint,
    connected,
    targetType,
    targetId
  } = target.data();
  let invalidConnection = true;

  if (type === 'data') {
    const { to } = this.options;
    if (to !== '' && to !== id) {
      cy.remove(`edge[source="${this.id}"][target="${this.options.to}"]`);
    }
    if (to !== id) invalidConnection = false;
    this.options.to = id;
  } else if (type === 'connector' && !connected) {
    if (targetType === 'block') {
      const statement = NodeStore[targetType][targetId].statements[index];
      if (statement === undefined) {
        NodeStore[targetType][targetId].statements.splice(index, 1, this.id);
        NodeStore[targetType][targetId].addConnector();
        target.data('connected', true);
        invalidConnection = false;
      }
    } else if (midPoint) {
      if (targetType === 'conditional') {
        NodeStore[targetType][targetId].conditions.splice(index, 1, this.id);
        target.data('connected', true);
        invalidConnection = false;
      } else if (targetType === 'loop') {
        if (NodeStore[targetType][targetId].conditions.indexOf(this.id) === -1) {
          NodeStore[targetType][targetId].conditions.push(this.id);
          invalidConnection = false;
        }
      }
    } else {
      if (targetType === 'conditional' || targetType === 'loop') {
        NodeStore[targetType][targetId].statements.splice(index, 1, this.id);
        NodeStore[targetType][targetId].addConnector();
        target.data('connected', true);
        invalidConnection = false;
      }
    }
  }

  if (invalidConnection) {
    cy.remove(edge);
  }
};
