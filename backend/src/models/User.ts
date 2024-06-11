import sequelize from "../db/database";
import { DataTypes, Model } from "sequelize";
import lgr from "../utils/logger";

export type UserRole = "user" | "admin";

class User extends Model {
    id: number;
    username: string;
    password: string;
    email: string;
    firstname: string;
    surname: string;
    role: UserRole;
}
User.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        username: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        firstname: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        surname: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        role: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: "user",
        },
    },
    {
        sequelize,
        modelName: "User",
        tableName: "Users",
        timestamps: false,
    }
);

const insertUser = async (
    username: string,
    password: string,
    email: string,
    firstname: string,
    surname: string,
    role: UserRole = "user"
) => {
    try {
        console.log(username, password, role, email, firstname, surname);
        const user = await User.create({ username, password, role, email, firstname, surname });
        return user;
    } catch (error) {
        lgr.ierror("Error inserting user", error);
        return null;
    }
};

const findUser = async (username: string) => {
    try {
        const user = await User.findOne({ where: { username } });
        return user;
    } catch (error) {
        lgr.ierror("Error finding user:", error);
        return null;
    }
};

export default User;
export { insertUser, findUser };
