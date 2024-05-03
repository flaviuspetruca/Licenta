import sequelize from "../db/database";
import { DataTypes, Model } from "sequelize";
import lgr from "../utils/logger";
import { Difficulty, HoldType, Size } from "../configs/types";

class Hold extends Model {
    id: number;
    image_format: string;
    image_name: string;
    difficulty: Difficulty;
    type: HoldType;
    size: Size;
}
Hold.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        difficulty: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        type: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        size: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        image_format: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        image_name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
    },
    {
        sequelize,
        modelName: "Hold",
        tableName: "Holds",
        timestamps: false,
    }
);

const insertHold = async (difficulty: string, type: string, size: string, image_format: string, image_name: string) => {
    try {
        await Hold.create({ difficulty, type, size, image_format, image_name });
        return { difficulty, type, size, image_format, image_name };
    } catch (error) {
        lgr.ierror("Error inserting hold", error);
        return null;
    }
};

const findAllHolds = async () => {
    try {
        const holds = await Hold.findAll();
        return holds;
    } catch (error) {
        lgr.ierror("Error finding holds:", error);
        return null;
    }
};

export default Hold;
export { insertHold, findAllHolds };
