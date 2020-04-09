import { LoopBlock } from '../../hypha/index.js';
import {
  NodeStore,
  positionConnectors,
  connectNode,
  highlightNode
} from './index.js';
import Node from './Node.js';


/**
 * Loop type UI node.
 *
 * @param {object} position The location to render the node.
 */
function LoopNode(position) {
  Node.call(this, 'loop', position);

  this.hyphaeInstance = new LoopBlock();
  this.scope = [];
  this.connectors = [];

  const { x, y } = this.cyInstance.position();

  this.midPoint = cy.add({
    group : 'nodes',
    data : {
      id : `${this.id}_C`,
      targetId : this.id,
      targetType : 'loop',
      midPoint : true,
      type : 'connector'
    },
    position : {
      x : x,
      y : y + 50
    },
    classes : [ 'connector' ]
  });

  cy.add({
    group: 'edges',
    data : {
      source : `${this.id}_C`,
      target : this.id
    }
  });

  this.addConnector();
}


/* Inherit from Node */
LoopNode.prototype = Object.create(Node.prototype);
LoopNode.prototype.constructor = LoopNode;


/**
 * Add a connector-type node to the UI:
 * Used to permit incoming edges from other Node objects.
 */
LoopNode.prototype.addConnector = function() {
 const numConnectors = this.connectors.length;
 const statementId = `${this.id}_S${numConnectors}`;
 const { x, y } = this.midPoint.position();

  const connector = cy.add({
    group : 'nodes',
    data : {
      id : statementId,
      index : numConnectors,
      targetId : this.id,
      targetType : 'loop',
      connected : false,
      midPoint : false,
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
      source : statementId,
      target : `${this.id}_C`
    }
  });

  this.connectors.push(connector);
  positionConnectors([50], { x, y }, this.connectors);
};


/**
 * Setup the appropriate logic between this node and some source node, if applicable.
 *
 * @param {object} target The Cytoscape target node.
 * @param {object} edge The Cytoscape edge object added.
 */
LoopNode.prototype.connectNode = function(target, edge) {
  const targetData = target.data();
  if (targetData.type === 'main') {
    this.hyphaeInstance.body.defineParent(NodeStore.main[targetData.id].main);
    NodeStore.main[targetData.id].connectors.push(this.id);
    cy.getElementById(this.id).data('handleable', false);
  } else if (connectNode(target.data(), this.id, this.hyphaeInstance.body)) {
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
LoopNode.prototype.compile = async function() {
  const scope = {};
  let statementIndex = 0;
  let successStatus = true;

  // Collect scoped values
  for (const id of this.scope) {
    scope[id] = NodeStore.data[id].value;
  }
  this.hyphaeInstance.body.scope = scope;

  const conditions = this.midPoint.incomers('node[type!="connector"]');
  const statements = this.connectors
    .map(connector => connector.incomers('node[type!="connector"]'))
    .filter(source => source.length > 0);

  const hasConditions = conditions.length > 0;
  const hasStatements = statements.length > 0;

  // Collect and validate conditionals and block statements
  if (hasConditions && hasStatements) {

    let conditionIndex = 0;
    for (const condition of conditions) {
      const { type, id } = condition.data();

      const conditionValid = await NodeStore[type][id].compile();
      if (conditionValid) {
        this.hyphaeInstance.insertCondition(conditionIndex++, NodeStore[type][id].options);
      } else {
        successStatus = false;
        break;
      }

    }

    if (successStatus) {
      // conditions compilation succeeded -> compile statements
      let statementIndex = 0;
      for (const statement of statements) {
        const { type, id } = statement.data();

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

  } else {
    if (!hasStatements) {
      this.connectors.forEach(connector => highlightNode(connector, true));
    }

    if (!hasConditions) {
      highlightNode(this.midPoint, true);
    }
  }

  return successStatus;
};


export default LoopNode;
