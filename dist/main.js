"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var net_server_1 = __importDefault(require("./lib/net-server"));
var apis_1 = __importDefault(require("./data/apis"));
var server = new net_server_1.default({
    name: "CodeLifeSvc",
    host: "127.0.0.1",
    port: 8808,
    api_version: "1.0.0",
    apis: apis_1.default,
});
server.build();
