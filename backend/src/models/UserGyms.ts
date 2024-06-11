import sequelize from "../db/database";
import { DataTypes, Model } from "sequelize";

class UserGyms extends Model {
    id: number;
    admin_id: number;
    location: string;
    name: string;
}

export type UserGymRole = "ADMIN" | "EDITOR";

UserGyms.init(
    {
        user_gym_id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        gym_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        role: {
            type: DataTypes.STRING,
            allowNull: false,
        },
    },
    {
        sequelize,
        modelName: "User_Gyms",
        tableName: "User_Gyms",
        timestamps: false,
    }
);

export const insertRelation = async ({
    user_id,
    gym_id,
    role,
}: {
    user_id: number;
    gym_id: number;
    role: UserGymRole;
}) => {
    try {
        await UserGyms.create({ user_id, gym_id, role });
        return true;
    } catch (error) {
        return false;
    }
};

export const deleteRelation = async ({ user_id, gym_id }: { user_id: number; gym_id: number }) => {
    try {
        const where = { user_id, gym_id };
        const destroyed = await UserGyms.destroy({ where: where });
        return Boolean(destroyed);
    } catch (error) {
        return false;
    }
};

export default UserGyms;
