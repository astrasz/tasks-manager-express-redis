import redisClient, { DEFAULT_EXPIRATION } from '../services/redis.js';
import models from '../models/sequelize.js';
import { STATUS } from '../models/task.js';
import { trimText } from '../utils/string-formatter.js';
import taskService from '../services/task.js';


const { Task } = models;

export const listTasks = async (req, res, next) => {
    try {

        const { search } = req.query;

        const users = JSON.parse(await redisClient.get("users"));
        let tasks = JSON.parse(await redisClient.get("tasks"));

        if (search) {
            tasks = tasks.filter(task => task.title.includes(search) || task.description.includes(search));
        }
        const { toDo, inProgress, done } = taskService.prepareTasksToReturn(tasks, users);

        const error = req.flash('error');
        const message = req.flash('message');

        return res.render('tasks', {
            error,
            message,
            search,
            toDo,
            inProgress,
            done,
            tasks: toDo.concat(inProgress),
            users,
            loggedIn: true
        })

    } catch (err) {
        return res.render('tasks', {
            error: err.message,
            loggedIn: true
        })
    }


}

export const getTaskById = async (req, res, next) => {
    try {
        const { taskId } = req.param;

        redisClient.get(`tasks:${taskId}`, (error, task) => {
            if (error) {
                req.flash('error', err.message);
                return res.redirect('/');
            }

            if (JSON.parse(task) instanceof Task) {
                return res.render('taskDetails', {
                    task: JSON.parse(task),
                    loggedIn: true
                })
            }
        }
        )

        const task = await Task.findByPk(taskId);
        if (!(task instanceof Task))

            return res.render('taskDetails', {
                task,
                loggedIn: true
            })

    } catch (err) {
        req.flash('error', err.message);
        return res.redirect('/');
    }
}


export const addNewTask = async (req, res, next) => {
    try {
        const { title, description, associated, doer } = req.body;

        const task = await Task.create({
            title,
            description,
            status: STATUS.TO_DO,
            isAssociated: !!associated,
            associatedId: associated ? associated : null,
            ownerId: req.user.id,
            doerId: doer
        })

        await redisClient.del('tasks');

        req.flash('message', `Task '${task.title}' created succesfully`);
        return res.redirect('/');
    } catch (err) {
        console.log('Err: ', err);
        req.flash('error', err.message)
        return res.redirect('/');
    }
}

export const updateTask = async (req, res, next) => {
    try {
        const { taskId } = req.params;

        const task = await Task.update({ ...req.body },
            {
                where: { id: taskId }
            })

        await redisClient.set(`tasks:${taskId}`, JSON.stringify(task), { EX: DEFAULT_EXPIRATION });
        await redisClient.del('tasks');

        req.flash('message', `Task '${task.title}' updated successfully`);
        return res.redirect('/');

    } catch (err) {
        req.flash('error', err.message);
        return res.redirect('/');
    }
}


export const deleteTask = async (req, res, next) => {
    try {
        const { taskId } = req.params;
        const task = await Task.findByPk(taskId);
        await task.destroy();

        await redisClient.del('tasks');

        req.flash('message', `Task '${task.title}' deleted successfully`)
        return res.redirect('/');
    } catch (err) {
        console.log('Err: ', err)
        req.flash('error', err.message);
        return res.redirect('/');
    }
}