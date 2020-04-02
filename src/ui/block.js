// To-do : Much of the code should be abstracted to a base `Node` class
//         that LoopNode, etc may inherit from

/**
 *
 */
function BlockNode(position) {

  // Add instance to local store
  nodeStore.blocks.push(this);

  // Generate unique id
  this.id = generateId();

  // Create corresponding Cytoscape node instance
  this.cyInstance = cy.add({
    group : 'nodes',
    data : {
      id : this.id,
      handle : 1,
      type : 'block'
    },
    position : position,
    classes : [ 'block' ],
  });

  // Create corresponding Hyphae instance
  this.hyphaeInstance = new Block();

  this.connectors = [];
  this.addConnector();
}


/**
 *
 */
BlockNode.prototype.getOffsetPosition = function(x0, y0) {
  const { x, y } = this.cyInstance.position();
  return {
    x : x - x0,
    y : y - y0
  };
};


/**
 *
 */
BlockNode.prototype.addConnector = function() {
  const connectorCount = this.connectors.length;
  const id = `${this.id}_conn${connectorCount}`;

  const connector = cy.add({
    nodes : [
      {
        data : {
          id : id,
          handle : 0,
          parent : this.id,
          type : 'connector'
        },
        position : this.getOffsetPosition(0, -75),
        classes : [ 'connector' ]
      }
    ],

    edges : [
      {
        data : {
          id : `${id}_edge`,
          source : id,
          target : this.id
        }
      }
    ]
  });

  this.connectors.push(connector);
};
