import db from "./database";
import User from "../models/User";
import Gym from "../models/Gym";
import UserGyms from "../models/UserGyms";
import Route from "../models/Route";
import lgr from "../utils/logger";

Route.belongsTo(Gym, { as: "gym", foreignKey: "gym_id" });
Route.belongsTo(User, { as: "user", foreignKey: "user_id" });

Gym.hasMany(Route, { as: "routes", foreignKey: "gym_id" });
Gym.belongsToMany(User, { as: "users", through: UserGyms, foreignKey: "gym_id" });
User.belongsToMany(Gym, { through: UserGyms, foreignKey: "user_id" });

(async () => {
    await db.sync({ logging: true });
    lgr.iprint("Database synchronized");
})();
