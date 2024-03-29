import { ROLE } from "../models/user.js";
import adminService from "../services/AdminService.js"


export const showAdminBoard = async (req, res, next) => {
    try {
        const { search } = req.query;
        const error = req.flash('error');
        const message = req.flash('message');

        const users = await adminService.getUsers(search);

        res.render('admin', {
            search,
            error,
            message,
            users,
            loggedIn: true,
            admin: req.user.role === ROLE.ADMIN
        });
    } catch (err) {
        console.log('Err: ', err);
        res.render('admin', {
            error: err.message,
            users,
            loggedIn: true,
            admin: req.user.role === ROLE.ADMIN
        });
    }

}

export const changeUserState = async (req, res, next) => {
    try {
        const { userId } = req.params;
        const user = await adminService.changeUserState(userId);

        req.flash('message', `User ${user.username} is ${user.isActive ? 'active' : 'inactive'} now`);

        return res.redirect('/admin')
    } catch (err) {
        console.log('Err: ', err);
        req.flash('error', err.message);
        return res.redirect('/admin');
    }
}

export const changeUserRole = async (req, res, next) => {
    try {
        const { role } = req.query;
        const { userId } = req.params;

        const user = await adminService.changeUserRole(userId, role);
        req.flash('message', `User's ${user.username} role has been changed`);
        return res.redirect('/admin');

    } catch (err) {
        console.log('Err: ', err);
        req.flash('error', err.message);
        return res.redirect('/admin');
    }
}