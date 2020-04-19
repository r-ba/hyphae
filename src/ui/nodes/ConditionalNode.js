import { ConditionalBlock } from '../../hypha/index.js';
import {
  NodeStore,
  positionConnectors,
  connectNode,
  highlightNode
} from './index.js';
import Node from './Node.js';


/**
 * Conditional type UI node.
 *
 * @param {object} position The location to render the node.
 */
function ConditionalNode(position) {
  Node.call(this, 'conditional', position);

  this.hyphaeInstance = new ConditionalBlock(null);
  this.scope = [];
  this.connectors = [];
  this.addConnector();

  // Add default statement connector
  const { x, y } = this.cyInstance.position();

  this.defaultConnector = cy.add({
    group : 'nodes',
    data : {
      id : `${this.id}_D`,
      targetId : this.id,
      targetType : 'conditional',
      connected : false,
      midPoint : false,
      type : 'connector'
    },
    position : {
      x : x + 50,
      y : y
    },
    classes : [ 'connector' ]
  });

  cy.add({
    group : 'edges',
    data : {
      source : `${this.id}_D`,
      target : this.id,
      type : 'connector'
    }
  });
}


/* Inherit from Node */
ConditionalNode.prototype = Object.create(Node.prototype);
ConditionalNode.prototype.constructor = ConditionalNode;


/**
 * Add a connector-type node to the UI:
 * Used to permit incoming edges from other Node objects.
 */
ConditionalNode.prototype.addConnector = function() {
 const numConnectors = this.connectors.length;
 const conditionalId = `${this.id}_C${numConnectors}`;
 const statementId = `${this.id}_S${numConnectors}`;
 const { x, y } = this.cyInstance.position();

  const connector = cy.add([
    {
      group : 'nodes',
      data : {
        id : conditionalId,
        index : numConnectors,
        targetId : this.id,
        targetType : 'conditional',
        connected : false,
        midPoint : true,
        type : 'connector'
      },
      position : {
        x : x,
        y : y
      },
      classes : [ 'connector' ]
    },
    {
      group : 'nodes',
      data : {
        id : statementId,
        index : numConnectors,
        targetId : this.id,
        targetType : 'conditional',
        connected : false,
        midPoint : false,
        type : 'connector'
      },
      position : {
        x : x,
        y : y
      },
      classes : [ 'connector' ]
    }
  ]);

  cy.add([
    {
      group : 'edges',
      data : {
        source : conditionalId,
        target : this.id
      }
    },
    {
      group : 'edges',
      data : {
        source : statementId,
        target : conditionalId
      }
    }
  ]);

  this.connectors.push(connector);
  positionConnectors([50, 100], { x, y }, this.connectors);
};


/**
 * Setup the appropriate logic between this node and some source node, if applicable.
 *
 * @param {object} target The Cytoscape target node.
 * @param {object} edge The Cytoscape edge object added.
 */
ConditionalNode.prototype.connectNode = function(target, edge) {
  const targetData = target.data();
  if (targetData.type === 'main') {
    this.hyphaeInstance.body.defineParent(NodeStore.main[targetData.id].main);
    NodeStore.main[targetData.id].connectors.push(this.id);
    cy.getElementById(this.id).data('handleable', false);
  } else if (connectNode(targetData, this.id, this.hyphaeInstance.body)) {
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
ConditionalNode.prototype.compile = async function() {
  const scope = {};
  let index = 0;
  let successStatus = true;

  // Collect scoped values
  for (const id of this.scope) {
    scope[id] = NodeStore.data[id].value;
  }
  this.hyphaeInstance.body.scope = scope;

  for (const connectors of this.connectors) {
    const [ conditionalConnector, statementConnector ] = connectors.map(connector => connector);
    const conditionalData = conditionalConnector.data();
    const statementData = statementConnector.data();

    if (statementData.connected) {
      if (conditionalData.connected) {
        const condition = conditionalConnector.incomers('node[type!="connector"]').data();
        const isConditionValid = await NodeStore.operation[condition.id].compile();

        if (isConditionValid) {
          const { type, id } = statementConnector.incomers('node[type!="connector"]').data();
          const isStatementValid = await NodeStore[type][id].compile();

          if (isStatementValid) {
            this.hyphaeInstance.insertCondition(index, NodeStore.operation[condition.id].options);
            if (type === 'operation') {
              this.hyphaeInstance.insertStatement(index++, NodeStore[type][id].options);
            } else {
              this.hyphaeInstance.insertStatement(index++, NodeStore[type][id].hyphaeInstance);
            }
          } else {
            successStatus = false;
          }
        } else {
          successStatus = false;
        }
      } else {
        highlightNode(conditionalConnector, true);
        successStatus = false;
      }
    } else {
      if (!conditionalData.connected) {
        highlightNode(conditionalConnector, true);
      }
      highlightNode(statementConnector, true);
      successStatus = false;
    }
  }

  if (this.defaultConnector.data().connected) {
    const { type, id } = this.defaultConnector.incomers('node[type!="connector"]').data();
    const isStatementValid = await NodeStore[type][id].compile();
    if (isStatementValid) {
      if (type === 'operation') {
        this.hyphaeInstance.insertStatement(index, NodeStore[type][id].options);
      } else {
        this.hyphaeInstance.insertStatement(index, NodeStore[type][id].hyphaeInstance);
      }
    }
  }

  return successStatus;
};


export default ConditionalNode;
