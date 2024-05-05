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

// TODO: nested data removal
const findGym = async ({ id, admin_id }: { id?: number; admin_id?: number }) => {
    const where = admin_id ? { "$users.data.role$": "ADMIN", "$users.id$": admin_id } : {};
    const gym = await Gym.findOne({
        where: { id, ...where },
        attributes: ["id", "name", "location", [sequelize.fn("COUNT", sequelize.col("routes.id")), "nr_routes"]],
        include: [
            {
                model: User,
                as: "users",
                attributes: ["id", "username"],
                through: { attributes: ["role"], as: "data" },
            },
            {
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
            },
        ],
        group: ["Gym.id", "users.id", "routes.id", "routes->user.id", "users->data.user_gym_id", "routes->gym.id"],
    });
    return gym;
};

const findGyms = async (user_id?: number) => {
    const where = user_id ? { "$users.data.role$": "ADMIN", "$users.id$": user_id } : {};
    const gyms = await Gym.findAll({
        attributes: ["id", "name", "location", [sequelize.fn("COUNT", sequelize.col("routes.id")), "nr_routes"]],
        include: [
            {
                model: User,
                as: "users",
                attributes: ["id", "username"],
                through: { attributes: ["role"], as: "data" },
            },
            {
                model: Route,
                as: "routes",
                include: [
                    {
                        model: User,
                        as: "user",
                        attributes: ["username"],
                    },
                ],
            },
        ],
        where: where,
        group: ["Gym.id", "users.id", "routes.id", "routes->user.id", "users->data.user_gym_id"],
    });
    return gyms;
};

export default Gym;
export { insertGym, findGyms, findGym };
