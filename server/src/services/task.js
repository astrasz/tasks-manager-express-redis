import { STATUS } from '../models/task.js';
import { trimText } from '../utils/string-formatter.js';


class TaskService {

    taskStatus = STATUS;

    constructor(trimText) {
        this.trimText = trimText;
    }

    prepareTasksToReturn(tasks, users) {
        let toDo = [];
        let inProgress = [];
        let done = [];
        if (tasks && tasks.length) {
            toDo = tasks.filter(task => task.status === this.taskStatus.TO_DO).map(task => (
                {
                    ...task,
                    color: 'primary',
                    shortDesc: this.trimText(task.description, 20),
                    users: users,
                    statuses: { ...this.taskStatus },
                    tasks: toDo.concat(inProgress),
                }));
            inProgress = tasks.filter(task => task.status === this.taskStatus.IN_PROGRESS).map(task => (
                {
                    ...task,
                    color: 'warning',
                    shortDesc: this.trimText(task.description, 20),
                    users: users,
                    statuses: { ...this.taskStatus },
                    tasks: toDo.concat(inProgress),
                }));
            done = tasks.filter(task => task.status === this.taskStatus.DONE).map(task => (
                {
                    ...task,
                    color: 'success',
                    shortDesc: this.trimText(task.description, 20),
                    users: users,
                    statuses: { ...this.taskStatus },
                    tasks: toDo.concat(inProgress),
                }));
        }
        return { toDo, inProgress, done }
    }

}

export default new TaskService(trimText);