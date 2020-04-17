import {
  NodeStore,
  OperationArity
} from './ui/nodes/index.js';
import Operations from './hypha/operations.js';

NodeStore.fns = Operations;
NodeStore.arity = OperationArity;

export default NodeStore;
