const path = require('path');

module.exports.checkFileExt = (fileName, fileType) => {
    const imageExts = ['.png', '.jpg', '.jpeg', '.webp'];

    if (fileType === 'image' && !imageExts.includes(path.extname(fileName))) {
        const error = new Error('Unexpected file extension');
        error.status = 422;
        error.apiError = true;
        throw error;
    }
    return true;
};
