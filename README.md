# hyphae

*A computational playground*

## Development notes

### Block
`Block.statements` is an array of objects. A statement may be one of the following:
- An object containing a function name `f`, an array of parameter name(s) `argv`, and an output name `to`
- A `Block`, `ConditionalBlock`, or `LoopBlock`

#### Block.prototype.assign
- Does the origin parameter encapsulate the most useful behaviour?
- Should there be an optional "depth" parameter to specify where we want to declare a new variable?
- How do we handle, in the UI, the creation of new variables?

#### Block.prototype.execute
Since we pass the output of each statement back to the body of this for..of loop, how might we leverage this setup to introduce the behaviour of a "pipe"? Or, should we simply override this method in defining a `FunctionBlock`?

### LoopBlock

There is a potential issue with the current design. The arguments to the conditions being checked need to exist outside of the body of the loop. Furthermore, consider the following scenario: suppose the loop has the condition `i<j`, where `i` exists outside the loop and the body increments `i`. If `i` happens to be within the scope of the block incrementing it then the loop will never halt.

---

Any "program" should necessarily consist of at least one root Block `main`, such that, each subsequently Block defined is a descendant of `main`.

Before attempting to execute `main`, the tree of Block objects should be traversed to ensure that each object has a valid configuration (e.g. each `ConditionalBlock` has n statements and n-1 conditions).

Due to the fact that `Block` objects use the `parent` and setting their prototype, complications can arise when trying to create a new object which inherits from `Block`. It may be advantageous to setup an alternative scoping mechanism which avoids this altogether.

---

#### To-do:
- Create `FunctionBlock` and `DataBlock` hypha objects
- Benchmark performance: compare `__proto__` with `Object.getPrototypeOf`, and `Object.setPrototypeOf`
- Should there be a `BlockStore` map such that, in the case of a `Block` statement internal to a Block's sequence of statements, we craft a new object with an execute method that looks up the current instance of a Block and executes it?
- Fix mocha esm issue (`npm run test` works if `test:module` is removed from package.json)
- Setup CI (dependant on mocha fix)
- Flesh out unit test coverage
- Build a reduced version of Cytoscape
- Split up `ui/settings`
- Make `BlockNode` positioning intelligent, potentially utilizing a force-directed layout extension
- Setup `src/ui` to be exported into `src/index.js` for rollup
