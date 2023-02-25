import { Strategy as LocalStrategy } from 'passport-local';

const setPassport = (passport, verifyPassword, userModel) => {
    passport.use(new LocalStrategy((username, password, done) => {
        userModel.findOne({ where: { username } })
            .then(user => {
                if (!user) {
                    return done(null, false, { message: 'No user with that username' });
                }
                verifyPassword(password, user.password, (err, isValid) => {
                    if (err) throw err;
                    if (!isValid) {
                        return done(null, false, { message: 'Credentials incorrect' });
                    }
                    return done(null, user);
                })
            })
            .catch((err) => {
                return done(err, false, { message: 'Credentials incorrect' })
            })

    }))

    passport.serializeUser((user, done) => done(null, user.id))
    passport.deserializeUser((id, done) => {
        userModel.findByPk(id)
            .then(user => done(null, user))
            .catch(err => done(err))
    })
}

export default setPassport;


export const isAuthenticated = (req, res, next) => {
    if (req.user) {
        return next()
    }
    res.redirect('/signin');
}
