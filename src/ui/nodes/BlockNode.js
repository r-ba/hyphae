import { Block } from '../../hypha/index.js';
import {
  NodeStore,
  positionConnectors,
  connectNode,
  highlightNode
} from './index.js';
import Node from './Node.js';


/**
 * Block type UI node.
 *
 * @param {object} position The location to render the node.
 */
function BlockNode(position) {
  Node.call(this, 'block', position);

  this.hyphaeInstance = new Block();
  this.scope = [];
  this.connectors = [];
  this.addConnector();
}


/* Inherit from Node */
BlockNode.prototype = Object.create(Node.prototype);
BlockNode.prototype.constructor = BlockNode;


/**
 * Add a connector-type node to the UI:
 * Used to permit incoming edges from other Node objects.
 */
BlockNode.prototype.addConnector = function() {
  const numConnectors = this.connectors.length;
  const id = `${this.id}-C${numConnectors}`;
  const { x, y } = this.cyInstance.position();

  const connector = cy.add({
    group : 'nodes',
    data : {
      id : id,
      index : numConnectors,
      targetId : this.id,
      targetType : 'block',
      connected : false,
      type : 'connector'
    },
    position : {
      x : x,
      y : y
    },
    classes : [ 'connector' ]
  });

  cy.add({
    group : 'edges',
    data : {
      source : id,
      target : this.id
    }
  });

  this.connectors.push(connector);
  positionConnectors([100], { x, y }, this.connectors);
};


/**
 * Setup the appropriate logic between this node and some target node, if applicable.
 *
 * @param {object} target The Cytoscape target node.
 * @param {object} edge The Cytoscape edge object added.
 */
BlockNode.prototype.connectNode = function(target, edge) {
  const targetData = target.data();
  if (targetData.type === 'main') {
    this.hyphaeInstance.defineParent(NodeStore.main[targetData.id].main);
    NodeStore.main[targetData.id].connectors.push(this.id);
    cy.getElementById(this.id).data('handleable', false);
  } else if (connectNode(targetData, this.id, this.hyphaeInstance)) {
    highlightNode(target, false);
    target.data('connected', true);
  } else {
    cy.remove(edge);
  }
};


/**
 * Collect data, validate subtrees, and set corresponding Hypha object properties.
 *
 * @return {boolean} Return true iff compilation succeeded.
 */
BlockNode.prototype.compile = async function() {
  const scope = {};
  let statementIndex = 0;
  let successStatus = true; // Permit empty blocks

  // Collect scoped values
  for (const id of this.scope) {
    scope[id] = NodeStore.data[id].value;
  }
  this.hyphaeInstance.scope = scope;

  // Collect and verify operation, and block-like statements
  for (const connector of this.connectors) {
    const { connected } = connector.data();

    if (connected) { // Ignore empty connectors
      const { type, id } = connector.incomers('node').data();
      successStatus = await NodeStore[type][id].compile();
      if (successStatus) {
        let statement;
        if (type === 'operation') {
          statement = NodeStore[type][id].options;
        } else {
          statement = NodeStore[type][id].hyphaeInstance;
        }
        this.hyphaeInstance.insertStatement(statementIndex++, statement);
      } else {
        break;
      }
    }
  }

  return successStatus;
};


export default BlockNode;
