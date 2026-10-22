// if user is authorized do not let him to go sign in or sign up page
module.exports.alreadyLoggedIn = (req, res, next) => {
    const { user } = req;
    const isAdmin = user && (user.isSuperAdmin || user.isAdmin) && user.isActive;
    if (isAdmin) {
        return res.redirect(req.headers.referer || `/${process.env.ADMIN_PANEL_PATH}`);
    }
    return next();
};
