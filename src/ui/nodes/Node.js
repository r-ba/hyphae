/**
 * Base class for Node type UI elements.
 *
 * @param {string} type The type of node to instantiate.
 * @param {object} position The location to render the node.
 */
function Node(type, position, enableAutomove = true) {
  // Create corresponding Cytoscape node instance
  this.cyInstance = cy.add({
    group : 'nodes',
    data : {
      type : type,
      handleable : true
    },
    position : position,
    classes : [ type ],
  });

  this.id = this.cyInstance.id();

  // Setup cy-automove listener, if enabled
  if (enableAutomove) {
    cy.automove({
      reposition: 'drag',
      nodesMatching: node => node.data().targetId === this.id ? true : false,
      dragWith: this.cyInstance
    });
  }
}


/**
 * Check if this Node has already been connected to a given Node.
 *
 * @param {string} id The Node id being checked against.
 * @return {boolean} True iff a connection exists.
 */
Node.prototype.hasConnection = function(id) {
  let count = 0;
  for (const connector of this.connectors) {
    for (const node of connector.neighbourhood(`node[id != "${this.id}"]`)) {
      if (node.id() === id) count += 1;
      if (count > 1) return true;
    }
  }
  return false;
};


export default Node;
