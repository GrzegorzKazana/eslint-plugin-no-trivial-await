"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const esquery_1 = __importDefault(require("esquery"));
const utils_1 = require("../utils");
const isVariableDeclarationAwaitedDeclarator = node => node.type === 'VariableDeclaration' &&
    node.declarations.some(declarator => esquery_1.default(declarator, 'AwaitExpression').length > 0);
const isExpressionStatementWithAwait = node => node.type === 'ExpressionStatement' &&
    esquery_1.default(node.expression, 'AwaitExpression').length > 0;
const chunkByDeclarationsOrExpressionsWithAwait = utils_1.chunkBy(utils_1.or(isVariableDeclarationAwaitedDeclarator, isExpressionStatementWithAwait));
const getDeclaredAwaitedVariables = (context, node) => node.type === 'VariableDeclaration'
    ? utils_1.flatMap(declarator => context.getDeclaredVariables(declarator))(node.declarations.filter(declarator => esquery_1.default(declarator, 'AwaitExpression').length > 0))
    : [];
const d = [1, 2, 3].flatMap(x => [-x, x]);
exports.default = {
    meta: {
        messages: {
            avoidTrivialAwait: 'Use Promise.then',
        },
    },
    create: function (context) {
        return {
            ':function[async=true] BlockStatement': node => {
                if (esquery_1.default(node, 'AwaitExpression:not(ReturnStatement AwaitExpression)').length === 0) {
                    context.report({ node, messageId: 'avoidTrivialAwait' });
                }
                const bodySplitByAwaitDeclarationsOrExpressions = chunkByDeclarationsOrExpressionsWithAwait(node.body);
                const isInvalid = bodySplitByAwaitDeclarationsOrExpressions.every((chunk, idx, chunks) => {
                    const [declarationOrExpressionWithAwait, ...restChunk] = chunk;
                    const restChunks = chunks.slice(idx + 1);
                    const declaredAsyncVariableNames = getDeclaredAwaitedVariables(context, declarationOrExpressionWithAwait).map(({ name }) => name);
                    const variableNames = declaredAsyncVariableNames.join('|');
                    const restCode = {
                        type: 'BlockStatement',
                        body: utils_1.flatten(restChunks),
                    };
                    const isTrivial = variableNames &&
                        (restCode.body.length > 0 ||
                            restChunk.length > 0) &&
                        esquery_1.default(restCode, `Identifier[name=/${variableNames}/]:not(VariableDeclaration:first-child AwaitExpression Identifier)`).length === 0;
                    return isTrivial;
                });
                if (isInvalid) {
                    context.report({ node, messageId: 'avoidTrivialAwait' });
                }
            },
        };
    },
};
