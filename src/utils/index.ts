export const flatten = <T>(arr: T[][]) => ([] as T[]).concat(...arr);

export const flatMap = <T, U>(fn: (a: T) => U[]) => (arr: T[]) =>
    ([] as U[]).concat(...arr.map(fn));

export const head = <T>(arr: T[]): T | undefined => arr[0];

export const safeHeadAndTail = <T>([head, ...tail]: T[]): [T | undefined, T[]] => [head, tail];
