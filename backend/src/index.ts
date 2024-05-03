import express from "express";
import path from "path";
import "dotenv/config";
import { fileURLToPath } from "url";
import { PORT } from "./configs/globals";
import lgr from "./utils/logger";
import db from "./db/database";
import "./db/assosciations";
import setupMiddleware from "./middleware/middleware";

export const app = express();
export const router = express.Router();
export const __dirname = path.dirname(fileURLToPath(import.meta.url));

const initApp = async () => {
    try {
        await db.authenticate();
        lgr.iprint("Connection has been established successfully.");
    } catch (error) {
        console.error("Unable to connect to the database:", error.original);
        return;
    }

    try {
        setupMiddleware(app);
    } catch (error) {
        lgr.ierror("Error setting up middleware:", error);
        return;
    }

    try {
        app.listen(PORT, () => {
            lgr.iprint(`Server is running on port ${PORT}`);
        });
    } catch (error) {
        lgr.ierror("Error starting server:", error);
    }
};

initApp();
