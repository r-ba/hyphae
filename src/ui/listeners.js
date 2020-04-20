let keycodes = {
  'D' : 68,
  'SHIFT' : 16
};
let shiftKeyDown = false;

cy.on('click', '.main', async function(event) {
  const id = event.target.id();
  const main = NodeStore.main[id];
  await main.compile();
  await main.execute();
});

cy.on('click', '.data', function(event) {
  const ele = event.target;
  if (shiftKeyDown) {
    select(ele);
  } else {
    NodeStore.data[ele.id()].input.popper.classList.toggle('hidden');
  }
});

cy.on('click', '.operation', function(event) {
  const ele = event.target;
  if (shiftKeyDown) {
    select(ele);
  } else {
    NodeStore.operation[ele.id()].select.popper.classList.toggle('hidden');
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
