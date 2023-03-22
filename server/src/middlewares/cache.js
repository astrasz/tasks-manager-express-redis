import redisClient, { DEFAULT_EXPIRATION } from '../services/RedisService.js';
import models from '../models/sequelize.js';

const { User, Task } = models;

const getTasks = async (isProcessed) => {
    return await Task.findAll({
        include: [
            { model: User, as: 'Owner', attributes: ['id', 'username', 'email'] },
            { model: User, as: 'Doer', attributes: ['id', 'username', 'email'] },
            { model: Task, as: 'Associated', attributes: ['id', 'title'] }
        ],
        where: {
            isProcessed
        }
    })
        .catch((err) => { throw err })
}

const addCollectionToCache = async (key, model) => {
    let collection = await redisClient.get(key);
    if (!(collection && collection.length)) {
        switch (model) {
            case Task:
                if (key === 'tasks') {
                    collection = await getTasks(true)
                } else if (key === 'unprocessed') {
                    collection = await getTasks(false)
                }
                break;
            case User:
                collection = await User.findAll({
                    attributes: ['id', 'username', 'email', 'role', 'isActive']
                })
                    .catch((err) => { throw err });
            default:
                break;
        }
        if (collection && collection.length) {
            await redisClient.set(key, JSON.stringify(collection), { EX: DEFAULT_EXPIRATION })
        }
    }
}

const cacheUsers = async () => {
    await addCollectionToCache('users', User);
}

const cacheTasks = async () => {
    await addCollectionToCache('tasks', Task)
}

const cacheUnprocessedTasks = async () => {
    await addCollectionToCache('unprocessed', Task);
}

export const cachTaskById = async (req, res, next) => {
    try {
        const condition = !req.originalUrl.includes("favicon");

        if (condition) {
            const { taskId } = req.params;
            if (!taskId) {
                throw new AppError('Task id cannot be null', 400);
            }
            const cacheKey = `tasks:${task.id}`;

            if (await redisClient.exists(cacheKey)) {
                next();
            }

            const response = await Task.findByPk(taskId);
            if (!response.ok) {
                throw new AppError('Something went wrong', 500)
            }
            const task = await response.json();

            await redisClient.set(cacheKey, JSON.stringify(task), { EX: DEFAULT_EXPIRATION });
            next();
        }
        next();
    } catch (err) {
        next(err)
    }
}

export const cacheData = async (req, res, next) => {
    try {
        await cacheUsers();
        await cacheTasks();
        await cacheUnprocessedTasks();
        next();
    } catch (err) {
        next(err)
    }

}