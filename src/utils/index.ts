export const flatten = arr => [].concat(...arr);

export const flatMap = fn => arr => [].concat(...arr.map(fn));

export const splitOn = pred => arr => {
    const matchedIdx = arr.findIndex(pred);

    return matchedIdx !== -1
        ? [arr.slice(0, matchedIdx), arr[matchedIdx], arr.slice(matchedIdx + 1)]
        : [arr, null, []];
};

export const chunkBy = pred => arr =>
    arr
        .reduce(
            ([chunk, ...chunks], curr) =>
                chunk.length === 0
                    ? [[curr], ...chunks]
                    : pred(curr)
                    ? [[curr], chunk, ...chunks]
                    : [[...chunk, curr], ...chunks],
            [[]],
        )
        .reverse();

export const head = arr => arr[0];

export const or = (predA, predB) => a => predA(a) || predB(a);
