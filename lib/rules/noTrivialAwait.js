'use strict';
const esquery = require('esquery');
const { flatten, flatMap, splitOn, or, chunkBy, head } = require('../utils');

const isVariableDeclarationAwaitedDeclarator = node =>
    node.type === 'VariableDeclaration' &&
    node.declarations.some(
        declarator => esquery(declarator, 'AwaitExpression').length > 0,
    );

const isExpressionStatementWithAwait = node =>
    node.type === 'ExpressionStatement' &&
    esquery(node.expression, 'AwaitExpression').length > 0;

const splitOnDeclarationOrExpressionWithAwait = splitOn(
    or(isVariableDeclarationAwaitedDeclarator, isExpressionStatementWithAwait),
);

const chunkByDeclarationsOrExpressionsWithAwait = chunkBy(
    or(isVariableDeclarationAwaitedDeclarator, isExpressionStatementWithAwait),
);

const getDeclaredAwaitedVariables = (context, node) =>
    node.type === 'VariableDeclaration'
        ? flatMap(declarator => context.getDeclaredVariables(declarator))(
              node.declarations.filter(
                  declarator =>
                      esquery(declarator, 'AwaitExpression').length > 0,
              ),
          )
        : [];

module.exports = {
    meta: {
        messages: {
            avoidTrivialAwait: 'Use Promise.then',
        },
    },
    create: function (context) {
        return {
            ':function[async=true] BlockStatement': node => {
                const bodySplitByAwaitDeclarationsOrExpressions = chunkByDeclarationsOrExpressionsWithAwait(
                    node.body,
                );

                const isInvalid = bodySplitByAwaitDeclarationsOrExpressions.map(
                    (chunk, idx, chunks) => {
                        const [
                            declarationOrExpressionWithAwait,
                            ...restChunk
                        ] = chunk;
                        const restChunks = chunks.slice(idx + 1);
                        const declaredAsyncVariableNames = getDeclaredAwaitedVariables(
                            context,
                            declarationOrExpressionWithAwait,
                        ).map(({ name }) => name);

                        const variableNames = declaredAsyncVariableNames.join(
                            '|',
                        );

                        const restCode = {
                            type: 'BlockStatement',
                            body: flatten(restChunks),
                        };

                        console.log([
                            !!variableNames,
                            restCode.body.length > 0,
                            esquery(
                                restCode,
                                `Identifier[name=/${variableNames}/]:not(VariableDeclaration:first-child AwaitExpression Identifier)`,
                            ).length === 0,
                        ]);
                        // console.warn({ chunk, restCode: restCode.body });
                        const isTrivial =
                            variableNames &&
                            (restCode.body.length > 0 ||
                                restChunk.length > 0) &&
                            esquery(
                                restCode,
                                `Identifier[name=/${variableNames}/]:not(VariableDeclaration:first-child AwaitExpression Identifier)`,
                            ).length === 0;

                        return isTrivial;
                    },
                );

                console.warn('IS INCVALID?', isInvalid);
                if (isInvalid.every(Boolean)) {
                    console.warn('IS INCVALID');
                    context.report({ node, messageId: 'avoidTrivialAwait' });
                }
            },
        };
    },
};
