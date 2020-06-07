export enum NodeTypes {
    AwaitExpression = 'AwaitExpression',
    VariableDeclaration = 'VariableDeclaration',
    ReturnStatement = 'ReturnStatement',
    Identifier = 'Identifier',
    BlockStatement = 'BlockStatement',
}

const blockStatementOfAsyncFunction = `:function[async=true] > ${NodeTypes.BlockStatement}`;

const lowestLevelAwaitExpressions = `${NodeTypes.AwaitExpression}:not(
    ${NodeTypes.AwaitExpression}:has(${NodeTypes.AwaitExpression} ${NodeTypes.AwaitExpression}))`;

const variableIdentifier = (variables: string[]) =>
    `${NodeTypes.Identifier}[name=/${variables.join('|')}/]`;

const variableUsesInAwaitExpressions = (variables: string[]) =>
    `${NodeTypes.AwaitExpression} ${variableIdentifier(variables)}`;

export default {
    blockStatementOfAsyncFunction,
    lowestLevelAwaitExpressions,
    variableIdentifier,
    variableUsesInAwaitExpressions,
};
