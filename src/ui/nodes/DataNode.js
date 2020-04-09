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
    id,
    type,
    index,
    midPoint,
    connected,
    targetType,
    targetId
  } = target.data();
  let invalidConnection = true;

  if (type === 'main') {
    NodeStore.main[id].connectors.push(this.id);
    invalidConnection = false;
  } else if (type === 'connector' && targetType === 'operation' && !connected) {
      NodeStore[targetType][targetId].options.argv[index] = this.id;
      target.data('connected', true);
      invalidConnection = false;
  } else if (['block', 'conditional', 'loop'].indexOf(type) !== -1 &&
             NodeStore[type][id].scope.indexOf(this.id) === -1) {
    NodeStore[type][id].scope.push(this.id);
    invalidConnection = false;
  }

  if (invalidConnection) {
    cy.remove(edge);
  }
};
