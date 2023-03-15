import { ROLE } from "../models/user.js";

export const showAdminBoard = (req, res, next) => {
    res.render('admin', {
        loggedIn: true,
        admin: req.user.role === ROLE.ADMIN
    });
}