/**
 * Main UI node.
 *
 * @param {object} position The location to render the node.
 */
function MainNode(position) {
  this.cyInstance = cy.add({
    group : 'nodes',
    data : {
      type : 'main'
    },
    grabbable : false,
    position : position,
    classes : [ 'main' ],
  });

  this.id = this.cyInstance.id();
}
