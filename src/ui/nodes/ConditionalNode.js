/**
 * Conditional type UI node.
 *
 * @param {object} position The location to render the node.
 */
function ConditionalNode(position) {
  Node.call(this, 'conditional', position);

  this.hyphaeInstance = new ConditionalBlock(null);
  this.scope = [];
  this.conditions = [];
  this.statements = [];
  this.connectors = [];
  this.addConnector();
}

// Inherit Node methods
ConditionalNode.prototype = Object.create(Node.prototype);

// Set the constructor to return a BlockNode object
ConditionalNode.prototype.constructor = ConditionalNode;
