import express, { NextFunction, Response } from "express";
import { findGym, findGyms, insertGym } from "../models/Gym";
import { Request, STATUS_CODES } from "../utils/http";
import { deleteRelation, insertRelation } from "../models/UserGyms";
import { findUser } from "../models/User";
import { verifyGymAdminNonBlock, verifyGymAdminMiddleWear } from "./auth";
import multer from "multer";
import { downloadFile, uploadFile } from "../azure/connection";
import { randomUUID } from "crypto";
import { AZURE_GYM_IMAGES } from "../configs/globals";
import FormData from "form-data";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

const uploadMiddleWare = (req: Request, res: Response, next: NextFunction) => {
    const file = req.file;
    if (req.file.mimetype !== "image/jpeg" && req.file.mimetype !== "image/png") {
        res.status(STATUS_CODES.BAD_REQUEST).send("Invalid file type");
        return;
    }
    const randomId = randomUUID();
    const extension = file.originalname.split(".").pop();

    //compress file before uploading
    // const compressed = sharp(file.buffer).resize(200, 200).toBuffer();
    const uploaded = uploadFile(AZURE_GYM_IMAGES, file.buffer, `${randomId}.${extension}`);
    if (!uploaded) {
        res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).send("Failed to upload file");
        return;
    }
    req.context.gym_thumbnail = `${randomId}.${extension}`;
    next();
};

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
    const thumbnail = await downloadFile(AZURE_GYM_IMAGES, gym.thumbnail);

    const formData = new FormData();

    formData.append("json_data", JSON.stringify(gymJson), {
        contentType: "application/json",
    });

    formData.append("thumbnail", thumbnail, {
        filename: gym.thumbnail,
        contentType: "application/octet-stream",
    });

    res.set("Content-Type", "multipart/form-data; boundary=" + formData.getBoundary());

    formData.pipe(res);
});

router.get("/gyms", async (req: Request, res: Response) => {
    const gyms = await findGyms();
    if (!gyms) {
        res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).send("Failed to fetch gyms");
        return;
    }
    const formData = new FormData();

    formData.append("json_data", JSON.stringify(gyms), {
        contentType: "application/json",
    });

    for (let gym of gyms) {
        const thumbnail = await downloadFile(AZURE_GYM_IMAGES, gym.thumbnail);
        formData.append("thumbnail", thumbnail, {
            filename: gym.thumbnail,
            contentType: "application/octet-stream",
        });
    }

    res.set("Content-Type", "multipart/form-data; boundary=" + formData.getBoundary());

    formData.pipe(res);
});

router.get("/gym-admin", async (req: Request, res: Response) => {
    const gyms = await findGyms(req.context.user.id);
    if (!gyms) {
        res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).send("Failed to fetch gyms");
        return;
    }
    const formData = new FormData();
    formData.append("json_data", JSON.stringify(gyms), {
        contentType: "application/json",
    });

    for (let gym of gyms) {
        const thumbnail = await downloadFile(AZURE_GYM_IMAGES, gym.thumbnail);
        formData.append("thumbnail", thumbnail, {
            filename: gym.thumbnail,
            contentType: "application/octet-stream",
        });
    }

    res.set("Content-Type", "multipart/form-data; boundary=" + formData.getBoundary());

    formData.pipe(res);
});

router.post("/gym", upload.single("file"), uploadMiddleWare, async (req: Request, res: Response) => {
    const { name, location } = req.body;
    const gym = await insertGym(name, location, req.context.gym_thumbnail);
    const gym_user = await insertRelation({ user_id: req.context.user.id, gym_id: gym.id, role: "ADMIN" });
    if (!gym || !gym_user) {
        res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).send("Failed to insert gym");
        return;
    }
    res.status(STATUS_CODES.CREATED).json(gym);
});

export default router;
