/**
 * Operation type UI node.
 *
 * @param {object} position The location to render the node.
 */
function OperationNode(position, options) {
  Node.call(this, 'operation', position);

  this.options = options; // { f, argv, to }
}


/* Inherit from Node */
OperationNode.prototype = Object.create(Node.prototype);
OperationNode.prototype.constructor = OperationNode;
