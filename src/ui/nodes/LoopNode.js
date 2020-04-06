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

  this.midPoint = cy.add([{
    group : 'nodes',
    data : {
      id : `${this.id}_C`,
      targetId : this.id,
      targetType : 'loop',
      midPoint : true,
      type : 'connector'
    },
    position : this.getOffsetPosition(0, -50),
    classes : [ 'connector' ]
  }, {
    group: 'edges',
    data : {
      source : `${this.id}_C`,
      target : this.id
    }
  }]);

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
