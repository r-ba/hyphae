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

  const connector = cy.add({
    nodes : [
      {
        data : {
          id : id,
          index : numConnectors,
          targetId : this.id,
          targetType : 'block',
          connected : false,
          handleable : false,
          type : 'connector'
        },
        position : this.getOffsetPosition(0, -75), // To-do: make this positioning intelligent
        classes : [ 'connector' ]
      }
    ],
    edges : [
      {
        data : {
          source : id,
          target : this.id
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
BlockNode.prototype.connectNode = function(target, edge) {
  const {
    id,
    type,
    index,
    connected,
    targetType,
    targetId
  } = target.data();
  let invalidConnection = true;

  if (type === 'connector' && !connected && targetId !== this.id) {
    if (targetType === 'block') {
      if (!NodeStore[targetType][targetId].hyphaeInstance.isDescendantOf(this.hyphaeInstance)) {
        this.hyphaeInstance.defineParent(NodeStore[targetType][targetId].hyphaeInstance);
        NodeStore[targetType][targetId].statements.splice(index, 0, this.id);
        NodeStore[targetType][targetId].addConnector();
        cy.getElementById(this.id).data('handleable', false);
        invalidConnection = false;
      }
    }
    // To-do: Handle `conditional` and `loop` connections
    // else if (targetType === 'conditional') {
    //
    // } else if (targetType === 'loop') {
    //
    // }
  }

  if (invalidConnection) {
    cy.remove(edge);
  }
};
