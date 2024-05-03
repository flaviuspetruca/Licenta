import express, { Response } from "express";
import Gym, { findGyms } from "../models/Gym";
import { Request, STATUS_CODES } from "../utils/http";

const router = express.Router();

router.get("/gym/:id", async (req: Request, res: Response) => {
    const { id } = req.params;
    const gym = await findGyms({ id: parseInt(id) });
    if (!gym) {
        res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).send("Failed to fetch gyms");
        return;
    }
    res.status(STATUS_CODES.OK).json(gym);
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
    const gyms = await findGyms({ admin_id: req.context.user.id });
    if (!gyms) {
        res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).send("Failed to fetch gyms");
        return;
    }
    res.status(STATUS_CODES.OK).json(gyms);
});

export default router;
