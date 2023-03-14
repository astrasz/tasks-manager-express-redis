const authRole = (role) => {
    return (req, res, next) => {
        if (req.user.role !== role) {
            req.flash('error', 'You do not have the permission.')
            return res.redirect('/');
        }
        next();
    }
}

export default authRole;