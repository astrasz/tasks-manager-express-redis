import InvalidActionError from "../errors/InvalidActionError.js";
import { ROLE } from "../models/user.js"

export const canEdit = (user, task) => {
    if (!task || !user) {
        throw new InvalidActionError('Permission cannot be checked.');
    }
    return user.role === ROLE.ADMIN || user.id === task.ownerId || user.id === task.doerId;

}

export const canDelete = (user, task) => {
    if (!task || !user) {
        throw new InvalidActionError('Permission cannot be checked.');

    }

    return user.role === ROLE.ADMIN || user.id === task.ownerId;
}