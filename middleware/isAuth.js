// check if the uses is already logged in
// if user is not authorized redirect login page

module.exports.adminIsAuth = (req, res, next) => {
    const { user } = req;
    if (!user) {
        return res.redirect(`/${process.env.ADMIN_PANEL_PATH}/auth/signin`);
    }

    // user must be super admin or admin and active
    if (!((user.isSuperAdmin || user.isAdmin) && user.isActive)) {
        return res.status(401).redirect(`/${process.env.ADMIN_PANEL_PATH}/auth/signin`);
    }

    return next();
};

module.exports.userIsAuth = (req, res, next) => {
    if (!req.user) {
        return res.redirect('/signin');
    }
    if (!req.user?.emailVerified) {
        return req.flash('warning', 'Please verify your email');
    }
    return next();
};
