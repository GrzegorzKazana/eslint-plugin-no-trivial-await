"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.or = exports.head = exports.chunkBy = exports.splitOn = exports.flatMap = exports.flatten = void 0;
exports.flatten = arr => [].concat(...arr);
exports.flatMap = fn => arr => [].concat(...arr.map(fn));
exports.splitOn = pred => arr => {
    const matchedIdx = arr.findIndex(pred);
    return matchedIdx !== -1
        ? [arr.slice(0, matchedIdx), arr[matchedIdx], arr.slice(matchedIdx + 1)]
        : [arr, null, []];
};
exports.chunkBy = pred => arr => arr
    .reduce(([chunk, ...chunks], curr) => chunk.length === 0
    ? [[curr], ...chunks]
    : pred(curr)
        ? [[curr], chunk, ...chunks]
        : [[...chunk, curr], ...chunks], [[]])
    .reverse();
exports.head = arr => arr[0];
exports.or = (predA, predB) => a => predA(a) || predB(a);
