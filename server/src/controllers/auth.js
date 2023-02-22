import authService from '../services/auth.js'

export const showSignupForm = (req, res, next) => {
    res.render('signup');
}

export const showSigninForm = (req, res, next) => {

    const { message } = req.query

    res.render('signin', {
        message
    });
}

export const signup = async (req, res, next) => {
    try {
        const { username, email, password, repeatedPassword } = req.body;

        await authService.checkRegistrationData(username, email, password, repeatedPassword);
        const user = await authService.createUser(username, email, password);

        res.redirect(`/signin?message=${user.username}, you have been registered succesfully`);
    } catch (err) {
        res.render('signup', {
            message: err.message.split(',')
        })
    }

}

export const signin = (req, res, next) => {
    res.render('signin');
}