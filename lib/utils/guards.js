"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const selectors_1 = require("./selectors");
const isVariableDeclaration = (node) => node.type === selectors_1.NodeTypes.VariableDeclaration;
const isReturnStatement = (node) => node.type === selectors_1.NodeTypes.ReturnStatement;
exports.default = {
    isVariableDeclaration,
    isReturnStatement,
};
