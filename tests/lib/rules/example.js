'use strict';

const { flatMap } = require('../../../lib/utils');
const rule = require('../../../lib/rules/noTrivialAwait');
const RuleTester = require('eslint').RuleTester;

const ruleTester = new RuleTester();
const parserOptions = { ecmaVersion: 8 };
const errors = [{ messageId: 'avoidTrivialAwait' }];

const validFunctionBodies = [
    `const a = await fetch();
     const b = await fetch();
     const c = a + b;`,
    `const [a] = await fetch();
     const b = await fetch();
     const c = [a, b];`,
    `const { a } = await fetch();
     const b = await fetch();
     return { a, b };`,
    `const a = await fetch();
     const b = await fetch();
     return add(a, b);`,
];

const invalidFunctionBodies = [
    `return await fetch();`,
    `const a = await fetch();
     return a;`,
    `const a = await fetch();
     cosnt b = await fetch();
     return b;`,
    `const a = await fetch();
     cosnt b = await fetch(a);
     return b;`,
    `const a = await fetch();
     const c = a + 1;
     cosnt b = await fetch();
     return b;`,
];

const createFunctionDeclarations = body => [
    `async () => {
      ${body}
    }`,
    `async function fn() {
      ${body}
    }`,
    `class A {
      async fn() {
        ${body}
      }
    }`,
];

const createFnsWithBodies = flatMap(createFunctionDeclarations);
const validFunctionDeclarations = createFnsWithBodies(validFunctionBodies);
const invalidFunctionDeclarations = createFnsWithBodies(invalidFunctionBodies);

ruleTester.run('noTrivialAwait', rule, {
    valid: validFunctionDeclarations.map(code => ({ code, parserOptions })),
    invalid: invalidFunctionDeclarations.map(code => ({
        code,
        parserOptions,
        errors,
    })),
});
