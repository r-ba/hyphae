/**
 * Block type UI node.
 *
 * @param {object} position The location to render the node.
 */
function BlockNode(position) {
  Node.call(this, 'block', position);

  this.hyphaeInstance = new Block();
  this.scope = [];
  this.statements = [];
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
        this.hyphaeInstance.defineParent(NodeStore[targetType][targetId].hyphaeInstance);
        NodeStore[targetType][targetId].statements.splice(index, 1, this.id);
        NodeStore[targetType][targetId].addConnector();
        cy.getElementById(this.id).data('handleable', false);
        target.data('connected', true);
        invalidConnection = false;
      }

    } else if (!midPoint) {
      if (targetType === 'conditional' || targetType === 'loop') {
        if (!NodeStore[targetType][targetId].hyphaeInstance.isDescendantOf(this.hyphaeInstance)) {
          this.hyphaeInstance.defineParent(NodeStore[targetType][targetId].hyphaeInstance.body);
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
