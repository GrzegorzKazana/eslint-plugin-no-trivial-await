import type { Node, VariableDeclaration, ReturnStatement } from 'estree';

import { NodeTypes } from './selectors';

const isVariableDeclaration = (node: Node): node is VariableDeclaration =>
    node.type === NodeTypes.VariableDeclaration;

const isReturnStatement = (node: Node): node is ReturnStatement =>
    node.type === NodeTypes.ReturnStatement;

export default {
    isVariableDeclaration,
    isReturnStatement,
};
