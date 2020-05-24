const flatten = arr => [].concat(...arr);

const flatMap = fn => arr => [].concat(...arr.map(fn));

const splitOn = pred => arr => {
    const matchedIdx = arr.findIndex(pred);

    return matchedIdx !== -1
        ? [arr.slice(0, matchedIdx), arr[matchedIdx], arr.slice(matchedIdx + 1)]
        : [arr, null, []];
};

const chunkBy = pred => arr =>
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

const head = arr => arr[0];

const or = (predA, predB) => a => predA(a) || predB(a);

module.exports = { flatten, flatMap, splitOn, chunkBy, or, head };
