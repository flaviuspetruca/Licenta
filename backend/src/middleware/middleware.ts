// middleware.ts
import express from "express";
import cors from "cors";
import path from "path";
import { uuid_mapper } from "../utils/http";
import { AUDIO_PATH, IMAGE_HOLDS_PATH } from "../configs/globals";
import { __dirname } from "..";
import { authorization } from "../utils/auth";
import { logger_middleware } from "../utils/http";
import auth from "../routes/auth";
import gym from "../routes/gym";
import route from "../routes/route";

const setupMiddleware = (app: express.Application) => {
    app.use(cors());
    app.use(uuid_mapper);
    app.use(logger_middleware);
    app.use(authorization);
    app.use(express.json());
    app.use("/", auth);
    app.use("/", gym);
    app.use("/", route);
    app.use("/holds-images", express.static(path.join(__dirname, IMAGE_HOLDS_PATH)));
    app.use("/audio", express.static(path.join(__dirname, AUDIO_PATH)));
};

export default setupMiddleware;
