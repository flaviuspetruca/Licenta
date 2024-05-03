import jwt from "jsonwebtoken";
import express, { Response } from "express";
import { insertUser, findUser } from "../models/User";
import { hashPassword, comparePassword } from "../utils/auth";
import { Request, STATUS_CODES } from "../utils/http";
import { findGyms } from "../models/Gym";

const router = express.Router();

router.get("/verify-admin/:id", async (req: Request, res: Response) => {
    const gym_id = Number(req.params.id);
    const { id } = req.context.user;
    const userGym = await findGyms({ id: gym_id, admin_id: id });
    if (!userGym) {
        res.status(STATUS_CODES.FORBIDDEN).send("User is not an admin of this gym");
        return;
    }
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
    const token = jwt.sign({ username, role: user.role }, process.env.JWT_SECRET, { expiresIn: "24h" });
    res.status(STATUS_CODES.CREATED).send(token);
});

router.post("/login", async (req: Request, res: Response) => {
    const { username, password } = req.body;
    const user = await findUser(username);
    if (!user || !(await comparePassword(password, user.password))) {
        res.status(STATUS_CODES.UNAUTHORIZED).send("Invalid credentials");
        return;
    }
    delete user.dataValues.password;
    const token = jwt.sign(user.dataValues, process.env.JWT_SECRET, { expiresIn: "24h" });
    req.context.lgr.debug(`Logging in user ${username}`);
    res.status(STATUS_CODES.OK).send(token);
});

export default router;
