"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
var test_1 = require("../interface/test");
var apis = [
    {
        url: "/api/v1/alive",
        method: "get",
        handler: {
            version: "1.0.0",
            cb: test_1.server_alive,
        },
    },
];
exports.default = __spreadArray([], apis, true);
