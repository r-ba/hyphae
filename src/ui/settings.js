const container = document.getElementById('cy');
const cy = cytoscape({
  container: container,
  zoomingEnabled: false,
  panningEnabled: false,
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
    .selector('.connector')
      .css({
        'height': 10,
        'width': 10,
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
        'background-image': disk,
        'height': 40,
        'width': 40
      })
    .selector('.block')
      .css({
        'background-image': square,
        'height': 40,
        'width': 40,
        'cursor' : 'pointer'
      })
    .selector('.conditional')
      .css({
        'background-image': triangle,
        'height': 40,
        'width': 40
      })
    .selector('.loop')
      .css({
        'background-image': circle,
        'height': 40,
        'width': 40
      })
    .selector('.eh-handle')
      .css({
        'width': 10,
        'height': 10,
        'background-color': '#ffffff'
      })
});


/*
   Edge creation ui extension configuration
   https://github.com/cytoscape/cytoscape.js-edgehandles
*/
cy.edgehandles({
  preview: false,
  handleNodes: 'node[?handleable]',
  noEdgeEventsInDraw: false,
  disableBrowserGestures: true,
  handlePosition: function(node){
    return 'middle top';
  },
  complete: function(sourceNode, targetNode, addedEles){
    const { type, id } = sourceNode.data();
    NodeStore[type][id].connectNode(targetNode, addedEles);
  }
});
