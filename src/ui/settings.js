const container = document.getElementById('cy');
const cy = cytoscape({
  container: container,
  zoomingEnabled: true,
  minZoom: 0.1,
  maxZoom: 10,
  style: cytoscape.stylesheet()
    .selector('node')
      .css({
        'background-fit': 'cover',
        'border-color': '#000000',
        'background-color': '#333',
        'border-width': 6,
        'border-opacity': 0.3,
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
        'width': 250,
        'background-color': '#222',
        'opacity': 0.3
      })
    .selector('.data')
      .css({
        'height': 25,
        'width': 25
      })
    .selector('.operation')
      .css({
        'background-image': encodeSVG(disk),
        'color' : 'grey',
        'height': 40,
        'width': 40
      })
    .selector('.block')
      .css({
        'background-image': encodeSVG(square),
        'height': 40,
        'width': 40,
        'cursor' : 'pointer'
      })
    .selector('.conditional')
      .css({
        'background-image': encodeSVG(triangle),
        'height': 40,
        'width': 40
      })
    .selector('.loop')
      .css({
        'background-image': encodeSVG(circle),
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


// Helper fn: used as ctxmenu selector
const createNode = (type, center, angle) => {
  const { x, y } = center;
  const a = 2 * Math.PI;
  const position = {
    x : x - 200 * Math.cos(angle * a),
    y : y - 200 * Math.sin(angle * a)
  }

  NodeStore.set(type, position);
};


/*
   A circular, swipeable context menu extension
   https://github.com/cytoscape/cytoscape.js-cxtmenu
*/
cy.cxtmenu({
  menuRadius: 100, // the radius of the circular menu in pixels
  selector: '.main', // elements matching this Cytoscape.js selector will trigger cxtmenus
  commands: [
    {
      fillColor: 'rgba(42,42,42,0.50)',
      content : '',
      select: ele => createNode('data', ele.position(), 0.15)//7.1)
    },
    {
      fillColor: 'rgba(42,42,42,0.50)',
      content : ctxSVG(disk, -2.5, 2.5),
      select: ele => createNode('operation', ele.position(), 0.95)
    },
    {
      fillColor: 'rgba(42,42,42,0.50)',
      content : ctxSVG(square, 0, 5),
      select: ele => createNode('block', ele.position(), 0.749)
    },
    {
      fillColor: 'rgba(42,42,42,0.50)',
      content : ctxSVG(triangle, 2.5, 0),
      select: ele => createNode('conditional', ele.position(), 0.55)
    },
    {
      fillColor: 'rgba(42,42,42,0.50)',
      content : ctxSVG(circle, 0, 0),
      select: ele => createNode('loop', ele.position(), 0.35)
    },
  ],
  activeFillColor: 'rgba(12, 12, 12, 0.75)', // the colour used to indicate the selected command
  activePadding: 20, // additional size in pixels for the active command
  indicatorSize: 24, // the size in pixels of the pointer to the active command
  separatorWidth: 3, // the empty spacing in pixels between successive commands
  spotlightPadding: 4, // extra spacing in pixels between the element and the spotlight
  minSpotlightRadius: 24, // the minimum radius in pixels of the spotlight
  maxSpotlightRadius: 38, // the maximum radius in pixels of the spotlight
  openMenuEvents: 'cxttapstart taphold', // space-separated cytoscape events that will open the menu; only `cxttapstart` and/or `taphold` work here
  zIndex: 9999, // the z-index of the ui div
});
