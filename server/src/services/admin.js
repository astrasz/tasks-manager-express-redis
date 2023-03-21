import models from "../models/sequelize.js";
import { DEFAULT_EXPIRATION } from "./redis.js";
import redisClient from "./redis.js";
import { ROLE } from "../models/user.js";
import AppError from "../errors/appError.js";

const { User } = models;

class AdminService {

    expiration = DEFAULT_EXPIRATION;
    roles = ROLE;


    constructor(userModel, redisClient) {
        this.userModel = userModel;
        this.client = redisClient;
    }

    async updateCache(user = null, userId = null) {
        if (user) {
            const cacheKey = `users:${user.id}`;
            await this.client.set(cacheKey, JSON.stringify(user), { EX: this.expiration });
        }

        if (userId) {
            const cacheKey = `users:${userId}`;
            const isSet = this.client.keys(cacheKey);
            isSet && await this.client.del(cacheKey);
        }

        await this.client.del('users');
    }

    async changeUserState(id) {
        let user = await this.userModel.findByPk(id);

        if (!(user instanceof this.userModel)) {
            throw new AppError("User cannot be found.", 400);
        }

        await user.update({
            isActive: !user.isActive
        })

        user = await user.reload();
        await this.updateCache(user);

        return user;
    }

    async changeUserRole(id, role) {

        let user = await this.userModel.findByPk(id);

        if (!(user instanceof this.userModel)) {
            throw new AppError("User cannot be found.", 400);
        }

        if (Object.values(this.roles).indexOf(role) === -1) {
            throw new AppError("Selected role is invalid.", 400)
        }

        if (role === ROLE.USER) {
            const users = JSON.parse(await this.client.get('users')).filter(user => user.role === ROLE.ADMIN);
            if (users.length < 2) {
                throw new AppError("You have to point new admin out first.", 400);
            }
        }

        await user.update({
            role
        })

        user = await user.reload();
        await this.updateCache(user);

        return user;
    }

}

export default new AdminService(User, redisClient);