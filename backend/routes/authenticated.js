module.exports = function (req, res, next) {
    console.log(JSON.stringify(req.session));
    //return next();
    if (req.isAuthenticated()) {
        console.log("api authenticated");
        return next();
    }
    console.log("api unauthenticated");
    res.status(401).end('Unauthenticated');
};