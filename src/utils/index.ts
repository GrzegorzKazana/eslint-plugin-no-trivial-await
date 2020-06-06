type Predicate<T> = (a: T) => boolean;

export const flatten = <T>(arr: T[][]) => ([] as T[]).concat(...arr);

export const flatMap = <T, U>(fn: (a: T) => U[]) => (arr: T[]) =>
    ([] as U[]).concat(...arr.map(fn));

export const chunkBy = <T>(pred: Predicate<T>) => (arr: T[]): T[][] =>
    arr
        .reduce(
            ([chunk, ...chunks], curr) =>
                chunk.length === 0
                    ? [[curr], ...chunks]
                    : pred(curr)
                    ? [[curr], chunk, ...chunks]
                    : [[...chunk, curr], ...chunks],
            [[]] as T[][],
        )
        .reverse();

export const head = <T>(arr: T[]): T | undefined => arr[0];

export const or = <T>(predA: Predicate<T>, predB: Predicate<T>) => (a: T) =>
    predA(a) || predB(a);

export const elem = <T>(arr: T[], idx: number): T | undefined => arr[idx];

export const safeHeadAndTail = <T>([head, ...tail]: T[]): [
    T | undefined,
    T[],
] => [head, tail];
