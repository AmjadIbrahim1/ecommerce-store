const fs = require('fs');
const path = require('path');

module.exports.deleteFile = (filePath) => {
    const absolutePath = path.join(__dirname, '..', filePath);

    fs.unlink(absolutePath, (err) => {
        if (err) {
            console.log(err);
        }
    });
};
