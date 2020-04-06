/**
 * Conditional type UI node.
 *
 * @param {object} position The location to render the node.
 */
function ConditionalNode(position) {
  Node.call(this, 'conditional', position);

  this.hyphaeInstance = new ConditionalBlock(null);
  this.connectors = [];
  this.addConnector();
}

// Inherit Node methods
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
  const {
    type,
    index,
    midPoint,
    connected,
    targetType,
    targetId
  } = target.data();
  let invalidConnection = true;

  if (type === 'connector' && !connected && targetId !== this.id) {
    if (targetType === 'block') {
      if (!NodeStore[targetType][targetId].hyphaeInstance.isDescendantOf(this.hyphaeInstance)) {
        this.hyphaeInstance.body.defineParent(NodeStore[targetType][targetId].hyphaeInstance);
        NodeStore[targetType][targetId].addConnector();
        cy.getElementById(this.id).data('handleable', false);
        target.data('connected', true);
        invalidConnection = false;
      }

    } else if (!midPoint) {
      if (targetType === 'conditional' || targetType === 'loop') {
        if (!NodeStore[targetType][targetId].hyphaeInstance.body.isDescendantOf(this.hyphaeInstance.body)) {
          this.hyphaeInstance.body.defineParent(NodeStore[targetType][targetId].hyphaeInstance.body);
          NodeStore[targetType][targetId].addConnector();
          cy.getElementById(this.id).data('handleable', false);
          target.data('connected', true);
          invalidConnection = false;
        }
      }
    }
  }

  if (invalidConnection) {
    cy.remove(edge);
  }
};
