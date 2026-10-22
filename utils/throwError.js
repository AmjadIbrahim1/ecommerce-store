module.exports.throwError = (msg, status = 500, apiError = true) => {
    const error = new Error(msg);
    error.msg = msg;
    error.status = status;
    error.apiError = apiError;
    throw error;
};
