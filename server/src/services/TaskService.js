import { STATE, STATUS } from '../models/task.js';
import { trimText } from '../utils/string-formatter.js';
import models from '../models/sequelize.js';
import * as tasksPermissions from '../permissions/task.js';
import redisClient from '../services/RedisService.js';
import AbstractService from './AbstractService.js';
import InvalidActionError from '../errors/InvalidActionError.js';
import InvalidCacheObjectError from '../errors/InvalidCacheObjectError.js';
import NotFoundItemError from '../errors/NotFoundItemError.js';
import InvalidPermissionsError from "../errors/InvalidPermissionsError.js"

class TaskService extends AbstractService {

    taskState = STATE;
    taskStatus = STATUS;
    taskModel = this.models.Task;

    constructor(trimText, tasksPermissions, models, redisClient) {
        super(models, redisClient);
        this.trimText = trimText;
        this.permissions = tasksPermissions;
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

    prepareUnprocessedToReturn(tasks, users, currentUser) {
        return !!tasks && !!tasks.length && tasks.map(task => {
            return this.createTaskDetails(task, currentUser, users);
        })
    }

    createTaskDetails(task, currentUser, users, color, tasks = null) {
        return {
            ...task,
            color,
            users,
            tasks: !!tasks && tasks.filter(task => task.status !== STATUS.DONE),
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

    filter(query, tasks) {
        const { search, status, endDate, startDate } = query;
        if (search) {
            tasks = tasks.filter(task => task.title.includes(search) || task.description.includes(search));
        }

        if (endDate && startDate) {
            tasks = tasks.filter(task => task.createdAt >= startDate && task.createdAt <= endDate);
        }

        if (status) {
            tasks = tasks.filter(task => task.status === status);
        }

        return { tasks, search, startDate, status };
    }

    async getTaskById(id) {
        if (!id) {
            throw new InvalidActionError('Task id cannot be null.');
        }

        let task = await this.client.get(`tasks:${id}`, (error, task) => {
            if (error) {
                throw new InvalidCacheObjectError('Cache error, try again.');
            }

            if (JSON.parse(task) instanceof this.taskModel) {
                return task;
            }
        })
        if (task instanceof this.taskModel) {
            return task;
        }
        throw new InvalidCacheObjectError('Cache error, try again.');
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
        return await this.taskModel.create({
            ...payload,
            ownerId,
            associatedId: !!payload.associatedId ? payload.associatedId : null,
            status: STATUS.TO_DO,
            isAssociated: !!payload.associatedId,
        })
    }

    async update(body, id, currentUser) {
        const task = await this.taskModel.findByPk(id);

        if (!(task instanceof this.taskModel)) {
            throw new NotFoundItemError("Task cannot be found.");
        }

        if (!this.permissions.canEdit(currentUser, task)) {
            throw new InvalidPermissionsError('You do not have the permission.');
        }

        const errors = this.returnErrorsOrPayloadValid(body);
        if (errors) {
            return errors;
        }

        await task.update({
            ...body,
            isProcessed: !!body.isProcessed ? true : false,
            associatedId: !!body.associatedId ? body.associatedId : null,
            isAssociated: !!body.associatedId,
        });
        await this.updateCache(task);

        return task;
    }


    async changeState(id) {
        let task = await this.taskModel.findByPk(id);

        if (!(task instanceof this.taskModel)) {
            throw new NotFoundItemError("Task cannot be found.");
        }

        await task.update({
            isProcessed: !task.isProcessed
        })

        task = await task.reload();
        await this.updateCache(task);

        return task;
    }

    async remove(id, currentUser) {
        const task = await this.taskModel.findByPk(id);

        if (!(task instanceof this.taskModel)) {
            throw new NotFoundItemError("Task cannot be found.");
        }

        if (!this.permissions.canDelete(currentUser, task)) {
            throw new InvalidPermissionsError('You do not have the permission.');
        }
        const { title } = task;
        await task.destroy();
        await this.updateCache(null, task.id, 'task')

        return title;
    }
}

export default new TaskService(trimText, tasksPermissions, models, redisClient);