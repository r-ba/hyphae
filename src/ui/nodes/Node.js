/**
 * Base class for Node type UI elements.
 *
 * @param {string} type The type of node to instantiate.
 * @param {object} position The location to render the node.
 */
function Node(type, position) {

  // Generate unique id
  this.id = generateId();

  // Add instance to local store
  NodeStore[type][this.id] = this;

  // Create corresponding Cytoscape node instance
  this.cyInstance = cy.add({
    group : 'nodes',
    data : {
      id : this.id,
      type : type,
      handleable : true
    },
    position : position,
    classes : [ type ],
  });

  this.connectors = [];

  // Setup cy-automove listener
  cy.automove({
    reposition: 'drag',
    nodesMatching: node => node.data().targetId === this.id ? true : false,
    dragWith: this.cyInstance
  });
}
