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
    NodeStore.main[targetData.id].connectors.push(this.id);
    cy.getElementById(this.id).data('handleable', false);
  } else if (connectNode(targetData, this.id, this.hyphaeInstance.body)) {
    target.data('connected', true);
  } else {
    cy.remove(edge);
  }
};
