import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Request, WHITELISTED_ROUTES } from "./http";
import { NextFunction, Response } from "express";

const checkRoute = (req: any) => {
    const root = req.url.split("/")[1].split("?")[0];
    return WHITELISTED_ROUTES.find((route) => route === root);
};

export const authorization = (req: Request, res: Response, next: NextFunction) => {
    if (checkRoute(req)) return next();

    let token = req.headers.authorization;
    token = token?.split(" ")[1];
    if (!token) return res.status(401).send("Unauthorized");

    jwt.verify(token, process.env.JWT_SECRET, (err: any, decoded: any) => {
        if (err) return res.status(401).send("Unauthorized");
        req.context.user = decoded;
        next();
    });
};

export const hashPassword = async (password: string) => {
    return await bcrypt.hash(password, Number(process.env.PASSWORD_SALT_ROUNDS));
};

export const comparePassword = async (password: string, hash: string) => {
    return await bcrypt.compare(password, hash);
};
