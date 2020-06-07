"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../utils");
const queries_1 = __importDefault(require("../utils/queries"));
const guards_1 = __importDefault(require("../utils/guards"));
const selectors_1 = __importDefault(require("../utils/selectors"));
const isStatementUsingVariableOnlyInMostNestedAwait = (node, variables) => {
    const allVariableUses = queries_1.default.getVariableUses(node, variables).length;
    const allVariableUsesInAwaitExpressions = queries_1.default.getVariableUsesInAwaitExpressions(node, variables).length;
    const lowestLevelAwaitExpressions = queries_1.default.getLowestLevelAwaitExpressions(node);
    const variableUsesInLowestAwaitExpressions = lowestLevelAwaitExpressions.reduce((count, awaitExpr) => count + queries_1.default.getVariableUses(awaitExpr, variables).length, 0);
    return (allVariableUses === allVariableUsesInAwaitExpressions &&
        variableUsesInLowestAwaitExpressions === allVariableUsesInAwaitExpressions);
};
const rule = {
    meta: {
        messages: {
            avoidTrivialAwait: 'Use Promise.then',
        },
    },
    create: function (context) {
        const getDeclaredAsyncVariables = (node) => {
            const asyncDeclarators = node.declarations.filter(queries_1.default.hasAwait);
            const asyncVariables = asyncDeclarators.map(decl => context.getDeclaredVariables(decl));
            return utils_1.flatten(asyncVariables).map(({ name }) => name);
        };
        const isTrivialStatement = (currentStatement, idx, array) => {
            const restBody = array.slice(idx + 1);
            const [nextStatement, restStatements] = utils_1.safeHeadAndTail(restBody);
            if (!nextStatement || !guards_1.default.isVariableDeclaration(currentStatement))
                return true;
            const variables = getDeclaredAsyncVariables(currentStatement);
            const isNextStatementInvalid = queries_1.default.hasAwait(nextStatement)
                ? !isStatementUsingVariableOnlyInMostNestedAwait(nextStatement, variables)
                : !guards_1.default.isReturnStatement(nextStatement) &&
                    queries_1.default.isNodeUsingVariable(nextStatement, variables);
            const isAnyRestStatementInvalid = restStatements.some(node => queries_1.default.isNodeUsingVariable(node, variables));
            return !isNextStatementInvalid && !isAnyRestStatementInvalid;
        };
        return {
            [selectors_1.default.blockStatementOfAsyncFunction]: (node) => {
                // selector guarantees that node is a BlockStatement
                const blockStatementNode = node;
                if (blockStatementNode.body.every(isTrivialStatement)) {
                    context.report({ node, messageId: 'avoidTrivialAwait' });
                }
            },
        };
    },
};
exports.default = rule;
