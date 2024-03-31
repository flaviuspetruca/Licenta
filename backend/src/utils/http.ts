import { randomUUID } from "crypto";

export const uuid_mapper = (req: any, _res: any, next: any) => {
    const uuid = randomUUID();
    req.id = uuid;
    next();
};
