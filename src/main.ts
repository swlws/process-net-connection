import NetServer from "./lib/net-server";
import apis from "./data/apis";

const server = new NetServer({
  name: "CodeLifeSvc",
  host: "127.0.0.1",
  port: 8808,
  api_version: "1.0.0",
  apis: apis,
});
server.build();
