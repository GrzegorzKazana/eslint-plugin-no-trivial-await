import type { Node, BlockStatement, Statement, VariableDeclaration } from 'estree';
import type { Rule } from 'eslint';

import { flatten, safeHeadAndTail } from '@/utils';
import queries from '@/utils/queries';
import guards from '@/utils/guards';
import selectors from '@/utils/selectors';

const isStatementUsingVariableOnlyInMostNestedAwait = (node: Node, variables: string[]) => {
    const allVariableUses = queries.getVariableUses(node, variables).length;
    const allVariableUsesInAwaitExpressions = queries.getVariableUsesInAwaitExpressions(
        node,
        variables,
    ).length;

    const lowestLevelAwaitExpressions = queries.getLowestLevelAwaitExpressions(node);
    const variableUsesInLowestAwaitExpressions = lowestLevelAwaitExpressions.reduce(
        (count, awaitExpr) => count + queries.getVariableUses(awaitExpr, variables).length,
        0,
    );

    return (
        allVariableUses === allVariableUsesInAwaitExpressions &&
        variableUsesInLowestAwaitExpressions === allVariableUsesInAwaitExpressions
    );
};

const rule: Rule.RuleModule = {
    meta: {
        messages: {
            avoidTrivialAwait: 'Use Promise.then',
        },
    },
    create: function (context) {
        const getDeclaredAsyncVariables = (node: VariableDeclaration) => {
            const asyncDeclarators = node.declarations.filter(queries.hasAwait);
            const asyncVariables = asyncDeclarators.map(decl => context.getDeclaredVariables(decl));

            return flatten(asyncVariables).map(({ name }) => name);
        };

        const isTrivialStatement = (
            currentStatement: Statement,
            idx: number,
            array: Statement[],
        ) => {
            const restBody = array.slice(idx + 1);
            const [nextStatement, restStatements] = safeHeadAndTail(restBody);

            if (!nextStatement || !guards.isVariableDeclaration(currentStatement)) return true;

            const variables = getDeclaredAsyncVariables(currentStatement);

            const isNextStatementInvalid = queries.hasAwait(nextStatement)
                ? !isStatementUsingVariableOnlyInMostNestedAwait(nextStatement, variables)
                : !guards.isReturnStatement(nextStatement) &&
                  queries.isNodeUsingVariable(nextStatement, variables);

            const isAnyRestStatementInvalid = restStatements.some(node =>
                queries.isNodeUsingVariable(node, variables),
            );

            return !isNextStatementInvalid && !isAnyRestStatementInvalid;
        };

        return {
            [selectors.blockStatementOfAsyncFunction]: (node: Node) => {
                // selector guarantees that node is a BlockStatement
                const blockStatementNode = node as BlockStatement;

                if (blockStatementNode.body.every(isTrivialStatement)) {
                    context.report({ node, messageId: 'avoidTrivialAwait' });
                }
            },
        };
    },
};

export default rule;
