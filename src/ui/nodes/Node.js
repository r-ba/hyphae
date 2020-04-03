/**
 * Base class for Node type UI elements.
 *
 * @param {string} type The type of node to instantiate.
 * @param {object} position The location to render the node.
 */
function Node(type, position) {

  // Add instance to local store
  nodeStore[type].push(this); // This might be unnecessary -- to be determined

  // Generate unique id
  this.id = generateId();

  // Create corresponding Cytoscape node instance
  this.cyInstance = cy.add({
    group : 'nodes',
    data : {
      id : this.id,
      type : type
    },
    position : position,
    classes : [ type ],
  });

  /*
   After inheriting from this class:
   Extended classes instantiate corresponding Hyphae object, and
   adjoin the required "connector" nodes
  */
}


/**
 * Return the position of the node offset by the specified coordinates.
 *
 * @param {number} x0 The x-coordinate to offset the position by.
 * @param {number} y0 The y-coordinate to offset the position by.
 * @return {object}
 */
Node.prototype.getOffsetPosition = function(x0, y0) {
  const { x, y } = this.cyInstance.position();
  return {
    x : x - x0,
    y : y - y0
  };
};
