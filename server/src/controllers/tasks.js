import redisClient, { DEFAULT_EXPIRATION } from '../services/redis.js';
import models from '../models/sequelize.js';
import { STATUS } from '../models/task.js';
import { trimText } from '../utils/string-formatter.js';

const { Task, User } = models;

export const listTasks = async (req, res, next) => {
    try {

        const users = JSON.parse(await redisClient.get("users"));
        const tasks = JSON.parse(await redisClient.get("tasks"));

        let toDo = [];
        let inProgress = [];
        let done = [];
        if (tasks && tasks.length) {
            toDo = tasks.filter(task => task.status === STATUS.TO_DO).map(task => (
                {
                    ...task,
                    color: 'primary',
                    shortDesc: trimText(task.description, 20),
                    users: users,
                    statuses: { ...STATUS },
                    tasks: toDo.concat(inProgress),
                }));
            inProgress = tasks.filter(task => task.status === STATUS.IN_PROGRESS).map(task => (
                {
                    ...task,
                    color: 'warning',
                    shortDesc: trimText(task.description, 20),
                    users: users,
                    statuses: { ...STATUS },
                    tasks: toDo.concat(inProgress),
                }));
            done = tasks.filter(task => task.status === STATUS.DONE).map(task => (
                {
                    ...task,
                    color: 'success',
                    shortDesc: trimText(task.description, 20),
                    users: users,
                    statuses: { ...STATUS },
                    tasks: toDo.concat(inProgress),
                }));
        }

        const error = req.flash('error');
        const message = req.flash('message');

        return res.render('tasks', {
            error,
            message,
            toDo,
            inProgress,
            done,
            tasks: toDo.concat(inProgress),
            users,
            loggedIn: true
        })

    } catch (err) {
        console.log('Err: ', err)
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
                console.log('Err: ', error);
                req.flash('error', err.message);
                return res.redirect('/');
            }

            if (JSON.parse(task) instanceof Task) {
                return res.redner('taskDetails', {
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
        console.log('Err: ', err)
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

        req.flash('message', `Task ${task.title} created succesfully`);
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

        req.flash('message', `Task ${taskId} updated successfully`);
        return res.redirect('/');

    } catch (err) {
        console.log('Errrrrr: ', err)
        req.flash('error', err.message);
        return res.redirect('/');
    }
}


export const deleteTask = async (req, res, next) => {
    try {
        const taskId = req.param;
        await Task.findByPk(taskId)
            .then(task => task.destroy());

        await redisClient.del('tasks');

        req.flash('success', `Task ${taskId} deleted successfully`)
    } catch (err) {
        console.log('Err: ', err)
        req.flash('error', err.message);
        return res.redirect('/');
    }
}