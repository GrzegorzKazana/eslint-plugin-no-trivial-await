"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NodeTypes = void 0;
var NodeTypes;
(function (NodeTypes) {
    NodeTypes["AwaitExpression"] = "AwaitExpression";
    NodeTypes["VariableDeclaration"] = "VariableDeclaration";
    NodeTypes["ReturnStatement"] = "ReturnStatement";
    NodeTypes["Identifier"] = "Identifier";
    NodeTypes["BlockStatement"] = "BlockStatement";
})(NodeTypes = exports.NodeTypes || (exports.NodeTypes = {}));
const blockStatementOfAsyncFunction = `:function[async=true] > ${NodeTypes.BlockStatement}`;
const lowestLevelAwaitExpressions = `${NodeTypes.AwaitExpression}:not(
    ${NodeTypes.AwaitExpression}:has(${NodeTypes.AwaitExpression} ${NodeTypes.AwaitExpression}))`;
const variableIdentifier = (variables) => `${NodeTypes.Identifier}[name=/${variables.join('|')}/]`;
const variableUsesInAwaitExpressions = (variables) => `${NodeTypes.AwaitExpression} ${variableIdentifier(variables)}`;
exports.default = {
    blockStatementOfAsyncFunction,
    lowestLevelAwaitExpressions,
    variableIdentifier,
    variableUsesInAwaitExpressions,
};
