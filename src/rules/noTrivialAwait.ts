import type {
    Node,
    BlockStatement,
    Statement,
    VariableDeclarator,
} from 'estree';
import type { Rule } from 'eslint';
import esquery from 'esquery';
import { flatten, or, chunkBy } from '../utils';

const isAsyncDeclarator = (node: VariableDeclarator) =>
    esquery(node, 'AwaitExpression').length > 0;

const isAsyncVariableDeclaration = (node: Statement) =>
    node.type === 'VariableDeclaration' &&
    node.declarations.some(isAsyncDeclarator);

const isExpressionStatementWithAwait = (node: Statement) =>
    node.type === 'ExpressionStatement' &&
    esquery(node.expression, 'AwaitExpression').length > 0;

const isTopLevelAwaitStatement = or(
    isAsyncVariableDeclaration,
    isExpressionStatementWithAwait,
);

const chunkByTopLevelAwaitStatements = chunkBy(isTopLevelAwaitStatement);

const getDeclaredAsyncVariables = (
    context: Rule.RuleContext,
    node: Node,
): string[] => {
    if (node.type !== 'VariableDeclaration') return [];

    const asyncDeclarators = node.declarations.filter(isAsyncDeclarator);
    const asyncVariables = asyncDeclarators.map(decl =>
        context.getDeclaredVariables(decl),
    );

    return flatten(asyncVariables).map(({ name }) => name);
};

const hasAnyAwaitExcludingReturnStatement = (node: Node) =>
    esquery(node, 'AwaitExpression:not(ReturnStatement AwaitExpression)')
        .length > 0;

const isNotUsingVariablesExceptFirstAwaitedExpression = (
    node: Node,
    variables: string[],
) => {
    const variablesUnion = variables.join('|');
    const isIdentifierInAwaitExpression = 'AwaitExpression Identifier';
    const isIdentifierInFirstDeclaration = `VariableDeclaration:first-child ${isIdentifierInAwaitExpression}`;
    const isIdentifierInFirstExpressionStatement = `ExpressionStatement:first-child ${isIdentifierInAwaitExpression}`;
    const query = `Identifier[name=/${variablesUnion}/]:not(${isIdentifierInFirstDeclaration}):not(${isIdentifierInFirstExpressionStatement})`;

    return esquery(node, query).length === 0;
};

const rule: Rule.RuleModule = {
    meta: {
        messages: {
            avoidTrivialAwait: 'Use Promise.then',
        },
    },
    create: function (context) {
        const isChunkTrivial = (
            chunk: Statement[],
            chunkIdx: number,
            chunks: Statement[][],
        ) => {
            const [declarationOrExpressionWithAwait, ...restChunk] = chunk;
            const restChunks = chunks.slice(chunkIdx + 1);
            const statementsBegginingFromNextAwait: BlockStatement = {
                type: 'BlockStatement',
                body: flatten(restChunks),
            };

            const declaredAsyncVariables = getDeclaredAsyncVariables(
                context,
                declarationOrExpressionWithAwait,
            );

            const hasDeclaredAnyAsyncVariable =
                declaredAsyncVariables.length > 0;

            const isNotLastStatement =
                statementsBegginingFromNextAwait.body.length !== 0 ||
                restChunk.length !== 0;

            return (
                hasDeclaredAnyAsyncVariable &&
                isNotLastStatement &&
                isNotUsingVariablesExceptFirstAwaitedExpression(
                    statementsBegginingFromNextAwait,
                    declaredAsyncVariables,
                )
            );
        };

        return {
            ':function[async=true] BlockStatement': (node: Node) => {
                // selector guarantees that node is a BlockStatement
                const blockStatementNode = node as BlockStatement;

                if (!hasAnyAwaitExcludingReturnStatement(node)) {
                    context.report({ node, messageId: 'avoidTrivialAwait' });
                }

                const bodySplitByAwaitStatements = chunkByTopLevelAwaitStatements(
                    blockStatementNode.body,
                );

                const areChunksTrivial = bodySplitByAwaitStatements.map(
                    isChunkTrivial,
                );

                if (areChunksTrivial.every(Boolean)) {
                    context.report({ node, messageId: 'avoidTrivialAwait' });
                }
            },
        };
    },
};

export default rule;
