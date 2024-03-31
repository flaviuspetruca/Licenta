import express, { Response } from "express";
import { Request } from "./configs/types";
import cors from "cors";
import {
    AUDIO_PATH,
    IMAGE_HOLDS_PATH,
    PORT,
    STATUS_CODES,
} from "./configs/globals";
import path from "path";
import { fileURLToPath } from "url";
import lgr from "./utils/logger";
import { uuid_mapper } from "./utils/http";
import RouteProcessor from "./route_processor/route_processor";
import holds from "./configs/holds.json";
import { readFile, readFileSync, writeFileSync } from "fs";

export const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

app.use(uuid_mapper);
app.use(cors());
app.use(express.json());
app.use(
    "/holds-images",
    express.static(path.join(__dirname, IMAGE_HOLDS_PATH))
);
app.use("/audio", express.static(path.join(__dirname, AUDIO_PATH)));

app.listen(PORT, () => {
    lgr.print(`Server is running on port ${PORT}`);
});

app.get("/", (req: Request, res: Response) => {
    lgr.debug(req, "Server is running...");
    res.status(STATUS_CODES.OK).send("Server is running...");
});

app.get("/holds-info", (req: Request, res: Response) => {
    lgr.debug(req, "Sending holds to client...");
    res.status(STATUS_CODES.OK).json(holds);
});

app.post("/route", async (req: Request, res: Response) => {
    const route = req.body;
    const processor = new RouteProcessor(route);
    const audioFiles = await processor.processRoute();

    // DEBUG PURPOSES ONLY
    // write to json file the array of audio files
    //const debugFiles = readFileSync("audioFiles.json", "utf-8");
    //const audioFiles = JSON.parse(debugFiles);

    lgr.debug(req, "Received route");
    lgr.debug(req, `Parsing...`);
    res.status(STATUS_CODES.OK).json(Object.fromEntries(audioFiles));
});
