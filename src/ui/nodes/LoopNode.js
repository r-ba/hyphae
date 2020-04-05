/**
 * Loop type UI node.
 *
 * @param {object} position The location to render the node.
 */
function LoopNode(position) {
  Node.call(this, 'loop', position);

  this.hyphaeInstance = new LoopBlock();
  this.scope = [];
  this.conditions = [];
  this.statements = [];
  this.connectors = [];

  cy.add({
    nodes : [{
      data : {
        id : `${this.id}_C`,
        targetId : this.id,
        targetType : 'loop',
        midPoint : true,
        type : 'connector'
      },
      position : this.getOffsetPosition(0, -50),
      classes : [ 'connector' ]
    }],
    edges : [{
      data : {
        source : `${this.id}_C`,
        target : this.id
      }
    }]
  });

  this.addConnector();
}

// Inherit Node methods
LoopNode.prototype = Object.create(Node.prototype);

// Set the constructor to return a BlockNode object
LoopNode.prototype.constructor = LoopNode;


/**
 * Add a connector-type node to the UI:
 * Used to permit incoming edges from other Node objects.
 */
LoopNode.prototype.addConnector = function() {
 const numConnectors = this.connectors.length;
 const statementId = `${this.id}_S${numConnectors}`;

  const connector = cy.add({
    nodes : [
      {
        data : {
          id : statementId,
          index : numConnectors,
          targetId : this.id,
          targetType : 'loop',
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
          source : statementId,
          target : `${this.id}_C`
        }
      }
    ]
  });

  this.connectors.push(connector);
};
