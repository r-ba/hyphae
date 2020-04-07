/**
 * A lookup table mapping types to their respective objects.
 */
const NodeTypes = {
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
  data : {},
  operation : {},
  block : {},
  conditional : {},
  loop : {},
  set : function(type, options) {
    if (type !== 'set' && this.hasOwnProperty(type)) {
      const { position, value } = options;
      const node = new NodeTypes[type](position, value);
      this[type][node.id] = node;
    } else {
      console.error(`${type} is not a valid Node type`);
    }
  },
  del : function(type, id) {
    // To-do
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
  const r = radii.length;

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
    index,
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
    NodeStore[targetType][targetId].addConnector();
    cy.getElementById(sourceId).data('handleable', false);
  }

  return isSuccessfulConnection;
};


/**
 * A lookup table mapping operation symbols to their required number arguments.
 */
const operatorArity = {
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
