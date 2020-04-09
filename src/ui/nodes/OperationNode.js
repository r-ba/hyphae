import {
  NodeStore,
  positionConnectors,
  highlightNode,
  operatorArity
} from './index.js';
import Node from './Node.js';


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

  if (type === 'main') {
    NodeStore.main[id].connectors.push(this.id);
    invalidConnection = false;
  } else if (type === 'data') {
    const { to } = this.options;
    if (to !== '' && to !== id) {
      cy.remove(`edge[source="${this.id}"][target="${this.options.to}"]`);
    }
    if (to !== id) invalidConnection = false;
    this.options.to = id;
    highlightNode(this.cyInstance, false);
  } else if (type === 'connector' && !connected) {
    if (targetType === 'block') {
      target.data('connected', true);
      invalidConnection = false;
    } else if (midPoint) {
      if (this.options.to === '') this.options.to = this.id;
      if (targetType === 'conditional') {
        target.data('connected', true);
        invalidConnection = false;
      } else if (targetType === 'loop') {
        if (edge.target().edgesWith(this.cyInstance).length < 2) {
          invalidConnection = false;
        }
      }
      highlightNode(target, false);
    } else {
      if (targetType === 'conditional' || targetType === 'loop') {
        highlightNode(target, false);
        target.data('connected', true);
        invalidConnection = false;
      }
    }
  }

  if (invalidConnection) {
    cy.remove(edge);
  }
};


/**
 * Validate argv, and to option properties.
 *
 * @return {boolean} Return true iff validation succeeded.
 */
OperationNode.prototype.compile = async function() {
  if (this.options.to) {
    let successStatus = true;
    for (let i = 0; i < this.options.argv.length; i++) {
      if (this.options.argv[i] === '') {
        const connector = cy.getElementById(`${this.id}-C${i}`);
        highlightNode(connector, true);
        successStatus = false;
      }
    }
    return successStatus;
  } else {
    highlightNode(this.cyInstance, true);
    return false;
  }
};


export default OperationNode;
