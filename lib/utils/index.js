"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.or = exports.head = exports.chunkBy = exports.flatMap = exports.flatten = void 0;
exports.flatten = (arr) => [].concat(...arr);
exports.flatMap = (fn) => (arr) => [].concat(...arr.map(fn));
exports.chunkBy = (pred) => (arr) => arr
    .reduce(([chunk, ...chunks], curr) => chunk.length === 0
    ? [[curr], ...chunks]
    : pred(curr)
        ? [[curr], chunk, ...chunks]
        : [[...chunk, curr], ...chunks], [[]])
    .reverse();
exports.head = (arr) => arr[0];
exports.or = (predA, predB) => (a) => predA(a) || predB(a);
