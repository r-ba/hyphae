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
  const { x, y } = this.cyInstance.position();

  const nodes = [];
  for (let i = 0; i < arity; i++) {
    const id = `${this.id}-C${i}`;
    nodes.push(cy.add({
      group : 'nodes',
      data : {
        id : id,
        index : i,
        targetId : this.id,
        targetType : 'operation',
        connected : false,
        type : 'connector'
      },
      position : {
        x : x,
        y : y
      },
      classes : [ 'connector' ]
    }));

    cy.add({
      group : 'edges',
      data : {
        source : id,
        target : this.id
      }
    });
  }

  positionConnectors([100], { x, y }, nodes);
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
      NodeStore[targetType][targetId].addConnector();
      target.data('connected', true);
      invalidConnection = false;
    } else if (midPoint) {
      if (targetType === 'conditional') {
        target.data('connected', true);
        invalidConnection = false;
      } else if (targetType === 'loop') {
        if (edge.target().edgesWith(this.cyInstance).length < 2) {
          invalidConnection = false;
        }
      }
    } else {
      if (targetType === 'conditional' || targetType === 'loop') {
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
