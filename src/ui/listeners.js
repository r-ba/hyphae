cy.on('click', '.spawn', function(event) {
  const { type } = event.target.data();
  const { x, y } = event.target.position();
  const options = {
    position : { x, y }
  };
  if (type === 'data') options.value = 0;
  else if (type === 'operation') options.value = '+';
  NodeStore.set(type, options);
});

cy.on('click', '.block', function(event) {
  NodeStore.block[event.target.id()].addConnector();
});

cy.on('click', '.conditional', function(event) {
  NodeStore.conditional[event.target.id()].addConnector();
});

cy.on('click', '.loop', function(event) {
  NodeStore.loop[event.target.id()].addConnector();
});

cy.on('click', '.connector', function(event) {
  console.log(event.target.id());
});

cy.on('mouseover', 'node', function(event) {
  container.style.cursor = 'pointer';
});

cy.on('mouseout', 'node', function(event) {
  container.style.cursor = 'default';
});
