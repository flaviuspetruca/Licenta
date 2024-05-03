import sequelize from "../db/database";
import { DataTypes, Model } from "sequelize";

class UserGyms extends Model {
    id: number;
    admin_id: number;
    location: string;
    name: string;
}
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
    },
    {
        sequelize,
        modelName: "User_Gyms",
        tableName: "User_Gyms",
        timestamps: false,
    }
);

export default UserGyms;
