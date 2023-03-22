import models from "../models/sequelize.js";
import redisClient from "./RedisService.js";
import { ROLE } from "../models/user.js";
import AbstractService from "./AbstractService.js";
import NotFoundItemError from "../errors/NotFoundItemError.js";
import InvalidActionError from "../errors/InvalidActionError.js";

const { User } = models;

class AdminService extends AbstractService {

    roles = ROLE;
    userModel = this.models.User

    constructor(models, redisClient) {
        super(models, redisClient)
    }

    async changeUserState(id) {
        let user = await this.userModel.findByPk(id);

        if (!(user instanceof this.userModel)) {
            throw new NotFoundItemError("User cannot be found.");
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
            throw new NotFoundItemError("User cannot be found.");
        }

        if (Object.values(this.roles).indexOf(role) === -1) {
            throw new InvalidActionError("Selected role is invalid.");
        }

        if (role === ROLE.USER) {
            const users = JSON.parse(await this.client.get('users')).filter(user => user.role === ROLE.ADMIN);
            if (users.length < 2) {
                throw new InvalidActionError("You have to point new admin out first.");
            }
        }

        await user.update({
            role
        })

        user = await user.reload();
        await this.updateCache(user);

        return user;
    }

    async getUsers(search) {
        let users = JSON.parse(await this.client.get('users'));
        if (search) {
            users = users.filter(user => user.username.includes(search) || user.email.includes(search));
        }

        return users;
    }

}

export default new AdminService(models, redisClient);