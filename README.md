# eslint-plugin-no-trivial-await

Eslint rule that forbids uses of `async/await` that could be easily replaced with literal promises.

### Invalid code

```js
async function fn() {
    return await fetch(/* ... */);
}

// equivalent to
function fn() {
    return fetch(/* ... */);
}
```

```js
async function fn() {
    const a = await fetch(/* ... */);
    return a;
}

// equivalent to
function fn() {
    return fetch(/* ... */);
}
```

```js
async function fn() {
    const a = await fetch(/* ... */);
    const b = await fetch(sth + a);
    return b;
}

// equivalent to
function fn() {
    return fetch(/* ... */).then(a => fetch(sth + a));
}
```

### Valid code

```js
async function fn() {
    const a = await fetch(/* ... */);
    const b = await fetch(sth + a);
    return a + b;
}

// note: a is used after another await, would require promise nesting otherwise
function fn() {
    return fetch(/* ... */)
        .then(a => 
            fetch(sth + a)
                .then(b => a + b)
        );
}
```

For more examples see [_this_](https://github.com/GrzegorzKazana/eslint-plugin-no-trivial-await/blob/v0.1.0-alpha.2/tests/lib/rules/noTrivialAwait.ts).

### How to install

```bash
npm i -D @grzegorzkazana/eslint-plugin-no-trivial-await --registry https://npm.pkg.github.com
# or
npm i -D https://github.com/GrzegorzKazana/eslint-plugin-no-trivial-await.git
```

### How to use

In Your eslint config:

```js
{
    /* ... */
    plugins: ['@grzegorzkazana/no-trivial-await'],
    rules: {
        '@grzegorzkazana/no-trivial-await/noTrivialAwait': 'error',
    },
}
```
