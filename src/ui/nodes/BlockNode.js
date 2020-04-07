/**
 * Block type UI node.
 *
 * @param {object} position The location to render the node.
 */
function BlockNode(position) {
  Node.call(this, 'block', position);

  this.hyphaeInstance = new Block();
  this.connectors = [];
  this.addConnector();
}


/* Inherit from Node */
BlockNode.prototype = Object.create(Node.prototype);
BlockNode.prototype.constructor = BlockNode;


/**
 * Add a connector-type node to the UI:
 * Used to permit incoming edges from other Node objects.
 */
BlockNode.prototype.addConnector = function() {
  const numConnectors = this.connectors.length;
  const id = `${this.id}-C${numConnectors}`;
  const { x, y } = this.cyInstance.position();

  const connector = cy.add({
    group : 'nodes',
    data : {
      id : id,
      index : numConnectors,
      targetId : this.id,
      targetType : 'block',
      connected : false,
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
      source : id,
      target : this.id
    }
  });

  this.connectors.push(connector);
  positionConnectors([100], { x, y }, this.connectors);
};


/**
 * Setup the appropriate logic between this node and some target node, if applicable.
 *
 * @param {object} target The Cytoscape target node.
 * @param {object} edge The Cytoscape edge object added.
 */
BlockNode.prototype.connectNode = function(target, edge) {
  if (connectNode(target.data(), this.id, this.hyphaeInstance)) {
    target.data('connected', true);
  } else {
    cy.remove(edge);
  }
};
