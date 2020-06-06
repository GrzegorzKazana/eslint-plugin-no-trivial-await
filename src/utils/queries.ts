import type { Node, AwaitExpression } from 'estree';
import esquery from 'esquery';

import selectors, { NodeTypes } from './selectors';

const hasAwait = (node: Node) => esquery(node, NodeTypes.AwaitExpression).length > 0;

const getLowestLevelAwaitExpressions = (node: Node) =>
    esquery(node, selectors.lowestLevelAwaitExpressions) as AwaitExpression[];

const getVariableUses = (node: Node, variables: string[]) =>
    esquery(node, selectors.variableIdentifier(variables));

const getVariableUsesInAwaitExpressions = (node: Node, variables: string[]) =>
    esquery(node, selectors.variableUsesInAwaitExpressions(variables));

const isNodeUsingVariable = (node: Node, variables: string[]) =>
    getVariableUses(node, variables).length > 0;

export default {
    hasAwait,
    getLowestLevelAwaitExpressions,
    getVariableUsesInAwaitExpressions,
    getVariableUses,
    isNodeUsingVariable,
};
