/**
 * Block type UI node.
 *
 * @param {object} position The location to render the node.
 */
function BlockNode(position) {
  Node.call(this, 'block', position);

  this.hyphaeInstance = new Block();
  this.connectors = [];
  this.addConnector();
}


/* Inherit from Node */
BlockNode.prototype = Object.create(Node.prototype);
BlockNode.prototype.constructor = BlockNode;


/**
 * Add a connector-type node to the UI:
 * Used to permit incoming edges from other Node objects.
 */
BlockNode.prototype.addConnector = function() {
  const numConnectors = this.connectors.length;
  const id = `${this.id}-C${numConnectors}`;

  const connector = cy.add({
    nodes : [
      {
        data : {
          id : id,
          index : numConnectors,
          parentId : this.id,
          parentType : 'block',
          connected : false,
          handleable : false,
          type : 'connector'
        },
        position : this.getOffsetPosition(0, -75), // To-do: make this positioning intelligent
        classes : [ 'connector' ]
      }
    ],

    edges : [
      {
        data : {
          source : id,
          target : this.id
        }
      }
    ]
  });

  this.connectors.push(connector);
};
