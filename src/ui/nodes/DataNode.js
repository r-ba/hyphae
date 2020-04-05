/**
 * Data type UI node.
 *
 * @param {object} position The location to render the node.
 */
function DataNode(position, value) {
  Node.call(this, 'data', position);

  this.value = value;
}


/* Inherit from Node */
DataNode.prototype = Object.create(Node.prototype);
DataNode.prototype.constructor = DataNode;


/**
 * Setup the appropriate logic between this node and some target node.
 *
 * @param {object} target The Cytoscape target node.
 * @param {object} edge The added Cytoscape edge object.
 */
DataNode.prototype.connectNode = function(target, edge) {
  const {
    type,
    index,
    connected,
    targetType,
    targetId
  } = target.data();
  let invalidConnection = true;

  if (type === 'connector' && !connected) {
    if (targetType === 'operation') {
      NodeStore[targetType][targetId].options.argv[index] = this.id;
      target.data('connected', true);
      invalidConnection = false;
    } else if (targetType === 'block' || targetType === 'loop') {
      if (NodeStore[targetType][targetId].scope.indexOf(this.id) === -1) {
        NodeStore[targetType][targetId].scope.push(this.id);
        NodeStore[targetType][targetId].addConnector();
        target.data('connected', true);
        invalidConnection = false;
      }
    }
  }

  if (invalidConnection) {
    cy.remove(edge);
  }
};
