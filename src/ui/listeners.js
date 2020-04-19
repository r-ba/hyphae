let keycodes = {
  'D' : 68,
  'SHIFT' : 16
};
let shiftKeyDown = false;

cy.on('click', '.main', async function(event) {
  // const id = event.target.id();
  // const main = NodeStore.main[id];
  // await main.compile();
  // await main.execute();
});

cy.on('click', '.data', function(event) {
  const ele = event.target;
  if (shiftKeyDown) {
    select(ele);
  } else {
    NodeStore.data[ele.id()].popper.classList.toggle('hidden');
  }
});

cy.on('click', '.operation', function(event) {
  const ele = event.target;
  if (shiftKeyDown) {
    select(ele);
  } else {
    NodeStore.operation[ele.id()].popper.classList.toggle('hidden');
  }
});

cy.on('click', '.block', function(event) {
  const ele = event.target;
  if (shiftKeyDown) {
    select(ele);
  } else {
    NodeStore.block[ele.id()].addConnector();
  }
});

cy.on('click', '.conditional', function(event) {
  const ele = event.target;
  if (shiftKeyDown) {
    select(ele);
  } else {
    NodeStore.conditional[ele.id()].addConnector();
  }
});

cy.on('click', '.loop', function(event) {
  const ele = event.target;
  if (shiftKeyDown) {
    select(ele);
  } else {
    NodeStore.loop[ele.id()].addConnector();
  }
});

cy.on('click', 'edge', function(event) {
  const ele = event.target;
  if (shiftKeyDown) {
    select(ele);
  }
});

cy.on('mouseover', 'node', function(event) {
  container.style.cursor = 'pointer';
});

cy.on('mouseout', 'node', function(event) {
  container.style.cursor = 'default';
});

document.addEventListener('keydown', function(event) {
  if (event.keyCode === keycodes.D) {
    const flaggedEles = cy.elements().filter(function(ele) {
      return ele.data().isSelected;
    });

    flaggedEles.forEach(ele => {
      if (ele.isEdge()) {
        NodeStore.del('edge', ele);
      }
    });

    flaggedEles.forEach(ele => {
      if (ele.isNode()) {
        NodeStore.del('node', ele);
      }
    });
  } else if (event.keyCode === keycodes.SHIFT) {
    shiftKeyDown = true;
  }
});

document.addEventListener('keyup', function(event) {
  if (event.keyCode === keycodes.SHIFT) {
    shiftKeyDown = false;
  }
});


/* Helper functions: */

/**
 * Flag an element for deletion.
 *
 * @param {object} ele A cytoscape element.
 */
function select(ele) {
  if (isSelectable(ele)) {
    const { isSelected } = ele.data();
    if (isSelected === true) {
      highlightEle(ele, false);
      ele.data('isSelected', false);
    } else {
      highlightEle(ele, true);
      ele.data('isSelected', true);
    }
  }
};


/**
 * Determine if a node or edge can be "selected" for deletion.
 *
 * @param {object} ele A cytoscape element.
 */
function isSelectable(ele) {
  if (ele.isEdge()) {
    const { type } = ele.data();
    if (type !== 'connection') return false;
  } else {
    const { type } = ele.data();
    if (type === 'main') {
      return false;
    } else if (type === 'connector') {
      return false;
    }
  }
  return true;
};


/**
 * Style a node so that it's appearance is "highlighted".
 *
 * @param {object} node The Cytoscape node to be styled.
 * @param {boolean} turnOn Highlight if true, else undo the style.
 */
function highlightEle(ele, turnOn) {
  if (turnOn) {
    if (ele.isEdge()) {
      ele.style({ 'line-color': '#00ffdd', 'opacity': '0.3' });
    } else {
      ele.style({ 'border-color': '#00ffdd' });
    }
  } else {
    if (ele.isEdge()) {
      ele.style({ 'line-color': 'grey', 'opacity': '1' });
    } else {
      ele.style({ 'border-color': '#000000' });
    }
  }
};
