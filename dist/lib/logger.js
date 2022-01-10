"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var bunyan_1 = __importDefault(require("bunyan"));
var mode = process.env.NODE_ENV || "development";
var log = undefined;
function createLogger() {
    console.log("env mode: ".concat(mode));
    if (!!log)
        return log;
    var level = "trace";
    var streams = [
        { level: "info", stream: process.stdout },
        { level: "trace", stream: process.stdout },
    ];
    if (mode === "development") {
        streams.push({ level: "error", stream: process.stdout });
    }
    if (mode === "production") {
        level = "info";
        streams.push({ level: "error", path: "/var/tmp/myapp-error.log" });
    }
    log = bunyan_1.default.createLogger({
        name: "CodeLife",
        level: level,
        // streams,
    });
    return log;
}
exports.default = createLogger;
