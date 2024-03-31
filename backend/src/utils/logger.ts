import { Request } from "express";
import { ApplicationState } from "../configs/types";

class logger {
    state: ApplicationState;

    constructor(state: ApplicationState) {
        this.state = state;
    }

    debug(request: Request & { id: string }, message: string) {
        if (this.state === ApplicationState.DEV)
            console.info(
                `|${request.id}| ${request.route.path} | DEBUG: ${message}`
            );
    }

    print(message: any) {
        if (this.state === ApplicationState.DEV) console.log(message);
    }
}

const lgr = new logger(ApplicationState.DEV);
export default lgr;
