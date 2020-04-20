import MainNode from './MainNode.js';
import DataNode from './DataNode.js';
import OperationNode from './OperationNode.js';
import BlockNode from './BlockNode.js';
import ConditionalNode from './ConditionalNode.js';
import LoopNode from './LoopNode.js';


/**
 * A lookup table mapping types to their respective objects.
 */
const NodeTypes = {
  main : MainNode,
  data : DataNode,
  operation : OperationNode,
  block : BlockNode,
  conditional : ConditionalNode,
  loop : LoopNode
};


/**
 * A cache of all instantiated Node type objects.
 */
const NodeStore = {
  main : {},
  data : {},
  operation : {},
  block : {},
  conditional : {},
  loop : {},
  set : function(type, position, id) {
    if (Object.prototype.hasOwnProperty.call(NodeTypes, type)) {
      const node = new NodeTypes[type](position);
      this[type][node.id] = node;
      return node;
    } else {
      console.error(`${type} is not a valid Node type`);
    }
  },
  del : function(eleType, ele) {
    if (eleType === 'node') {
      const { id, type } = ele.data();
      if (Object.prototype.hasOwnProperty.call(NodeTypes, type) && this[type][id] !== undefined) {
        deleteNode(id, type, ele);
      } else {
        console.error(`Node ${id} does not exist in NodeStore[${type}]`);
      }
    } else if (eleType === 'edge') {
      deleteEdge(ele);
    } else {
      console.error(`${type} is not a valid type`);
    }
  }
};


/**
 * Radially space a sequence of connector nodes.
 *
 * @param {Array<number>} radii The radii to distance paired connectors.
 * @param {object} position The position of the connector's parent node.
 * @param {Array<object>} connectors
 */
const positionConnectors = (radii, position, connectors) => {
  const { x, y } = position;
  const n = connectors.length;
  const a = -1 * Math.PI / (2 * n);

  for (let i = 0; i < n; i++) {
    connectors[i].forEach((ele, j) => {
      const x0 = Math.cos((i + n/2 + 0.5) * a);
      const y0 = Math.sin((i + n/2 + 0.5) * a);
      ele.animate({
        position : {
          x : x - radii[j] * x0,
          y : y - radii[j] * y0
        }
      }, {
        duration : 750
      })
    });
  }
};


/**
 * Delete an edge and clean up.
 *
 * @param {object} ele The cytoscape edge to delete.
 */
function deleteEdge(ele) {
  const {
    type,
    id,
    targetId,
    targetType,
    index
  } = ele.target().data();

  if (type === 'connector') {
    if (targetType === 'operation') {
      NodeStore.operation[targetId].options.argv[index] = '';
      ele.target().data('connected', false);
    } else {
      const sourceId = ele.source().data().id;
      const sourceType = ele.source().data().type;
      if (sourceType !== 'operation' && sourceType !== 'connector') {
        ele.source().data('handleable', true);
        console.log(sourceType, sourceId);
        NodeStore[sourceType][sourceId].removeParent();
      }
      ele.target().data('connected', false);
    }
  } else if (type === 'data') {
      const sourceId = ele.source().data().id;
      NodeStore.operation[sourceId].options.to = '';
  } else if (type === 'main') {
    const sourceId = ele.source().data().id;
    const sourceType = ele.source().data().type;
    if (sourceType !== 'operation') {
      ele.source().data('handleable', true);
      NodeStore[sourceType][sourceId].removeParent();
    }
    const mainConnectors = NodeStore.main[id].connectors;
    mainConnectors.splice(mainConnectors.indexOf(sourceId), 1)
  }
  cy.remove(ele);
};


/**
 * Delete a node and clean up.
 *
 * @param {string} id The id of the node.
 * @param {string} type The type of node.
 * @param {object} ele The corresponding cytoscape node.
 */
function deleteNode(id, type, ele) {
  const node = NodeStore[type][id];
  ele.connectedEdges().forEach(edge => deleteEdge(edge));
  if (node.connectors) {
    node.connectors.forEach(connector => {
      connector.connectedEdges().forEach(edge => deleteEdge(edge));
      cy.remove(connector);
    });
    if (node.defaultConnector) {
      node.defaultConnector.connectedEdges().forEach(edge => deleteEdge(edge));
      cy.remove(node.defaultConnector);
    }
    if (node.midPoint) {
      node.midPoint.connectedEdges().forEach(edge => deleteEdge(edge));
      cy.remove(node.midPoint);
    }
  }
  if (type === 'operation' || type === 'data') {
    node.destroyPopper();
  }
  cy.remove(ele);
  delete NodeStore[type][id];
};


/**
 * Connect two blocks together, if permitted.
 *
 * @param {string} targetType
 * @param {string} targetId
 * @param {object} sourceBlock
 * @param {string} sourceId
 * @return {boolean} Return true iff the connection was successful.
 */
const connectNode = (targetData, sourceId, sourceBlock) => {
  const {
    type,
    midPoint,
    connected,
    targetType,
    targetId
  } = targetData;

  let isSuccessfulConnection = false;

  if (type === 'connector' && !connected && targetId !== sourceId) {
    if (targetType === 'block') {
      if (!NodeStore[targetType][targetId].hyphaeInstance.isDescendantOf(sourceBlock)) {
        sourceBlock.defineParent(NodeStore[targetType][targetId].hyphaeInstance);
        isSuccessfulConnection = true;
      }

    } else if (!midPoint) {
      if (targetType === 'conditional' || targetType === 'loop') {
        if (!NodeStore[targetType][targetId].hyphaeInstance.body.isDescendantOf(sourceBlock)) {
          sourceBlock.defineParent(NodeStore[targetType][targetId].hyphaeInstance.body);
          isSuccessfulConnection = true;
        }
      }
    }
  }

  if (isSuccessfulConnection) {
    cy.getElementById(sourceId).data('handleable', false);
  }

  return isSuccessfulConnection;
};


/**
 * Style a node so that it's appearance is "highlighted".
 *
 * @param {object} node The Cytoscape node to be styled.
 * @param {boolean} turnOn Highlight if true, else undo the style.
 */
const highlightNode = (node, turnOn) => {
  if (turnOn) {
    node.animate({
      style : {
        'border-color': '#ff0000'
      }
    }, {
      duration : 1000
    });
  } else {
    node.animate({
      style : {
        'border-color': '#000000'
      }
    }, {
      duration : 1000
    });
  }
};


/**
 * A lookup table mapping operation symbols to their required number arguments.
 */
const OperationArity = {
  // Arithmetical operators
  '+' : 2,
  '-' : 2,
  '*' : 2,
  '/' : 2,
  '**' : 2,
  '%' : 2,

  // Bitwise operators
  '^' : 2,
  '&' : 2,
  '|' : 2,
  '<<' : 2,
  '>>' : 2,
  '>>>' : 2,
  '~' : 1,

  // Logical operators
  '&&' : 2,
  '||' : 2,
  '!' : 1,

  // Comparison operators
  '==' : 2,
  '===' : 2,
  '!=' : 2,
  '!==' : 2,
  '<' : 2,
  '<=' : 2,
  '>' : 2,
  '>=' : 2,

  // Math library
  'abs' : 1,
  'floor' : 1,
  'max' : 2, // Can replace this with Infinity once proper infrastructure is in place
  'min' : 2, // Same note as `max`
};

export {
  NodeStore,
  OperationArity,
  positionConnectors,
  connectNode,
  highlightNode
};
