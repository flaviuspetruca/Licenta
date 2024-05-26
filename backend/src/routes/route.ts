import express, { Response, NextFunction } from "express";
import { readFileSync } from "fs";
import path from "path";
import { __dirname } from "..";
import { randomUUID } from "crypto";
import FormData from "form-data";
import { verifyGymAdminMiddleWear, verifyGymAdminNonBlock } from "./auth";
import lgr from "../utils/logger";
import { Request, STATUS_CODES } from "../utils/http";
import { addFilesToZip, unpackZip } from "../utils/utils";
import {
    AUDIO_PATH,
    AZURE_ASSETS,
    AZURE_ROUTE_IMAGES,
    AZURE_TMP,
    END_AUDIO,
    NEXT_POSITION_AUDIO,
} from "../configs/globals";
import { findAllHolds } from "../models/Hold";
import { findRoute, findRoutes, insertRoute } from "../models/Route";
import processor from "../route_processor/route_processor";
import { downloadFile, moveDir, uploadFile } from "../azure/connection";
import { AudioGenerator } from "../route_processor/audio_generator";
import multer from "multer";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

const validateRoute = (req: Request, res: Response, next: NextFunction) => {
    const route = req.body;
    if (!route || !route.positions || !route.positions.length || !route.matrix || !route.matrix.length) {
        lgr.error("Invalid route");
        res.status(STATUS_CODES.BAD_REQUEST).send("Invalid route");
        return;
    }
    req.context.route = route;
    next();
};

const getContainerRouteData = async (dir_id: string) => {
    try {
        const response = await downloadFile(AZURE_ASSETS, `${dir_id}/${dir_id}.zip`);
        return await unpackZip(response);
    } catch (error) {
        lgr.error("Error serving route data:", error);
        return null;
    }
};

const saveRoute = async (
    routeName: string,
    gym_id: number,
    user_id: number,
    dir_id: string,
    difficulty: string,
    thumbnail: string,
    route_id?: number
) => {
    const route = await insertRoute(routeName, gym_id, user_id, dir_id, difficulty, thumbnail, route_id);
    if (!route) {
        return false;
    }
    const result = await moveDir(AZURE_TMP, AZURE_ASSETS, dir_id);
    if (!result) {
        return false;
    }
    return route;
};

const uploadMiddleWare = (req: Request, res: Response, next: NextFunction) => {
    const file = req.file;
    if (req.file.mimetype !== "image/jpeg" && req.file.mimetype !== "image/png") {
        res.status(STATUS_CODES.BAD_REQUEST).send("Invalid file type");
        return;
    }
    const randomId = randomUUID();
    const extension = file.originalname.split(".").pop();

    const uploaded = uploadFile(AZURE_ROUTE_IMAGES, file.buffer, `${randomId}.${extension}`);
    if (!uploaded) {
        res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).send("Failed to upload file");
        return;
    }
    req.context.route_thumbnail = `${randomId}.${extension}`;
    next();
};

router.get("/holds-info", async (req: Request, res: Response) => {
    req.context.lgr.debug("Sending holds to client...");
    const holds = await findAllHolds();
    res.status(STATUS_CODES.OK).json(holds);
});

router.get("/route/:id", async (req: Request, res: Response) => {
    const { id } = req.params;
    const route = await findRoute({ id: parseInt(id) });
    if (!route) {
        res.status(STATUS_CODES.NOT_FOUND).send("Failed to fetch route");
        return;
    }

    req.params.gym_id = route.gym_id.toString();
    await verifyGymAdminNonBlock(req, res);
    let routeData = await getContainerRouteData(route.dir_id);
    if (!routeData) {
        res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).send("Failed to fetch route");
        return;
    }

    const positionJson = JSON.parse(routeData.find((file: any) => file.name === "positions.json").content.toString());
    const matrixJson = JSON.parse(routeData.find((file: any) => file.name === "matrix.json").content.toString());
    routeData = routeData.filter((file: any) => file.name !== "positions.json" && file.name !== "matrix.json");

    const admin = req.context.gym?.admin;

    const generatedData = AudioGenerator.buildAudioData(
        routeData.map((file: any) => file.name),
        positionJson
    );

    const jsonData = {
        route: route,
        admin,
        matrix: matrixJson,
        positions: positionJson,
        data: generatedData,
        path: route.dir_id,
    };

    const formData = new FormData();

    formData.append("json_data", JSON.stringify(jsonData), {
        contentType: "application/json",
    });

    routeData.forEach((file: any) => {
        formData.append("audio_blob", file.content, {
            filename: file.name,
            contentType: "application/octet-stream",
        });
    });

    const endAudio = readFileSync(path.join(__dirname, AUDIO_PATH, END_AUDIO));
    const nextAudio = readFileSync(path.join(__dirname, AUDIO_PATH, NEXT_POSITION_AUDIO));
    formData.append("audio_blob", endAudio, {
        filename: END_AUDIO,
        contentType: "application/octet-stream",
    });

    formData.append("audio_blob", nextAudio, {
        filename: NEXT_POSITION_AUDIO,
        contentType: "application/octet-stream",
    });

    const thumbnail = await downloadFile(AZURE_ROUTE_IMAGES, route.thumbnail);
    formData.append("thumbnail", thumbnail, {
        filename: route.thumbnail,
        contentType: "application/octet-stream",
    });

    res.set("Content-Type", "multipart/form-data; boundary=" + formData.getBoundary());

    formData.pipe(res);
});

