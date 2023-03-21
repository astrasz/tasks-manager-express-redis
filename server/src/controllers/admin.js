import { ROLE } from "../models/user.js";
import redisClient from "../services/redis.js";
import adminService from "../services/admin.js"


export const showAdminBoard = async (req, res, next) => {
    try {

        const error = req.flash('error');
        const message = req.flash('message');

        const users = JSON.parse(await redisClient.get('users'));

        res.render('admin', {
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