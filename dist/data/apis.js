"use strict";
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
exports.default = apis;
