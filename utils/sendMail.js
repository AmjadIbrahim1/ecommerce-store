const nodemailer = require('nodemailer');

module.exports.sendMail = async ({
    to, subject, text, html, from,
}) => {
    const email = process.env.EMAIL;
    const password = process.env.PASSWORD;

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: email,
            pass: password,
        },
    });

    return transporter.sendMail({
        from, to, subject, text, html,
    });
};
