import sequelize from "../db/database";
import { DataTypes, Model } from "sequelize";
import lgr from "../utils/logger";
import User from "./User";
import Route from "./Route";

class Gym extends Model {
    id: number;
    admin_id: number;
    location: string;
    name: string;
}
Gym.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        admin_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        location: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
    },
    {
        sequelize,
        modelName: "Gym",
        tableName: "Gyms",
        timestamps: false,
    }
);

const insertGym = async () => {
    try {
        await Gym.create();
        return;
    } catch (error) {
        lgr.ierror("Error inserting gym", error);
        return null;
    }
};
const baseQueryOptions = () => {
    return {
        attributes: ["id", "name", "location", [sequelize.fn("COUNT", sequelize.col("routes.id")), "nr_routes"]],
        include: [
            {
                model: User,
                as: "users",
                attributes: ["username"],
                through: { attributes: [] },
            },
        ],
        group: ["Gym.id", "users.id"],
    };
};

const extraIncludeOptions = () => {
    return {
        model: Route,
        as: "routes",
        include: [
            {
                model: User,
                as: "user",
                attributes: ["username"],
            },
            {
                model: Gym,
                as: "gym",
                attributes: ["name"],
            },
        ],
    };
};

const findGymss = async (options?: { user_id?: number; gym_id?: number }) => {
    try {
        let queryOptions: any = { ...baseQueryOptions() };

        if (options?.user_id !== undefined) {
            queryOptions = {
                ...queryOptions,
                where: { admin_id: options.user_id },
                include: [
                    ...queryOptions.include,
                    {
                        model: Route,
                        as: "routes",
                        attributes: [],
                    },
                ],
            };
        } else if (options?.gym_id !== undefined) {
            queryOptions = {
                ...queryOptions,
                where: { id: options.gym_id },
                include: [...queryOptions.include, extraIncludeOptions()],
                group: [...queryOptions.group, "routes.id", "routes->user.id", "routes->gym.id"],
            };
        } else {
            queryOptions = {
                ...queryOptions,
                include: [...queryOptions.include, extraIncludeOptions()],
                group: [...queryOptions.group, "routes.id", "routes->user.id", "routes->gym.id"],
            };
        }

        return options?.gym_id !== undefined ? await Gym.findOne(queryOptions) : await Gym.findAll(queryOptions);
    } catch (error) {
        lgr.error("Error finding gyms", error);
        return null;
    }
};

type WhereOptions = { id?: number; admin_id?: number };
const findGyms = async (options?: WhereOptions) => {
    try {
        let queryOptions: any = { ...baseQueryOptions() };

        if (options?.admin_id !== undefined || options?.id !== undefined) {
            queryOptions = {
                ...queryOptions,
                where: options,
                include: [...queryOptions.include, extraIncludeOptions()],
                group: [...queryOptions.group, "routes.id", "routes->user.id", "routes->gym.id"],
            };
        } else {
            queryOptions = {
                ...queryOptions,
                include: [
                    ...queryOptions.include,
                    {
                        model: Route,
                        as: "routes",
                        attributes: [],
                    },
                ],
                group: [...queryOptions.group, "routes.id"],
            };
        }

        return options?.id !== undefined ? await Gym.findOne(queryOptions) : await Gym.findAll(queryOptions);
    } catch (error) {
        lgr.error("Error finding gyms", error);
        return null;
    }
};

export default Gym;
export { insertGym, findGyms };
