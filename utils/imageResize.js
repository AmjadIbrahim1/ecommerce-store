const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const { throwError } = require('./throwError');

module.exports.productImageResize = async (filePath) => {
    // resize image 800x800 => 100x100, 360x360, 630x630
    const oneSet = {};
    const promises = [];

    for (let i = 0; i <= 2; i += 1) {
        const sizeArray = [{
            sizeText: 'large',
            sizeNumber: 630,
        }, {
            sizeText: 'normal',
            sizeNumber: 360,
        }, {
            sizeText: 'thumb',
            sizeNumber: 100,
        }];
        const compressedFilePath = path.join(path.dirname(filePath), `${path.parse(filePath).name}-${sizeArray[i].sizeText}${path.parse(filePath).ext}`);
        oneSet[sizeArray[i].sizeText] = compressedFilePath.replace(/\\/g, '/');

        promises.push(sharp(filePath)
            .resize({
                width: sizeArray[i].sizeNumber,
                height: sizeArray[i].sizeNumber,
            })
            .toFile(compressedFilePath));
    }
    await Promise.all(promises);

    const newPath = path.join(path.dirname(filePath), `${path.parse(filePath).name}-extraLarge${path.parse(filePath).ext}`);
    oneSet.extraLarge = newPath.replace(/\\/g, '/');

    fs.rename(filePath, newPath, (err) => {
        if (err) {
            throwError('Unable to rename file', 500, true);
        }
    });

    return oneSet;
};
