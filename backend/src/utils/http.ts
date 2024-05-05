import { randomUUID } from "crypto";
import { NextFunction, Response } from "express";
import User from "../models/User";
import { Logger } from "./logger";
import { Request as ExpressRequest } from "express";
export type Request = ExpressRequest & { context: RequestContext };

export interface RequestContext {
    id: string;
    lgr?: Logger;
    user?: Omit<User, "password">;
    gym?: { admin: boolean };
}

export const uuid_mapper = (req: Request, _res: Response, next: NextFunction) => {
    const uuid = randomUUID();
    req.context = {} as RequestContext;
    req.context.id = uuid;
    next();
};

export const logger_middleware = (req: Request, res: Response, next: NextFunction) => {
    const lgr = new Logger(req);
    req.context.lgr = lgr;
    next();
};

export const WHITELISTED_ROUTES = ["register", "login", "audio", "holds-images"];

export const STATUS_CODES = {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    INTERNAL_SERVER_ERROR: 500,
};
