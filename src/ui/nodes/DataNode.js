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
