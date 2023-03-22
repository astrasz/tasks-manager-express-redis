import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
chai.use(chaiAsPromised);
const expect = chai.expect;

import { sequelize } from '../models/sequelize.js';
import bcrypt from 'bcryptjs';
import models from '../models/sequelize.js';
import adminService from '../services/AdminService.js';
import NotFoundItemError from '../errors/NotFoundItemError.js';
import redisClient from '../services/RedisService.js';
import { uuid } from '../utils/string-formatter.js';

describe('admin service', function () {
    const id = uuid()

    before(async function () {
        await sequelize.sync({ force: true })
            .then(() => console.log("Test database connection has been established"))
            .catch((err) => {
                console.log("Unable to connect to test database", err)
            })
        const password = 'test';
        const salt = await bcrypt.genSalt(10); //saltRounds
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await models.User.create({
            id,
            email: 'test@test.pl',
            username: 'test',
            password: hashedPassword,
        })

        const task = await models.Task.create({
            title: 'task',
            description: 'task in test database',
            value: 4,
            ownerId: id,
            doerId: id
        })

    })

    it('should throw NotFoundItemError with message if user cannot be find in changeUserState method', async function () {

        await expect(adminService.changeUserState(uuid())).to.rejectedWith(NotFoundItemError);
    })

    it('should return true if changeUserRole method return User type object', async function () {

        const usersArr = [];
        let user = models.User.findByPk(id);
        usersArr.push(user);
        await redisClient.set('users', JSON.stringify(usersArr));

        user = await adminService.changeUserRole(id, 'ROLE_ADMIN');

        expect(user instanceof models.User).to.be.true;
    })
})