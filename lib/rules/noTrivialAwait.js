'use strict';
const esquery = require('esquery');

module.exports = {
    meta: {
        messages: {
            avoidTrivialAwait: 'Use Promise.then',
        },
    },
    create: function (context) {
        return {
            ':function[async=true] BlockStatement': node => {
                console.warn('asdasd', Object.keys(node));
                const rootVaraibleDeclarations = esquery(
                    node,
                    'BlockStatement > VariableDeclaration',
                );

                const awaitedVariables = rootVaraibleDeclarators.filter(
                    ({ init }) => init && init.type === 'AwaitExpression',
                );

                console.warn(
                    'asdasd',
                    rootVaraibleDeclarators.length,
                    awaitedVariables.length,
                );
            },
        };
    },
};
