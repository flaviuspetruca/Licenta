import express, { Response } from "express";
import { findGym, findGyms } from "../models/Gym";
import { Request, STATUS_CODES } from "../utils/http";
import { deleteRelation, insertRelation } from "../models/UserGyms";
import { findUser } from "../models/User";
import { verifyGymAdminNonBlock, verifyGymAdminMiddleWear } from "./auth";

const router = express.Router();

router.post("/user-gym/:gym_id", verifyGymAdminMiddleWear, async (req: Request, res: Response) => {
    const { username, role } = req.body;
    const gym_id = Number(req.params.gym_id);
    const user = await findUser(username);
    if (!user) {
        res.status(STATUS_CODES.BAD_REQUEST).send("Incorrect username");
        return;
    }
    const inserted = await insertRelation({ user_id: user.id, gym_id, role });
    if (!inserted) {
        res.status(STATUS_CODES.CONFLICT).send("User already has permissions to this gym");
        return;
    }
    res.status(STATUS_CODES.CREATED).send("Added user's permissions to gym");
});

router.delete("/user-gym/:gym_id", verifyGymAdminMiddleWear, async (req: Request, res: Response) => {
    const query = req.query;
    const gym_id = Number(req.params.gym_id);
    const user_id = Number(query.user_id);
    const deleted = await deleteRelation({ gym_id, user_id });
    if (!deleted) {
        res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).send("Failed to delete user-gym relation");
        return;
    }
    res.status(STATUS_CODES.OK).send("Removed user's permissions from gym");
});

router.get("/gym/:gym_id", verifyGymAdminNonBlock, async (req: Request, res: Response) => {
    const { gym_id } = req.params;
    const gym = await findGym({ id: Number(gym_id) });
    if (!gym) {
        res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).send("Failed to fetch gyms");
        return;
    }
    const gymJson = req.context.gym?.admin ? { ...gym.toJSON() } : { ...gym.toJSON(), users: [] };
    gymJson.isAdmin = !!req.context.gym?.admin;
    res.status(STATUS_CODES.OK).json(gymJson);
});

router.get("/gyms", async (req: Request, res: Response) => {
    const gyms = await findGyms();
    if (!gyms) {
        res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).send("Failed to fetch gyms");
        return;
    }
    res.status(STATUS_CODES.OK).json(gyms);
});

router.get("/gym-admin", async (req: Request, res: Response) => {
    const gyms = await findGyms(req.context.user.id);
    if (!gyms) {
        res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).send("Failed to fetch gyms");
        return;
    }
    res.status(STATUS_CODES.OK).json(gyms);
});

export default router;
