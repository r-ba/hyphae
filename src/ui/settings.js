const container = document.querySelector('#cy');
const cy = cytoscape({
  container: container,
  style: cytoscape.stylesheet()
    .selector('node')
      .css({
        'background-fit': 'cover',
        'border-color': '#000000',
        'background-color': '#333',
        'border-width': 6,
        'border-opacity': 0.3,
        'label': ''
      })
    .selector('edge')
      .css({
        'curve-style': 'bezier',
        'line-color': 'grey',
        'width': 3
      })
    .selector('.main')
      .css({
        'height': 250,
        'width': 250
      })
    .selector('.data')
      .css({
        'height': 25,
        'width': 25
      })
    .selector('.operation')
      .css({
        'height': 25,
        'width': 25
      })
    .selector('.connector')
      .css({
        'height': 10,
        'width': 10,
      })
    .selector('.block')
      .css({
        'background-image': 'https://i.ibb.co/Wn0TdMM/block.png',
        'height': 40,
        'width': 40,
        'cursor' : 'pointer'
      })
    .selector('.if')
      .css({
        'background-image': 'https://i.ibb.co/gJqV51B/triangle.png',
        'height': 40,
        'width': 40
      })
    .selector('.loop')
      .css({
        'background-image': 'https://i.ibb.co/bPDxWYj/circle.png',
        'height': 40,
        'width': 40
      })
    .selector('.eh-handle')
      .css({
        'width': 10,
        'height': 10,
        'background-color': '#ffffff'
      })
})
.zoomingEnabled(false)
.panningEnabled(false);

// https://github.com/cytoscape/cytoscape.js-edgehandles
cy.edgehandles({
  preview: false,
  handleNodes: 'node[handle = 1]',
  noEdgeEventsInDraw: false,
  disableBrowserGestures: true,
  handlePosition: function( node ){
    return 'middle top';
  },
  // edgeParams: function( sourceNode, targetNode, i ){ // return element object to be passed to cy.add() for edge
  //   return {};
  // },
  complete: function( sourceNode, targetNode, addedEles ){ // fired when edgehandles is done and elements are added
    const targetType = targetNode.data().type;

    if (targetType !== 'connector') {
      cy.remove(addedEles);
    } else {
      
    }
  }
});
