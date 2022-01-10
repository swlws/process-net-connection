import restify, { Request, Response, Next, RequestHandler } from "restify";
import http from "http";
import { ERROR_CODE } from "./code";
import createLogger from "./logger";
import Logger from "bunyan";

const logger = createLogger();

const REQUEST_CONTEXT_KEY = "r_ctx";

type ResponseBody =
  | string
  | number
  | boolean
  | { r0: number; r1?: string; res?: string };

/**
 * 单个请求的上下文对象
 *
 */
export type ReqCtx = {
  error?: any;
  logger: Logger;
  data: ResponseBody;
};

/**
 * 请求对象的包装
 *
 */
export type ReqWrapper = Request & {
  getCtx: () => ReqCtx;
};

/**
 * http.IncomingMessage 添加getCtx方法，返回ReqCtx
 */
const prototype = http.IncomingMessage.prototype as any;
prototype.getCtx = function (): ReqCtx {
  return (<any>this).get(REQUEST_CONTEXT_KEY);
};

/**
 * 设置上下文对象
 *
 * @param req
 * @param res
 * @param next
 */
function setCtx(req: Request, res: Response, next: Next) {
  const ctx: ReqCtx = {
    logger: logger,
    data: { r0: ERROR_CODE.SUCCESS, r1: "", res: "" },
  };

  (<any>req).set(REQUEST_CONTEXT_KEY, ctx);

  next();
}

/**
 * 结束请求处理链
 *
 * @param req
 * @param res
 * @param next
 */
function end_request_chain(req: Request, res: Response, next: Next) {
  const ctx = (<ReqWrapper>req).getCtx();
  // delete ctx.logger;

  const { error, data } = ctx;
  if (error) {
    logger.error(error);
    res.send({
      r0: ERROR_CODE.ERROR,
      r1: error instanceof Error ? error.message : error,
    });
  } else {
    if (["string", "number", "boolean"].includes(typeof data)) {
      res.send({ r0: ERROR_CODE.SUCCESS, res: data });
    } else {
      res.send(data);
    }
  }

  logger.info("end_request_handler_chain");
  next();
}

export interface ServeCfg {
  name: string;
  host: string;
  port: number;
  static?: string;
  api_version: string;
  apis: ApiCfg[];
}

export interface ApiCfg {
  url: string;
  method: "get" | "post" | "del" | "put";
  handler: {
    version: string;
    cb: RequestHandler;
  };
}

export default class NetServer {
  private option: ServeCfg;
  private server: restify.Server;

  constructor(option: ServeCfg) {
    this.option = option;

    this.server = restify.createServer({
      ...this.option,
    });
  }

  pre() {
    this.server.pre(restify.plugins.pre.dedupeSlashes());
    this.server.pre(restify.plugins.pre.sanitizePath());
    this.server.pre(restify.plugins.pre.context());

    this.server.pre(setCtx);
  }

  use() {
    this.server.use(restify.plugins.acceptParser(this.server.acceptable));
    this.server.use(
      restify.plugins.queryParser({
        mapParams: true,
        arrayLimit: 0,
        depth: 0,
        parameterLimit: 8,
        parseArrays: true,
      })
    );
    this.server.use(
      restify.plugins.bodyParser({
        mapParams: true,
      })
    );

    if (this.option.static) {
      // don't forget the `/*`
      this.server.get(
        "/s/*",
        restify.plugins.serveStaticFiles(this.option.static)
      );
    }

    // 路由版本控制
    // http://restify.com/docs/plugins-api/#conditionalhandler
    const router_version = this.option.api_version;
    this.server.use(
      restify.plugins.conditionalHandler({
        version: router_version,
        handler: function (req, res, next) {
          next();
        },
      })
    );
  }

  add_interfaces() {
    let apis = this.option.apis;
    if (!Array.isArray(apis)) return;

    apis.forEach(({ url, method, handler: { version, cb } }) => {
      const handlers = restify.plugins.conditionalHandler([
        {
          version,
          handler: [cb, end_request_chain],
        },
      ]);

      switch (method) {
        case "get":
          this.server.get(url, handlers);
          break;
        case "post":
          this.server.post(url, handlers);
          break;
        case "put":
          this.server.put(url, handlers);
          break;
        case "del":
          this.server.del(url, handlers);
          break;
        default:
          break;
      }
    });
  }

  set_error_handler() {
    this.server.on("restifyError", function (req, res, err, callback) {
      logger.error(err);
      return callback();
    });

    this.server.on("uncaughtException", function (req, res, route, err) {
      logger.error(err);
      logger.error(route);
    });
  }

  listen() {
    const { host, port } = this.option;

    this.server.listen(port, host, () => {
      const { name, url } = this.server;
      logger.info("%s listening at %s", name, url);
    });
  }

  build() {
    this.pre();
    this.use();
    this.set_error_handler();
    this.add_interfaces();
    this.listen();
  }
}
