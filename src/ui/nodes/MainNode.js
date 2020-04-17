import { Block } from '../../hypha/index.js';
import { NodeStore } from './index.js';


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
  this.connectors = [];
  this.isValidated = false;
  this.main = new Block();
}


/**
 * Collect data, validate subtrees, and set corresponding Hypha object properties.
 */
MainNode.prototype.compile = async function() {
  const scope = {};
  let statementIndex = 0;
  let successStatus = false;

  for (const DataNode of Object.values(NodeStore.data)) {
    scope[DataNode.id] = DataNode.value;
  }

  for (const connector of this.connectors) {
    const { type, id } = cy.getElementById(connector).data()

    successStatus = await NodeStore[type][id].compile();
    if (successStatus) {
      let statement;
      if (type === 'operation') {
        statement = NodeStore[type][id].options;
      } else {
        statement = NodeStore[type][id].hyphaeInstance;
      }
      this.main.insertStatement(statementIndex++, statement);
    } else {
      break;
    }
  }

  this.main.scope = scope;
  this.isValidated = successStatus;
};


/**
 * Execute the Main block iff it's been successfully compiled.
 */
MainNode.prototype.execute = async function() {
  if (this.isValidated) {
    await this.main.execute();
  }
};


export default MainNode;
