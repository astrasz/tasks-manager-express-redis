import bcrypt from 'bcrypt';
import { Op } from 'sequelize';
import CustomError from '../errors/customError.js';
import models from '../models/sequelize.js';


class AuthService {

    constructor() {
        this.saltRounds = 10;
    }

    async getHashedPass(pass) {
        const hashedPass = await bcrypt.hash(pass, this.saltRounds);

        return hashedPass;
    }

    async checkRegistrationData(username, email, password, repeatedPassword) {
        const errors = [];
        if (!username) {
            errors.push('Username cannot be empty')
        }
        if (!email) {
            errors.push('Email cannot be empty')
        }
        if (!(password && repeatedPassword)) {
            errors.push('Password cannot be empty')
        }

        if (password !== repeatedPassword) {
            errors.push('Passwords should match')
        }

        if (errors.length) {
            throw new CustomError(errors, 400);
        }

        const user = await models.User.findOne({
            where: {
                [Op.or]: [
                    { email },
                    { username }
                ]
            }
        })

        if (user instanceof models.User) {
            errors.push('Email or username already taken');
            throw new CustomError(errors, 400);
        }
    }

    async createUser(username, email, password) {
        const hashedPass = await this.getHashedPass(password);
        const user = models.User.create({
            username,
            email,
            password: hashedPass
        })
        return user;
    }

}

export default new AuthService();