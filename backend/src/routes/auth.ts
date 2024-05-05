import jwt from "jsonwebtoken";
import express, { NextFunction, Response } from "express";
import User, { insertUser, findUser } from "../models/User";
import { hashPassword, comparePassword } from "../utils/auth";
import { Request, STATUS_CODES } from "../utils/http";
import { findGym } from "../models/Gym";

const router = express.Router();

export const verifyGymAdminNonBlock = async (req: Request, res: Response, next?: NextFunction) => {
    const userGym = await findGym({ id: Number(req.params.gym_id), admin_id: req.context.user.id });
    req.context.gym = { admin: !!userGym };
    if (next) {
        next();
    }
};

export const verifyGymAdminMiddleWear = async (req: Request, res: Response, next: NextFunction) => {
    await verifyGymAdminNonBlock(req, res);
    if (!req.context.gym.admin) {
        res.status(STATUS_CODES.FORBIDDEN).send("User is not an admin of this gym");
        return;
    }
    next();
};

router.get("/verify-admin-gym/:gym_id", verifyGymAdminMiddleWear, async (req: Request, res: Response) => {
    res.status(STATUS_CODES.OK).send("User is an admin of this gym");
});

router.post("/register", async (req: Request, res: Response) => {
    const { username, password } = req.body;
    req.context.lgr.debug(`Registering user ${username}`);
    const user = await insertUser(username, await hashPassword(password));
    if (!user) {
        req.context.lgr.error("Failed to register user");
        res.status(STATUS_CODES.CONFLICT).send("Failed to register user");
        return;
    }
    const token = signJWT(user);
    res.status(STATUS_CODES.CREATED).send(token);
});

router.post("/login", async (req: Request, res: Response) => {
    const { username, password } = req.body;
    const user = await findUser(username);
    if (!user || !(await comparePassword(password, user.password))) {
        res.status(STATUS_CODES.UNAUTHORIZED).send("Invalid credentials");
        return;
    }
    const token = signJWT(user);
    req.context.lgr.debug(`Logging in user ${username}`);
    res.status(STATUS_CODES.OK).send(token);
});

const signJWT = (user: any) => {
    delete user.dataValues.password;
    return jwt.sign(user.dataValues, process.env.JWT_SECRET, { expiresIn: "24h" });
};
export default router;
