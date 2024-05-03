import { Request } from "./utils/http";
import { Logger } from "./utils/logger";

export class Actor {
    lgr: Logger;
    handle_request(req: Request) {
        this.lgr = new Logger(req);
    }
}
