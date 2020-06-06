import type {
    Node,
    BlockStatement,
    Statement,
    VariableDeclarator,
    VariableDeclaration,
    AwaitExpression,
} from 'estree';
import type { Rule } from 'eslint';
import esquery from 'esquery';
import { flatten, or, chunkBy, elem, safeHeadAndTail } from '../utils';

const isAsyncDeclarator = (node: VariableDeclarator) => esquery(node, 'AwaitExpression').length > 0;

const isAsyncVariableDeclaration = (node: Statement) =>
    node.type === 'VariableDeclaration' && node.declarations.some(isAsyncDeclarator);

const isAsyncExpressionStatement = (node: Statement) =>
    node.type === 'ExpressionStatement' && esquery(node.expression, 'AwaitExpression').length > 0;

const isTopLevelAwaitStatement = or(isAsyncVariableDeclaration, isAsyncExpressionStatement);

const chunkByTopLevelAwaitStatements = chunkBy(isTopLevelAwaitStatement);

const getDeclaredAsyncVariables = (
    context: Rule.RuleContext,
    node: VariableDeclaration,
): string[] => {
    if (node.type !== 'VariableDeclaration') return [];

    const asyncDeclarators = node.declarations.filter(isAsyncDeclarator);
    const asyncVariables = asyncDeclarators.map(decl => context.getDeclaredVariables(decl));

    return flatten(asyncVariables).map(({ name }) => name);
};

const hasAnyAwaitExcludingReturnStatement = (node: Node) =>
    esquery(node, 'AwaitExpression:not(ReturnStatement AwaitExpression)').length > 0;

const isReturnStatement = (node: Node) => node.type === 'ReturnStatement';

const isNotUsingVariablesExceptFirstAwaitedExpression = (node: Node, variables: string[]) => {
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
        // const isChunkTrivial = (
        //     chunk: Statement[],
        //     chunkIdx: number,
        //     chunks: Statement[][],
        // ) => {
        //     const [declarationOrExpressionWithAwait, ...restChunk] = chunk;
        //     const restChunks = chunks.slice(chunkIdx + 1);
        //     const statementsBegginingFromNextAwait: BlockStatement = {
        //         type: 'BlockStatement',
        //         body: flatten(restChunks),
        //     };

        //     const declaredAsyncVariables = getDeclaredAsyncVariables(
        //         context,
        //         declarationOrExpressionWithAwait,
        //     );

        //     const hasDeclaredAnyAsyncVariable =
        //         declaredAsyncVariables.length > 0;

        //     const isNotLastStatement =
        //         statementsBegginingFromNextAwait.body.length !== 0 ||
        //         restChunk.length !== 0;

        //     return (
        //         hasDeclaredAnyAsyncVariable &&
        //         isNotLastStatement &&
        //         isNotUsingVariablesExceptFirstAwaitedExpression(
        //             statementsBegginingFromNextAwait,
        //             declaredAsyncVariables,
        //         )
        //     );
        // };

        const isStatementUsingVariableOnlyInMostNestedAwait = (node: Node, variables: string[]) => {
            const variableIdentifierSelector = `Identifier[name=/${variables.join('|')}/]`;
            const lowestLevelAwaitExpressions = esquery(
                node,
                'AwaitExpression:not(AwaitExpression:has(AwaitExpression AwaitExpression))',
            ) as AwaitExpression[];

            const allVariableUses = esquery(node, variableIdentifierSelector).length;
            const allVariableUsesInAwaitExpressions = esquery(
                node,
                `AwaitExpression ${variableIdentifierSelector}`,
            ).length;
            const variableUsesInLowestAwaitExpressions = lowestLevelAwaitExpressions.reduce(
                (count, awaitExpr) => count + esquery(awaitExpr, variableIdentifierSelector).length,
                0,
            );

            // console.log({
            //     variableUsesInLowestAwaitExpressions,
            //     allVariableUsesInAwaitExpressions,
            //     allVariableUses,
            // });

            return variableUsesInLowestAwaitExpressions === allVariableUsesInAwaitExpressions;
        };

        const isNodeUsingVariable = (variables: string[]) => (node: Node) => {
            const variableIdentifierSelector = `Identifier[name=/${variables.join('|')}/]`;

            return esquery(node, variableIdentifierSelector).length > 0;
        };

        const isTrivialStatement = (
            currentStatement: Statement,
            idx: number,
            array: Statement[],
        ) => {
            if (currentStatement.type !== 'VariableDeclaration') return true;

            const restBody = array.slice(idx + 1);
            const [nextStatement, restStatements] = safeHeadAndTail(restBody);
            if (!nextStatement) return true;

            const variables = getDeclaredAsyncVariables(context, currentStatement);

            const hasAwait = esquery(nextStatement, 'AwaitExpression').length > 0;
            const isInvalid = hasAwait
                ? !isStatementUsingVariableOnlyInMostNestedAwait(nextStatement, variables)
                : !isReturnStatement(nextStatement) &&
                  isNodeUsingVariable(variables)(nextStatement);

            // console.log({
            //     isStatementUsingVariableOnlyInMostNestedAwait: !isStatementUsingVariableOnlyInMostNestedAwait(
            //         nextStatement,
            //         variables,
            //     ),
            //     hasAwait,
            //     isNodeUsingVariable: isNodeUsingVariable(variables)(nextStatement),
            //     isInvalid,
            //     restStatements: restStatements.map(isNodeUsingVariable(variables)),
            // });

            const isNotTrivial =
                // !isNodeUsingVariable(variables)(nextStatement) ||
                isInvalid || restStatements.some(isNodeUsingVariable(variables));

            return !isNotTrivial;
        };

        return {
            ':function[async=true] BlockStatement': (node: Node) => {
                // selector guarantees that node is a BlockStatement
                const blockStatementNode = node as BlockStatement;

                if (!hasAnyAwaitExcludingReturnStatement(node)) {
                    context.report({ node, messageId: 'avoidTrivialAwait' });
                    return;
                }

                console.warn(blockStatementNode.body.map(isTrivialStatement));

                if (blockStatementNode.body.every(isTrivialStatement)) {
                    context.report({ node, messageId: 'avoidTrivialAwait' });
                }

                // const bodySplitByAwaitStatements = chunkByTopLevelAwaitStatements(
                //     blockStatementNode.body,
                // );

                // const areChunksTrivial = bodySplitByAwaitStatements.map(
                //     isChunkTrivial,
                // );

                // if (areChunksTrivial.every(Boolean)) {
                //     context.report({ node, messageId: 'avoidTrivialAwait' });
                // }
            },
        };
    },
};

export default rule;
