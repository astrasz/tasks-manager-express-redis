import authService from '../services/AuthService.js'
import passport from 'passport';
import redisClient from '../services/RedisService.js';

export const showSignupForm = (req, res, next) => {

    if (req.user) {
        return res.redirect('/');
    }

    res.render('signup', {
        loggedIn: false
    });
}

export const showSigninForm = (req, res, next) => {

    if (req.user) {
        return res.redirect('/');
    }

    let { message } = req.query;
    let status = 'danger';
    const flashes = req.flash();
    message = flashes.error || flashes.message;

    if (flashes.success) {
        message = flashes.success;
        status = 'success';
    }

    return res.render('signin', {
        status,
        message,
        loggedIn: false
    });
}

export const signup = async (req, res, next) => {
    try {
        const { username, email, password, repeatedPassword } = req.body;

        await authService.checkRegistrationData(username, email, password, repeatedPassword);
        const user = await authService.createUser(username, email, password);

        req.flash('success', `${user.username}, you have been registered succesfully`)
        return res.redirect('/signin');
    } catch (err) {
        return res.render('signup', {
            message: err.message.split(',')
        })
    }

}

export const signin = passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/signin',
    failureFlash: true,
})

export const logout = async (req, res, next) => {

    await redisClient.flushAll()

    req.logout(function (err) {
        if (err) { return next(err); }
        res.redirect('/signin');
    });
};