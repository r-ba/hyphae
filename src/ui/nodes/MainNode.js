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
  this.main = new Block();
  this.isValidated = false;

  const { x, y } = position;
  const spawnTypes = [];
  for (const type of ['data', 'operation', 'block', 'conditional', 'loop']) {
    spawnTypes.push(cy.add({
      group : 'nodes',
      grabbable : false,
      data : {
        type : type
      },
      position : {
        x : x,
        y : y
      },
      classes: [ 'spawn', `spawn_${type}` ]
    }));
  }

  const steps = [-2, 0, 2, 4, 6];
  positionConnectors([250], { x, y }, spawnTypes, steps);
}


/**
 * Collect data, validate subtrees, and set corresponding Hypha object properties.
 */
MainNode.prototype.compile = async function() {
  const scope = {};
  let statementIndex = 0;
  let successStatus = false;

  for (const connector of this.connectors) {
    const { type, id } = cy.getElementById(connector).data()

    if (type === 'data') {
      scope[id] = NodeStore[type][id].value;
    } else {
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
