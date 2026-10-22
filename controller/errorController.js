const fs = require('fs');

// eslint-disable-next-line no-unused-vars
module.exports.getError = (error, req, res, next) => {
    console.log(error);

    if (req.file) {
        fs.unlink(req.file.path, () => { });
    }
    if (req.files) {
        req.files.forEach((file) => fs.unlink(file.path, () => { }));
    }

    if (error.apiError) {
        return res.status(error.status || 500).json({ message: error.msg });
    }

    req.flash('error', error.msg);
    return res.status(error.status || 500).redirect(req.headers.referer || req.originalUrl);
};

module.exports.get404 = (req, res, next) => {
    try {
        const { path } = req;
        const admin404 = path.substring(1).startsWith(process.env.ADMIN_PANEL_PATH);

        if (admin404) {
            res.status(404).render('admin/layouts/layout-small', {
                title: 'Page Not Found',
                page: 'pages/errors/404',
                path: '',
            });
        } else {
            res.status(404).render('layouts/layout-small', {
                title: 'Page Not Found',
                page: 'pages/errors/404',
                path: '',
            });
        }
    } catch (err) {
        next(err);
    }
};
