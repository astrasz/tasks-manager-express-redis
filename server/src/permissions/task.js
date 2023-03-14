import AppError from "../errors/appError.js";
import { ROLE } from "../models/user.js"

export const canEdit = (user, task) => {
    if (!task || !user) {
        throw new AppError('Permission cannot be checked', 400)
    }
    return user.role === ROLE.ADMIN || user.id === task.ownerId || user.id === task.doerId;

}

export const canDelete = (user, task) => {
    if (!task || !user) {
        throw new AppError('Permission cannot be checked', 400)
    }

    return user.role === ROLE.ADMIN || user.id === task.ownerId;
}