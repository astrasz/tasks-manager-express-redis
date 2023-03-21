const customMethodOverride = (req, res, next) => {
    if (req.query && req.query._method) {
        req.method = req.query._method
        delete req.query._method;
    }
    next()
}

export default customMethodOverride;