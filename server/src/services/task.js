import { STATUS } from '../models/task.js';
import { trimText } from '../utils/string-formatter.js';
import models from '../models/sequelize.js';
import * as tasksPermissions from '../permissions/task.js';
import AppError from '../errors/appError.js';
import redisClient, { DEFAULT_EXPIRATION } from '../services/redis.js';

class TaskService {

    taskStatus = STATUS;
    expiration = DEFAULT_EXPIRATION;

    constructor(trimText, tasksPermissions, tasksModel, redisClient) {
        this.trimText = trimText;
        this.permissions = tasksPermissions;
        this.tasksModel = tasksModel;
        this.client = redisClient;
    }

    prepareTasksToReturn(tasks, users, currentUser) {
        let toDo = [];
        let inProgress = [];
        let done = [];
        if (tasks && tasks.length) {
            toDo = tasks.filter(task => task.status === this.taskStatus.TO_DO).map(task => {
                return this.createTaskDetails(task, currentUser, users, 'primary', tasks)
            });
            inProgress = tasks.filter(task => task.status === this.taskStatus.IN_PROGRESS).map(task => {
                return this.createTaskDetails(task, currentUser, users, 'warning', tasks)
            });
            done = tasks.filter(task => task.status === this.taskStatus.DONE).map(task => {
                return this.createTaskDetails(task, currentUser, users, 'success', tasks)
            });
        }
        return { toDo, inProgress, done }
    }

    createTaskDetails(task, currentUser, users, color, tasks) {
        return {
            ...task,
            color,
            users,
            tasks: tasks.filter(task => task.status !== STATUS.DONE),
            edit: this.permissions.canEdit(currentUser, task),
            delete: this.permissions.canDelete(currentUser, task),
            shortDesc: this.trimText(task.description, 20),
            statuses: { ...this.taskStatus },
        }
    }

    returnErrorsOrPayloadValid(payload) {
        const errors = [];
        !payload.title && errors.push('Title cannot be empty.');
        !payload.doerId && errors.push('Doer cannot be empty.');

        return errors.length ? errors : null;
    }

    async getTaskById(id) {
        if (!id) {
            throw new AppError('Task id cannot be null.', 400);
        }

        let task = await this.client.get(`tasks:${id}`, (error, task) => {
            if (error) {
                throw new AppError('Cache error, try again.')
            }

            if (JSON.parse(task) instanceof this.tasksModel) {
                return task;
            }
        })
        if (task instanceof this.tasksModel) {
            return task;
        }
        throw new AppError('Cache error, try again.');
    }

    async createNew(body, ownerId) {
        const errors = this.returnErrorsOrPayloadValid(body)

        if (errors) {
            return errors;
        }

        const task = await this.saveNew(body, ownerId);
        await this.updateCache(task);

        return task;
    }

    async saveNew(payload, ownerId) {
        return await this.tasksModel.create({
            ...payload,
            ownerId,
            associatedId: !!payload.associatedId ? payload.associatedId : null,
            status: STATUS.TO_DO,
            isAssociated: !!payload.associatedId,
        })
    }

    async updateCache(task = null, taskId = null) {
        if (task) {
            const cacheKey = `tasks:${task.id}`;
            await this.client.set(cacheKey, JSON.stringify(task), { EX: this.expiration });
        }

        if (taskId) {
            const cacheKey = `tasks:${taskId}`;
            const isSet = this.client.keys(cacheKey);
            isSet && await this.client.del(cacheKey);
        }

        await this.client.del('tasks');
    }

    async update(body, id, currentUser) {
        const task = await this.tasksModel.findByPk(id);

        if (!(task instanceof this.tasksModel)) {
            throw new AppError("Task cannot be found.", 400);
        }

        if (!this.permissions.canEdit(currentUser, task)) {
            throw new AppError('You do not have the permission.', 401);
        }

        const errors = this.returnErrorsOrPayloadValid(body);
        if (errors) {
            return errors;
        }

        await task.update({
            ...body,
            associatedId: !!body.associatedId ? body.associatedId : null,
            isAssociated: !!body.associatedId,
        });
        await this.updateCache(task);

        return task;
    }

    async remove(id, currentUser) {
        const task = await this.tasksModel.findByPk(id);

        if (!(task instanceof this.tasksModel)) {
            throw new AppError("Task cannot be found.", 400);
        }

        if (!this.permissions.canDelete(currentUser, task)) {
            throw new AppError('You do not have the permission.', 401);
        }
        const { title } = task;
        await task.destroy();
        await this.updateCache(null, task.id)

        return title;
    }
}

export default new TaskService(trimText, tasksPermissions, models.Task, redisClient);