'use strict';
const esquery = require('esquery');
const { flatMap } = require('../utils');

const isVariableDeclarationAwaitedDeclarator = node =>
    node.type === 'VariableDeclaration' &&
    node.declarations.some(
        declarator => esquery(declarator, 'AwaitExpression').length > 0,
    );

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
                const varDeclarations = node.body.filter(
                    ({ type }) => type === 'VariableDeclaration',
                );

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
