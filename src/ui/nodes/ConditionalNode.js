/**
 * Conditional type UI node.
 *
 * @param {object} position The location to render the node.
 */
function ConditionalNode(position) {
  Node.call(this, 'conditional', position);

  this.hyphaeInstance = new ConditionalBlock(null);
  this.scope = [];
  this.conditions = [];
  this.statements = [];
  this.connectors = [];
  this.addConnector();
}

// Inherit Node methods
ConditionalNode.prototype = Object.create(Node.prototype);

// Set the constructor to return a BlockNode object
ConditionalNode.prototype.constructor = ConditionalNode;


/**
 * Add a connector-type node to the UI:
 * Used to permit incoming edges from other Node objects.
 */
ConditionalNode.prototype.addConnector = function() {
 const numConnectors = this.connectors.length;
 const conditionalId = `${this.id}_C${numConnectors}`;
 const statementId = `${this.id}_S${numConnectors}`;

  const connector = cy.add({
    nodes : [
      {
        data : {
          id : conditionalId,
          index : numConnectors,
          targetId : this.id,
          targetType : 'conditional',
          connected : false,
          midPoint : true,
          type : 'connector'
        },
        position : this.getOffsetPosition(0, -50),
        classes : [ 'connector' ]
      },
      {
        data : {
          id : statementId,
          index : numConnectors,
          targetId : this.id,
          targetType : 'conditional',
          connected : false,
          midPoint : false,
          type : 'connector'
        },
        position : this.getOffsetPosition(0, -100),
        classes : [ 'connector' ]
      }
    ],

    edges : [
      {
        data : {
          source : conditionalId,
          target : this.id
        }
      },
      {
        data : {
          source : statementId,
          target : conditionalId
        }
      }
    ]
  });

  this.connectors.push(connector);
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
        NodeStore[targetType][targetId].statements.splice(index, 1, this.id);
        NodeStore[targetType][targetId].addConnector();
        cy.getElementById(this.id).data('handleable', false);
        target.data('connected', true);
        invalidConnection = false;
      }

    } else if (!midPoint) {
      if (targetType === 'conditional' || targetType === 'loop') {
        if (!NodeStore[targetType][targetId].hyphaeInstance.body.isDescendantOf(this.hyphaeInstance.body)) {
          this.hyphaeInstance.body.defineParent(NodeStore[targetType][targetId].hyphaeInstance.body);
          NodeStore[targetType][targetId].statements.splice(index, 1, this.id);
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