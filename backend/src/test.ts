import { Sequelize, DataTypes, Model } from "sequelize";
// Initialize Sequelize with database credentials
const sequelize = new Sequelize("Test", "postgres", "root", {
    host: "localhost",
    dialect: "postgres",
});

// Define models for Routes, Gyms, and Users
class Users extends Model {}
Users.init(
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        username: {
            type: DataTypes.STRING,
        },
    },
    {
        sequelize,
        modelName: "User",
        tableName: "Users",
        timestamps: false,
    }
);

class Gyms extends Model {}
Gyms.init(
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        admin_id: {
            type: DataTypes.INTEGER,
        },
        location: {
            type: DataTypes.STRING,
        },
        name: {
            type: DataTypes.STRING,
        },
    },
    {
        sequelize,
        modelName: "Gym",
        tableName: "Gyms",
        timestamps: false,
    }
);

class Routes extends Model {}
Routes.init(
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        dir_id: {
            type: DataTypes.UUID,
        },
        name: {
            type: DataTypes.STRING,
        },
        user_id: {
            type: DataTypes.INTEGER,
        },
        gym_id: {
            type: DataTypes.INTEGER,
        },
    },
    {
        sequelize,
        modelName: "Route",
        tableName: "Routes",
        timestamps: false,
    }
);

// Define the intermediate table for the many-to-many relationship
class UserGym extends Model {}
UserGym.init(
    {
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        gymId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
    },
    {
        sequelize,
        modelName: "UserGym",
        tableName: "UserGyms",
        timestamps: false,
    }
);

// Define associations between Users, Gyms, and the intermediate table
Users.belongsToMany(Gyms, { through: UserGym, foreignKey: "userId", otherKey: "gymId" });
Gyms.belongsToMany(Users, { through: UserGym, foreignKey: "gymId", otherKey: "userId" });

// Set up associations between models
Routes.belongsTo(Gyms, { foreignKey: "gym_id", as: "gymData" });
Routes.belongsTo(Users, { foreignKey: "user_id", as: "userData" });

//sequelize.sync();
// Query with associations
Routes.findAll({
    include: [
        {
            model: Users,
            as: "userData",
            attributes: ["username"],
        },
        {
            model: Gyms,
            as: "gymData",
        },
    ],
    attributes: ["id", "dir_id", "name"],
})
    .then((routes) => {
        // Handle the results
        console.log(routes[0].dataValues);
    })
    .catch((err) => {
        // Handle any errors
        console.error("Error fetching data:", err);
    });
