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
