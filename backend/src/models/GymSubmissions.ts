import sequelize from "../db/database";
import { DataTypes, Model } from "sequelize";
import lgr from "../utils/logger";

export type GymSubmissionStatus = "PENDING" | "APPROVED" | "REJECTED";

class GymSubmission extends Model {
    id: number;
    admin_id: number;
    location: string;
    name: string;
    thumbnail: string;
    status: string;
    user_id: number;
}
GymSubmission.init(
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
        thumbnail: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        status: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: "PENDING",
        },
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
    },
    {
        sequelize,
        modelName: "Gym_Submissions",
        tableName: "Gym_Submissions",
        timestamps: false,
    }
);

const insertGymSubmission = async (name: string, location: string, thumbnail: string, user_id: number) => {
    try {
        const gym = await GymSubmission.create({ name, location, thumbnail, user_id });
        return gym;
    } catch (error) {
        lgr.ierror("Error inserting gym", error);
        return null;
    }
};

const findGymSubmissions = async () => {
    try {
        const gyms = await GymSubmission.findAll();
        return gyms;
    } catch (error) {
        lgr.ierror("Error fetching gyms", error);
        return null;
    }
};

const findGymSubmission = async ({ id }: { id?: number }) => {
    try {
        const gym = await GymSubmission.findOne({
            where: { id },
        });
        return gym;
    } catch (error) {
        lgr.ierror("Error fetching gym", error);
        return null;
    }
};

const updateGymSubmission = async (id: number, status: string) => {
    try {
        const gym = await GymSubmission.update({ status }, { where: { id } });
        return gym;
    } catch (error) {
        lgr.ierror("Error updating gym", error);
        return null;
    }
};

export default GymSubmission;
export { insertGymSubmission, findGymSubmissions, findGymSubmission, updateGymSubmission };
