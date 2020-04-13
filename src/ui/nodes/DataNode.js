import {
  NodeStore,
  highlightNode
} from './index.js';
import Node from './Node.js';


/**
 * Data type UI node.
 *
 * @param {object} position The location to render the node.
 */
function DataNode(position) {
  Node.call(this, 'data', position, false);

  this.value = 0;

  const input = this.cyInstance.popper({
    content : () => {
      const inputEl = document.createElement('input');
      inputEl.type = "number";
      inputEl.value = 0;
      inputEl.classList.add('hidden');
      inputEl.classList.add('node-input');
      document.body.appendChild(inputEl);

      return inputEl;
    },
    popper : {
      placement : 'right',
    }
  });

  this.popper = input.popper;
  this.popper.oninput = event => {
    const inputValue = Number(event.target.value);
    if (inputValue) {
      this.value = inputValue;
    } else {
      this.popper.value = this.value;
    }
  };

  const update = () => input.scheduleUpdate();
  this.cyInstance.on('position', update);
  cy.on('pan zoom resize', update);
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
      highlightNode(target, false);
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


export default DataNode;
