import { Request, RequestHandler } from "restify";
import Logger from "bunyan";
declare type ResponseBody = string | number | boolean | {
    r0: number;
    r1?: string;
    res?: string;
};
/**
 * 单个请求的上下文对象
 *
 */
export declare type ReqCtx = {
    error?: any;
    logger: Logger;
    data: ResponseBody;
};
/**
 * 请求对象的包装
 *
 */
export declare type ReqWrapper = Request & {
    getCtx: () => ReqCtx;
};
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
    private option;
    private server;
    constructor(option: ServeCfg);
    pre(): void;
    use(): void;
    add_interfaces(): void;
    set_error_handler(): void;
    listen(): void;
    build(): void;
}
export {};
