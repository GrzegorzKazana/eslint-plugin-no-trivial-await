"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const esquery_1 = __importDefault(require("esquery"));
const utils_1 = require("../utils");
const isAsyncDeclarator = (node) => esquery_1.default(node, 'AwaitExpression').length > 0;
const isAsyncVariableDeclaration = (node) => node.type === 'VariableDeclaration' &&
    node.declarations.some(isAsyncDeclarator);
const isExpressionStatementWithAwait = (node) => node.type === 'ExpressionStatement' &&
    esquery_1.default(node.expression, 'AwaitExpression').length > 0;
const isTopLevelAwaitStatement = utils_1.or(isAsyncVariableDeclaration, isExpressionStatementWithAwait);
const chunkByTopLevelAwaitStatements = utils_1.chunkBy(isTopLevelAwaitStatement);
const getDeclaredAsyncVariables = (context, node) => {
    if (node.type !== 'VariableDeclaration')
        return [];
    const asyncDeclarators = node.declarations.filter(isAsyncDeclarator);
    const asyncVariables = asyncDeclarators.map(decl => context.getDeclaredVariables(decl));
    return utils_1.flatten(asyncVariables).map(({ name }) => name);
};
const hasAnyAwaitExcludingReturnStatement = (node) => esquery_1.default(node, 'AwaitExpression:not(ReturnStatement AwaitExpression)')
    .length > 0;
const isNotUsingVariablesExceptFirstAwaitedExpression = (node, variables) => {
    const variablesUnion = variables.join('|');
    const isIdentifierInAwaitExpression = 'AwaitExpression Identifier';
    const isIdentifierInFirstDeclaration = `VariableDeclaration:first-child ${isIdentifierInAwaitExpression}`;
    const isIdentifierInFirstExpressionStatement = `ExpressionStatement:first-child ${isIdentifierInAwaitExpression}`;
    const query = `Identifier[name=/${variablesUnion}/]:not(${isIdentifierInFirstDeclaration}):not(${isIdentifierInFirstExpressionStatement})`;
    return esquery_1.default(node, query).length === 0;
};
const rule = {
    meta: {
        messages: {
            avoidTrivialAwait: 'Use Promise.then',
        },
    },
    create: function (context) {
        const isChunkTrivial = (chunk, chunkIdx, chunks) => {
            const [declarationOrExpressionWithAwait, ...restChunk] = chunk;
            const restChunks = chunks.slice(chunkIdx + 1);
            const statementsBegginingFromNextAwait = {
                type: 'BlockStatement',
                body: utils_1.flatten(restChunks),
            };
            const declaredAsyncVariables = getDeclaredAsyncVariables(context, declarationOrExpressionWithAwait);
            const hasDeclaredAnyAsyncVariable = declaredAsyncVariables.length > 0;
            const isNotLastStatement = statementsBegginingFromNextAwait.body.length !== 0 ||
                restChunk.length !== 0;
            return (hasDeclaredAnyAsyncVariable &&
                isNotLastStatement &&
                isNotUsingVariablesExceptFirstAwaitedExpression(statementsBegginingFromNextAwait, declaredAsyncVariables));
        };
        return {
            ':function[async=true] BlockStatement': (node) => {
                // selector guarantees that node is a BlockStatement
                const blockStatementNode = node;
                if (!hasAnyAwaitExcludingReturnStatement(node)) {
                    context.report({ node, messageId: 'avoidTrivialAwait' });
                }
                const bodySplitByAwaitStatements = chunkByTopLevelAwaitStatements(blockStatementNode.body);
                const areChunksTrivial = bodySplitByAwaitStatements.map(isChunkTrivial);
                if (areChunksTrivial.every(Boolean)) {
                    context.report({ node, messageId: 'avoidTrivialAwait' });
                }
            },
        };
    },
};
exports.default = rule;
