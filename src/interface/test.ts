import { Next, Request, Response } from "restify";
import { ReqWrapper } from "../lib/net-server";

export function server_alive(req: ReqWrapper, res: Response, next: Next) {
  const ctx = req.getCtx();
  const logger = ctx.logger;
  logger.info("info");
  logger.trace("trace");
  try {
    // throw new Error("123");
    ctx.data = true;
  } catch (e) {
    ctx.error = e;
  } finally {
    next();
  }
}
