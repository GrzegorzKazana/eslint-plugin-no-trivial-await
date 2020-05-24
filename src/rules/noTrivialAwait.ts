import esquery from 'esquery';
import type { BlockStatement } from 'estree';
import { flatten, flatMap, or, chunkBy } from '../utils';

const isVariableDeclarationAwaitedDeclarator = node =>
    node.type === 'VariableDeclaration' &&
    node.declarations.some(
        declarator => esquery(declarator, 'AwaitExpression').length > 0,
    );

const isExpressionStatementWithAwait = node =>
    node.type === 'ExpressionStatement' &&
    esquery(node.expression, 'AwaitExpression').length > 0;

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

export default {
    meta: {
        messages: {
            avoidTrivialAwait: 'Use Promise.then',
        },
    },
    create: function (context) {
        return {
            ':function[async=true] BlockStatement': node => {
                if (
                    esquery(
                        node,
                        'AwaitExpression:not(ReturnStatement AwaitExpression)',
                    ).length === 0
                ) {
                    context.report({ node, messageId: 'avoidTrivialAwait' });
                }

                const bodySplitByAwaitDeclarationsOrExpressions = chunkByDeclarationsOrExpressionsWithAwait(
                    node.body,
                );

                const isInvalid = bodySplitByAwaitDeclarationsOrExpressions.every(
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

                        const restCode: BlockStatement = {
                            type: 'BlockStatement',
                            body: flatten(restChunks),
                        };

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

                if (isInvalid) {
                    context.report({ node, messageId: 'avoidTrivialAwait' });
                }
            },
        };
    },
};
