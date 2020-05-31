import { RuleTester } from 'eslint';

import { flatMap } from '@/utils';
import rule from '@/rules/noTrivialAwait';

const ruleTester = new RuleTester();
const parserOptions = { ecmaVersion: 8 } as const;
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
    `const a = await fetch();
     const b = await fetch();
     const c = await fetch()
     return b + c`,
    `const a = await fetch();
     const b = a + 1
     const c = await fetch();
     const d = b + c;`,
    `const a = await fetch();
     await fetch();
     return a;`,
    `const a = await fetch();
     const c = a + 1;
     const b = await fetch();
     return b;`,
];

const invalidFunctionBodies = [
    `return await fetch();`,
    `const a = await fetch();
     return a;`,
    `const a = await fetch();
     const b = await fetch();
     return b;`,
    `const a = await fetch();
     const b = await fetch(a);
     return b;`,
];

const createFunctionDeclarations = (body: string) => [
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
