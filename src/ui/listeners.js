cy.on('click', '.block', function(event) {
  console.log(event.target.id());
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
