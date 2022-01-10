import { ApiCfg } from "../lib/net-server";
import { server_alive } from "../interface/test";

const apis: ApiCfg[] = [
  {
    url: "/api/v1/alive",
    method: "get",
    handler: {
      version: "1.0.0",
      cb: server_alive as any,
    },
  },
];
export default apis;
