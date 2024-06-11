import jwt from "jsonwebtoken";
import express, { NextFunction, Response } from "express";
import User, { insertUser, findUser } from "../models/User";
import { hashPassword, comparePassword } from "../utils/auth";
import { Request, STATUS_CODES } from "../utils/http";
import { findGym } from "../models/Gym";
import { FRONT_END } from "../configs/globals";
import { transporter } from "../utils/mailer";

const router = express.Router();

export const verifyAdmin = async (req: Request, res: Response, next: NextFunction) => {
    if (req.context.user.role !== "admin") {
        res.status(STATUS_CODES.FORBIDDEN).send("User is not an admin");
        return;
    }
    next();
};

export const appendGymUserRoleNonBlock = async (req: Request, res: Response, next?: NextFunction) => {
    const userGym: any = await findGym({ id: Number(req.params.gym_id), user_id: req.context.user.id });

    if (!userGym || userGym.users.length === 0) {
        req.context.gym = { userRole: null };
    } else {
        req.context.gym = { userRole: userGym.users[0].data.role };
    }

    if (next) {
        next();
    }
};

export const verifyGymAdmin = async (req: Request, res: Response, next: NextFunction) => {
    await appendGymUserRoleNonBlock(req, res);
    if (!req.context.gym.userRole && req.context.gym.userRole !== "ADMIN") {
        res.status(STATUS_CODES.FORBIDDEN).send("User is not an admin of this gym");
        return;
    }
    next();
};

export const verifyGymEditPermissions = async (req: Request, res: Response, next: NextFunction) => {
    await appendGymUserRoleNonBlock(req, res);
    if (!req.context.gym.userRole && req.context.gym.userRole !== "ADMIN" && req.context.gym.userRole !== "EDITOR") {
        res.status(STATUS_CODES.FORBIDDEN).send("User does not have the right permissions");
        return;
    }
    next();
};

router.get("/verify-admin-gym/:gym_id", verifyGymAdmin, async (req: Request, res: Response) => {
    res.status(STATUS_CODES.OK).send("User is an admin of this gym");
});

// TO DO throw error message if user or email already exists
router.post("/register", async (req: Request, res: Response) => {
    const { username, password, email, firstname, surname } = req.body;
    req.context.lgr.debug(`Registering user ${username}`);
    const user = await insertUser(username, await hashPassword(password), email, firstname, surname);
    if (!user) {
        req.context.lgr.error("Failed to register user");
        res.status(STATUS_CODES.CONFLICT).send("Failed to register user");
        return;
    }
    const token = signJWT(user);
    res.status(STATUS_CODES.CREATED).send(token);
});

router.post("/login", async (req: Request, res: Response) => {
    const { username, password } = req.body;
    const user = await findUser(username);
    if (!user || !(await comparePassword(password, user.password))) {
        res.status(STATUS_CODES.UNAUTHORIZED).send("Invalid credentials");
        return;
    }
    const token = signJWT(user);
    req.context.lgr.debug(`Logging in user ${username}`);
    res.status(STATUS_CODES.OK).send(token);
});

router.post("/forgot-password", async (req: Request, res: Response) => {
    const { email } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user) {
        res.status(STATUS_CODES.NOT_FOUND).send("User not found");
        return;
    }

    const token = signJWT(user);

    const resetLink = `${FRONT_END}/reset-password?token=${token}`;

    const mailOptions = {
        from: "no-reply@yourapp.com",
        to: user.email,
        subject: "Password Reset",
        html: `
        <p>You are receiving this because you (or someone else) have requested the reset of the password for your account.</p>
        <p>Please click on the following link, or paste this into your browser to complete the process:</p>
        <a href="${resetLink}">${resetLink}</a>
        <p>If you did not request this, please ignore this email and your password will remain unchanged.</p>
    `,
    };

    await transporter.sendMail(mailOptions);

    res.status(STATUS_CODES.OK).send("Email sent");
});

router.post("/reset-password", async (req: Request, res: Response) => {
    const { token, password } = req.body;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded) {
        res.status(STATUS_CODES.UNAUTHORIZED).send("Invalid token");
        return;
    }
    const decodedUser = decoded as User;
    const user = await findUser(decodedUser.username);
    if (!user) {
        res.status(STATUS_CODES.NOT_FOUND).send("User not found");
        return;
    }
    user.password = await hashPassword(password);
    await user.save();
    res.status(STATUS_CODES.OK).send("Password reset");
});

const signJWT = (user: any) => {
    delete user.dataValues.password;
    return jwt.sign(user.dataValues, process.env.JWT_SECRET, { expiresIn: "24h" });
};
export default router;
