"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.server_alive = void 0;
function server_alive(req, res, next) {
    var ctx = req.getCtx();
    var logger = ctx.logger;
    logger.info("info");
    logger.trace("trace");
    try {
        // throw new Error("123");
        ctx.data = true;
    }
    catch (e) {
        ctx.error = e;
    }
    finally {
        next();
    }
}
exports.server_alive = server_alive;
