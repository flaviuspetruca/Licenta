import { Request } from "../utils/http";
import { APP_ENV } from "../configs/types";

export class Logger {
    state: APP_ENV;
    req_id: string;

    constructor(req?: Request) {
        const state = APP_ENV[process.env.APP_ENV as keyof typeof APP_ENV];
        if (state !== APP_ENV.DEV && state !== APP_ENV.PROD) {
            throw new Error("Invalid environment");
        }
        if (req) this.req_id = req.context.id;
        this.state = state;
    }

    private _map_id(message: string) {
        if (this.state === APP_ENV.DEV) return `|${this.req_id}| ${message}`;
    }

    debug(message: string) {
        if (this.state === APP_ENV.DEV) console.info(this._map_id(message));
    }

    print(message: any) {
        if (this.state === APP_ENV.DEV) console.log(message);
    }

    error(message: string, error?: any) {
        if (this.state === APP_ENV.DEV) {
            console.error(this._map_id("ERROR: " + message));
            if (error) console.error(error);
        }
    }

    iprint(message: any) {
        console.log(message);
    }

    ierror(message: string, error?: any) {
        console.error("INTERNAL ERROR: " + message);
        if (error) console.error(error);
    }
}

const lgr = new Logger();
export default lgr;
