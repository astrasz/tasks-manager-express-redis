import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
chai.use(chaiAsPromised);
const expect = chai.expect;

import { sequelize } from '../models/sequelize.js';
import models from '../models/sequelize.js';
import taskService from '../services/TaskService.js';
import InvalidActionError from '../errors/InvalidActionError.js';

describe('task service', function () {

    it('should return null if payload vald in returnErrorsOrPayloadValid methods', async function () {

        const users = await models.User.findAll();
        const id = users[0].id;

        const payload = { title: 'title', doerId: id };
        const result = taskService.returnErrorsOrPayloadValid(payload);

        expect(result).to.equal(null);
    })

    it('should throw InvalidActionError if id is null in getTaskById method', async function () {

        await expect(taskService.getTaskById()).to.rejectedWith(InvalidActionError);
    })

    after(async function () {
        await sequelize.close()
            .then(() => console.log("Test database's connection has been closed"))
    })
})