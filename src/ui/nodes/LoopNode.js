/**
 * Loop type UI node.
 *
 * @param {object} position The location to render the node.
 */
function LoopNode(position) {
  Node.call(this, 'loop', position);

  this.hyphaeInstance = new LoopBlock();
  this.connectors = [];

  const { x, y } = this.cyInstance.position();

  this.midPoint = cy.add([{
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
  }, {
    group: 'edges',
    data : {
      source : `${this.id}_C`,
      target : this.id
    }
  }]);

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
    NodeStore.main[targetData.id].connectors.push(this.id);
    cy.getElementById(this.id).data('handleable', false);
  } else if (connectNode(target.data(), this.id, this.hyphaeInstance.body)) {
    target.data('connected', true);
  } else {
    cy.remove(edge);
  }
};
