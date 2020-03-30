/*
 * Emulate a block statement
 */
function Block(parent, scope, statements) {
  if (parent)
    this.__proto__ = parent;
  this.scope = scope || {};
  this.statements = statements || [];
};

// What does "statements" look like? How should it behave?

/*
 *
 */
Block.prototype.get = function(property) {
  if (!this.scope)
    return undefined;
  else {
    if (property in this.scope)
      return this.scope[property];
    else return this.__proto__.get(property);
  }
};


/*
 *  Notes:
 *        - Does the origin parameter encapsulate the most useful behaviour?
 *        - Should there be an optional "depth" parameter to specify where
 *          we want to declare a new variable?
 *        - How do we handle, in the UI, the creation of new variables?
 */
Block.prototype.assign = function(property, value, origin) {
  if (!this.scope)
    origin.scope[property] = value;
  else {
    if (property in this.scope)
      this.scope[property] = value;
    else
      this.__proto__.assign(property, value, origin || this);
  }
};
