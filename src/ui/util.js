/*
 * Used as ctyoscape-ctxmenu `select` function
 */
// eslint-disable-next-line no-unused-vars
const createNode = (type, center, angle) => {
  const { x, y } = center;
  const a = 2 * Math.PI;
  const position = {
    x : x - 200 * Math.cos(angle * a),
    y : y - 200 * Math.sin(angle * a)
  }

  NodeStore.set(type, position);
};


/**
 * Flag an element for deletion.
 *
 * @param {object} ele A cytoscape element.
 */
// eslint-disable-next-line no-unused-vars
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
}


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
}


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
}


// Helper fn for cytoscape node images
// eslint-disable-next-line no-unused-vars
function encodeSVG(svg) {
  return 'data:image/svg+xml;utf8,' + encodeURIComponent(
    `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
      <!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">
      <svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
       x="0px" y="0px" width="200px" height="200px" viewBox="0 0 200 200" enable-background="new 0 0 200 200"
       xml:space="preserve">  <image id="image0" width="200" height="200" x="0" y="0" ${svg}`);
}


// Helper fn for cytoscape-ctxmenu icons
// eslint-disable-next-line no-unused-vars
function ctxSVG(svg, x = 0, y = 0) {
  return `<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
           x="0px" y="0px" width="50px" height="50px" viewBox="0 0 50 50" enable-background="new 0 0 200 200"
           xml:space="preserve">  <image id="image0" width="50" height="50" x="${x}" y="${y}" ${svg}`;
}
