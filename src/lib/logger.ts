import bunyan, { LogLevel } from "bunyan";

const mode = process.env.NODE_ENV || "development";

let log: bunyan | undefined = undefined;

export default function createLogger() {
  console.log(`env mode: ${mode}`);
  if (!!log) return log;

  let level: LogLevel = "trace";
  let streams: bunyan.Stream[] = [
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

  log = bunyan.createLogger({
    name: "CodeLife",
    level,
    // streams,
  });

  return log;
}
