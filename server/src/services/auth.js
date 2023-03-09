import { Op } from 'sequelize';
import AppError from '../errors/appError.js';
import models from '../models/sequelize.js';
import bcrypt from 'bcryptjs'



class AuthService {

    saltRounds = 10;

    constructor() {
        // this.saltRounds = 10;
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
            throw new AppError(errors, 400);
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
            throw new AppError(errors, 400);
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

    verifyPassword(password, userPassword, cb) {
        bcrypt.compare(password, userPassword, (err, isValid) => {
            if (err) throw err;
            cb(null, isValid);
        })
    }

}

export default new AuthService();