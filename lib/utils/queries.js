"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const esquery_1 = __importDefault(require("esquery"));
const selectors_1 = __importStar(require("./selectors"));
const hasAwait = (node) => esquery_1.default(node, selectors_1.NodeTypes.AwaitExpression).length > 0;
const getLowestLevelAwaitExpressions = (node) => esquery_1.default(node, selectors_1.default.lowestLevelAwaitExpressions);
const getVariableUses = (node, variables) => esquery_1.default(node, selectors_1.default.variableIdentifier(variables));
const getVariableUsesInAwaitExpressions = (node, variables) => esquery_1.default(node, selectors_1.default.variableUsesInAwaitExpressions(variables));
const isNodeUsingVariable = (node, variables) => getVariableUses(node, variables).length > 0;
exports.default = {
    hasAwait,
    getLowestLevelAwaitExpressions,
    getVariableUsesInAwaitExpressions,
    getVariableUses,
    isNodeUsingVariable,
};
