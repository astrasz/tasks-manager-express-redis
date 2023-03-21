import models from "../models/sequelize.js";
import { DEFAULT_EXPIRATION } from "./redis.js";
import redisClient from "./redis.js";

const { User } = models;

class AdminService {

    expiration = DEFAULT_EXPIRATION;


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



}

export default new AdminService(User, redisClient);