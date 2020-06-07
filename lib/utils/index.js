"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.safeHeadAndTail = exports.head = exports.flatMap = exports.flatten = void 0;
exports.flatten = (arr) => [].concat(...arr);
exports.flatMap = (fn) => (arr) => [].concat(...arr.map(fn));
exports.head = (arr) => arr[0];
exports.safeHeadAndTail = ([head, ...tail]) => [head, tail];
