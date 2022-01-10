"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var restify_1 = __importDefault(require("restify"));
var http_1 = __importDefault(require("http"));
var code_1 = require("./code");
var logger_1 = __importDefault(require("./logger"));
var logger = (0, logger_1.default)();
var REQUEST_CONTEXT_KEY = "r_ctx";
/**
 * http.IncomingMessage 添加getCtx方法，返回ReqCtx
 */
var prototype = http_1.default.IncomingMessage.prototype;
prototype.getCtx = function () {
    return this.get(REQUEST_CONTEXT_KEY);
};
/**
 * 设置上下文对象
 *
 * @param req
 * @param res
 * @param next
 */
function setCtx(req, res, next) {
    var ctx = {
        logger: logger,
        data: { r0: code_1.ERROR_CODE.SUCCESS, r1: "", res: "" },
    };
    req.set(REQUEST_CONTEXT_KEY, ctx);
    next();
}
/**
 * 结束请求处理链
 *
 * @param req
 * @param res
 * @param next
 */
function end_request_chain(req, res, next) {
    var ctx = req.getCtx();
    // delete ctx.logger;
    var error = ctx.error, data = ctx.data;
    if (error) {
        logger.error(error);
        res.send({
            r0: code_1.ERROR_CODE.ERROR,
            r1: error instanceof Error ? error.message : error,
        });
    }
    else {
        if (["string", "number", "boolean"].includes(typeof data)) {
            res.send({ r0: code_1.ERROR_CODE.SUCCESS, res: data });
        }
        else {
            res.send(data);
        }
    }
    logger.info("end_request_handler_chain");
    next();
}
var NetServer = /** @class */ (function () {
    function NetServer(option) {
        this.option = option;
        this.server = restify_1.default.createServer(__assign({}, this.option));
    }
    NetServer.prototype.pre = function () {
        this.server.pre(restify_1.default.plugins.pre.dedupeSlashes());
        this.server.pre(restify_1.default.plugins.pre.sanitizePath());
        this.server.pre(restify_1.default.plugins.pre.context());
        this.server.pre(setCtx);
    };
    NetServer.prototype.use = function () {
        this.server.use(restify_1.default.plugins.acceptParser(this.server.acceptable));
        this.server.use(restify_1.default.plugins.queryParser({
            mapParams: true,
            arrayLimit: 0,
            depth: 0,
            parameterLimit: 8,
            parseArrays: true,
        }));
        this.server.use(restify_1.default.plugins.bodyParser({
            mapParams: true,
        }));
        if (this.option.static) {
            // don't forget the `/*`
            this.server.get("/s/*", restify_1.default.plugins.serveStaticFiles(this.option.static));
        }
        // 路由版本控制
        // http://restify.com/docs/plugins-api/#conditionalhandler
        var router_version = this.option.api_version;
        this.server.use(restify_1.default.plugins.conditionalHandler({
            version: router_version,
            handler: function (req, res, next) {
                next();
            },
        }));
    };
    NetServer.prototype.add_interfaces = function () {
        var _this = this;
        var apis = this.option.apis;
        if (!Array.isArray(apis))
            return;
        apis.forEach(function (_a) {
            var url = _a.url, method = _a.method, _b = _a.handler, version = _b.version, cb = _b.cb;
            var handlers = restify_1.default.plugins.conditionalHandler([
                {
                    version: version,
                    handler: [cb, end_request_chain],
                },
            ]);
            switch (method) {
                case "get":
                    _this.server.get(url, handlers);
                    break;
                case "post":
                    _this.server.post(url, handlers);
                    break;
                case "put":
                    _this.server.put(url, handlers);
                    break;
                case "del":
                    _this.server.del(url, handlers);
                    break;
                default:
                    break;
            }
        });
    };
    NetServer.prototype.set_error_handler = function () {
        this.server.on("restifyError", function (req, res, err, callback) {
            logger.error(err);
            return callback();
        });
        this.server.on("uncaughtException", function (req, res, route, err) {
            logger.error(err);
            logger.error(route);
        });
    };
    NetServer.prototype.listen = function () {
        var _this = this;
        var _a = this.option, host = _a.host, port = _a.port;
        this.server.listen(port, host, function () {
            var _a = _this.server, name = _a.name, url = _a.url;
            logger.info("%s listening at %s", name, url);
        });
    };
    NetServer.prototype.build = function () {
        this.pre();
        this.use();
        this.set_error_handler();
        this.add_interfaces();
        this.listen();
    };
    return NetServer;
}());
exports.default = NetServer;
