import redisClient, { DEFAULT_EXPIRATION } from '../services/redis.js';
import models from '../models/sequelize.js';
import { STATE, STATUS } from '../models/task.js';
import taskService from '../services/task.js';
import { ROLE } from '../models/user.js';


const { Task } = models;

export const listUnprocessedTasks = async (req, res, next) => {
    try {

        const error = req.flash('error');
        const message = req.flash('message');

        const users = JSON.parse(await redisClient.get("users"));
        let unprocessed = JSON.parse(await redisClient.get("unprocessed"));
        unprocessed = taskService.prepareUnprocessedToReturn(unprocessed, users, req.user);

        const { tasks, search, startDate } = taskService.filter(req.query, unprocessed);

        return res.render('backboard', {
            error,
            message,
            search,
            startDate,
            tasks,
            loggedIn: true,
            admin: req.user.role === ROLE.ADMIN
        })
    } catch (err) {
        console.log('Err: ', err);
        return res.render('backboard', {
            error: err.message,
            loggedIn: true,
            admin: req.user.role === ROLE.ADMIN,
        })
    }
}

export const listTasks = async (req, res, next) => {
    try {
        const error = req.flash('error');
        const message = req.flash('message');

        const users = JSON.parse(await redisClient.get("users"));
        const cachedTasks = JSON.parse(await redisClient.get("tasks"));

        const { tasks, search } = taskService.filter(req.query, cachedTasks);
        const { toDo, inProgress, done } = taskService.prepareTasksToReturn(tasks, users, req.user);

        return res.render('tasks', {
            error,
            message,
            search,
            toDo,
            inProgress,
            done,
            users,
            states: { ...STATE },
            tasks: toDo.concat(inProgress),
            loggedIn: true,
            admin: req.user.role === ROLE.ADMIN,
            mainboard: true
        })

    } catch (err) {
        return res.render('tasks', {
            error: err.message,
            loggedIn: true,
            admin: req.user.role === ROLE.ADMIN
        })
    }
}

export const displayInvalidForm = async (req, res, next) => {
    const invalidTask = { ...req.session.task };
    const { formErrors } = req.session;

    const error = req.flash('error');

    const users = JSON.parse(await redisClient.get("users"));
    let tasks = JSON.parse(await redisClient.get("tasks"));

    if (formErrors) {
        return res.render('error', {
            invalidTask,
            error,
            users,
            tasks: tasks.filter(task => task.status !== STATUS.DONE),
            loggedIn: true,
            admin: req.user.role === ROLE.ADMIN
        })
    }
    return res.redirect('/');
}

export const getTaskById = async (req, res, next) => {
    try {
        const { taskId } = req.param;
        const task = await taskService.getTaskById(taskId);

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
        const task = await taskService.createNew(req.body, req.user.id);

        if (!(task instanceof Task)) {
            const errors = task;
            req.session.task = {
                ...req.body
            };
            req.session.formErrors = true;
            req.flash('error', errors);
            return res.redirect('/error');
        }

        req.flash('message', `Task '${task.title}' created succesfully.`);
        return res.redirect('/');
    } catch (err) {
        req.flash('error', err.message)
        return res.redirect('/');
    }
}

export const updateTask = async (req, res, next) => {
    try {
        const { taskId } = req.params;
        const task = await taskService.update(req.body, taskId, req.user);

        if (!(task instanceof Task)) {
            const errors = task;
            req.session.task = {
                ...req.body
            };
            req.session.formErrors = true;
            req.flash('error', errors);
            return res.redirect('/error');
        }

        req.flash('message', `Task '${task.title}' updated successfully.`);
        return res.redirect('/');

    } catch (err) {
        console.log('Update-error: ', err)
        req.flash('error', err.message);
        return res.redirect('/');
    }
}

export const changeState = async (req, res, next) => {
    try {
        const { taskId } = req.params;
        const task = await taskService.changeState(taskId)

        req.flash('message', `Task "${task.title}" is ${task.isProcessed ? 'processed' : 'not processed'} now`);
        if (task.isProcessed) {
            return res.redirect('/backboard');
        }
        return res.redirect('/');
    } catch (err) {
        console.log('Err: ', err);
    }
}


export const deleteTask = async (req, res, next) => {
    try {
        const { taskId } = req.params;
        const taskTitle = await taskService.remove(taskId, req.user);

        req.flash('message', `Task '${taskTitle}' deleted successfully.`)
        return res.redirect('/');
    } catch (err) {
        console.log('Err: ', err)
        req.flash('error', err.message);
        return res.redirect('/');
    }
}