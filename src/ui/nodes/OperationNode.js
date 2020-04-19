import {
  NodeStore,
  positionConnectors,
  highlightNode
} from './index.js';
import Node from './Node.js';


/**
 * Operation type UI node.
 *
 * @param {object} position The location to render the node.
 */
function OperationNode(position) {
  Node.call(this, 'operation', position);

  this.connectors = [];
  this.options = {
    f : undefined,
    argv : undefined,
    to : ''
  };
  this.defineOperation('+');

  const select = this.cyInstance.popper({
    content : () => {
      const selectEl = document.createElement('select');
      selectEl.classList.add('hidden');
      selectEl.classList.add('node-input');

      for (const opSymbol of Object.keys(NodeStore.fns)) {
        const optionEl = document.createElement('option');
        optionEl.value = opSymbol;
        optionEl.innerText = opSymbol;
        selectEl.appendChild(optionEl);
      }

      document.body.appendChild(selectEl);

      return selectEl;
    },
    popper : {
      placement : 'right',
    }
  });

  this.popper = select.popper;

  this.popper.onchange = event => {
    this.defineOperation(event.target.value);
  };

  const update = () => select.scheduleUpdate();
  this.cyInstance.on('position', update);
  cy.on('pan zoom resize', update);
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

  // Clean up old connectors & options
  for (const connector of this.connectors) {
    cy.remove(connector);
  }
  this.connectors = [];

  const arity = NodeStore.arity[f];
  this.options.f = f;
  this.options.argv = Array(arity).fill('');

  // Setup new connectors
  const { x, y } = this.cyInstance.position();
  for (let i = 0; i < arity; i++) {
    const id = `${this.id}-C${i}`;
    this.connectors.push(cy.add({
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
        target : this.id,
        type : 'connector'
      }
    });
  }

  positionConnectors([100], { x, y }, this.connectors);
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
    midPoint,
    connected,
    targetType
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
  let successStatus = true;
  for (let i = 0; i < this.options.argv.length; i++) {
    if (this.options.argv[i] === '') {
      const connector = cy.getElementById(`${this.id}-C${i}`);
      highlightNode(connector, true);
      successStatus = false;
    }
  }
  return successStatus;
};


export default OperationNode;