router.get("/routes", async (req: Request, res: Response) => {
    const routes = await findRoutes();
    if (!routes) {
        res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).send("Failed to fetch routes");
        return;
    }

    const formData = new FormData();

    formData.append("json_data", JSON.stringify(routes), {
        contentType: "application/json",
    });

    for (let route of routes) {
        const thumbnail = await downloadFile(AZURE_ROUTE_IMAGES, route.thumbnail);
        formData.append("thumbnail", thumbnail, {
            filename: route.thumbnail,
            contentType: "application/octet-stream",
        });
    }

    res.set("Content-Type", "multipart/form-data; boundary=" + formData.getBoundary());

    formData.pipe(res);
});

router.post(
    "/save-route/:gym_id",
    verifyGymAdminMiddleWear,
    upload.single("file"),
    uploadMiddleWare,
    async (req: Request, res: Response) => {
        req.context.lgr.debug("Saving route...");
        const gym_id = Number(req.params.gym_id);
        const dir_id = req.body.dir_id;
        const route_id = req.body.route_id && Number(req.body.route_id);
        const routeName = req.body.routeName;
        const difficulty = req.body.difficulty;
        const user_id = req.context.user.id;
        const thumbnail = req.context.route_thumbnail;
        const route = await saveRoute(routeName, gym_id, user_id, dir_id, difficulty, thumbnail, route_id);
        if (!route) {
            res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).send("Failed to save route");
            return;
        }
        res.status(STATUS_CODES.OK).json(route);
    }
);

router.post("/route/:gym_id", verifyGymAdminMiddleWear, validateRoute, async (req: Request, res: Response) => {
    const { audioFilesZip, processedPositions } = await processor.processRoute(req.context.route);
    const unpackedZip = await unpackZip(Buffer.from(await audioFilesZip.arrayBuffer()));

    const generatedData = AudioGenerator.buildAudioData(
        unpackedZip.map((file: any) => file.name),
        processedPositions
    );

    const matrixBlobData = { name: "matrix.json", content: Buffer.from(JSON.stringify(req.context.route.matrix)) };
    const positionsBlobData = {
        name: "positions.json",
        content: Buffer.from(JSON.stringify(req.context.route.positions)),
    };
    const updatedZip = await addFilesToZip(audioFilesZip, [matrixBlobData, positionsBlobData]);
    if (!updatedZip) {
        res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).send("Failed to add data to zip");
        return;
    }
    const uuid = randomUUID();
    const uploaded = await uploadFile(AZURE_TMP, updatedZip, `${uuid}/${uuid}.zip`);
    if (!uploaded) {
        res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).send("Failed to upload zip data");
        return;
    }

    const formData = new FormData();

    formData.append("json_data", JSON.stringify({ path: uuid, data: generatedData }), {
        contentType: "application/json",
    });

    unpackedZip.forEach((file: any) => {
        formData.append("audio_blob", file.content, {
            filename: file.name,
            contentType: "application/octet-stream",
        });
    });

    const endAudio = readFileSync(path.join(__dirname, AUDIO_PATH, END_AUDIO));
    const nextAudio = readFileSync(path.join(__dirname, AUDIO_PATH, NEXT_POSITION_AUDIO));
    formData.append("audio_blob", endAudio, {
        filename: END_AUDIO,
        contentType: "application/octet-stream",
    });

    formData.append("audio_blob", nextAudio, {
        filename: NEXT_POSITION_AUDIO,
        contentType: "application/octet-stream",
    });

    res.set("Content-Type", "multipart/form-data; boundary=" + formData.getBoundary());

    formData.pipe(res);
});

export default router;
