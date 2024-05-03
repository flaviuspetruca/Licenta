import express, { Response, NextFunction } from "express";
import { Request, STATUS_CODES } from "../utils/http";
import processor from "../route_processor/route_processor";
import lgr from "../utils/logger";
import { readFileSync, readdirSync } from "fs";
import { AUDIO_PATH } from "../configs/globals";
import { findRoute, findRoutes } from "../models/Route";
import { findAllHolds } from "../models/Hold";
import { __dirname } from "..";
import { AudioGenerator } from "../route_processor/audio_generator";

const router = express.Router();

const validateRoute = (req: Request, res: Response, next: NextFunction) => {
    const route = req.body;
    if (
        !route ||
        !route.positions ||
        !route.positions.length ||
        !route.matrix ||
        !route.matrix.length ||
        route.routeName === "" ||
        route.routeName === undefined
    ) {
        lgr.error("Invalid route");
        res.status(STATUS_CODES.BAD_REQUEST).send("Invalid route");
        return;
    }
    req.route = route;
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
    const dir = `${__dirname}/${AUDIO_PATH}/${route.dir_id}`;
    const matrixJson = readFileSync(`${dir}/matrix.json`, "utf8");
    const positionJson = readFileSync(`${dir}/positions.json`, "utf8");
    const audios = readdirSync(`${dir}`)
        .reduce((acc, file) => {
            if (file.endsWith(".mp3")) {
                acc.push(`${route.dir_id}/${file}`);
            }
            return acc;
        }, [] as string[])
        .sort();

    const positions = JSON.parse(positionJson);
    const matrix = JSON.parse(matrixJson);
    const audioFiles = Object.fromEntries(AudioGenerator.buildAudioData(audios, positions));
    res.status(STATUS_CODES.OK).json({ route: route.dataValues, matrix, audioFiles, positions });
});

router.get("/routes", async (req: Request, res: Response) => {
    const routes = await findRoutes();
    if (!routes) {
        res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).send("Failed to fetch routes");
        return;
    }
    res.status(STATUS_CODES.OK).json(routes);
});

router.post("/route/:id", validateRoute, async (req: Request & { route: any }, res: Response) => {
    const { audiosPath, audioFiles } = await processor.processRoute(req, req.route);
    req.context.lgr.debug("Received route");
    req.context.lgr.debug(`Parsing...`);
    res.status(STATUS_CODES.OK).json(Object.fromEntries(audioFiles));
});

export default router;
