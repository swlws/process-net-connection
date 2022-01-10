import { bunyan } from "restify";
export declare module "process" {
  global {
    namespace NodeJS {
      interface Process extends EventEmitter {
        getLogger: () => bunyan;
      }
    }
  }
}

export declare namespace NodeJS {
  export interface process {
    getLogger: () => bunyan;
  }
}
