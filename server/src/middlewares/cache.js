import redisClient from '../services/redis.js';
import { DEFAULT_EXPIRATION } from '../services/redis.js';
import models from '../models/sequelize.js';

const { User, Task } = models;

const cacheTasks = async () => {

    let tasks = await redisClient.get('tasks');
    console.log('task from cache', tasks);

    if (!(tasks && tasks.length)) {

        tasks = await Task.findAll({
            include: [
                { model: User, as: 'Owner', attributes: ['id', 'username', 'email'] },
                { model: User, as: 'Doer', attributes: ['id', 'username', 'email'] }]
        })
            .catch((err) => { throw err });
        if (tasks && tasks.length) {
            redisClient.set('tasks', JSON.stringify(tasks), { EX: DEFAULT_EXPIRATION });
        }
    }
}

const cacheUsers = async () => {
    let users = await redisClient.get('users');

    if (!(users && !users.length)) {
        console.log('i tu');
        const users = await User.findAll({
            attributes: ['id', 'username', 'email']
        })
            .catch((err) => { throw err });

        if (users && users.length) {
            await redisClient.set('users', JSON.stringify(users), { EX: DEFAULT_EXPIRATION });
        }
    }
}

export const cachTaskById = async (req, res, next) => {
    try {
        const { taskId } = req.params;
        if (!taskId) {
            throw new AppError('Task id cannot be null', 400);
        }
        const cacheKey = `task:${task.id}`;

        if (await redisClient.exists(cacheKey)) {
            next();
        }

        const response = await Task.findByPk(taskId);
        if (!response.ok) {
            throw new AppError('Something went wrong', 500)
        }
        const task = await response.json();

        await redisClient.set(cacheKey, Json.stringify(task), { EX: DEFAULT_EXPIRATION });
        next();
    } catch (err) {
        next(err)
    }

}

export const cacheData = async (req, res, next) => {
    try {
        await cacheUsers();
        await cacheTasks();
        next();
    } catch (err) {
        console.log('Err from cache: ', err);
        next(err)
    }

}