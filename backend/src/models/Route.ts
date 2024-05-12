import sequelize from "../db/database";
import { DataTypes, Model, Op } from "sequelize";
import lgr from "../utils/logger";
import Gym from "./Gym";
import User from "./User";

class Route extends Model {
    id: number;
    user_id: number;
    dir_id: string;
    gym_id: number;
    name: string;
}
Route.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        dir_id: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        gym_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        difficulty: {
            type: DataTypes.STRING,
            allowNull: true,
        },
    },
    {
        sequelize,
        modelName: "Route",
        tableName: "Routes",
        timestamps: false,
    }
);

const insertRoute = async (
    name: string,
    gym_id: number,
    user_id: number,
    dir_id: string,
    difficulty: string,
    route_id?: number
) => {
    try {
        const route = await Route.findOrCreate({
            where: {
                [Op.or]: [{ id: route_id }, { dir_id }],
            },
            defaults: { name, gym_id, user_id, dir_id, difficulty },
        });
        if (!route[1]) {
            return route[0].update({ id: route[0].id, name, gym_id, user_id, dir_id, difficulty });
        }

        return route[0];
    } catch (error) {
        lgr.ierror("Error inserting route", error);
        return null;
    }
};

const routeInfoParams = () => {
    return {
        attributes: ["id", "name", "gym_id", "dir_id", "difficulty"],
        include: [
            {
                model: User,
                as: "user",
                attributes: ["id", "username"],
            },
            {
                model: Gym,
                as: "gym",
                attributes: ["name"],
            },
        ],
    };
};

const findRoutes = async () => {
    try {
        return await Route.findAll(routeInfoParams());
    } catch (error) {
        lgr.ierror("Error finding routes:", error);
        return null;
    }
};

const findRoute = async (options?: { id?: number }) => {
    try {
        return await Route.findOne({
            where: { id: options.id },
            ...routeInfoParams(),
        });
    } catch (error) {
        lgr.ierror("Error finding route:", error);
        return null;
    }
};

export default Route;
export { insertRoute, findRoute, findRoutes };
