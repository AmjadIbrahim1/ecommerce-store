const { default: slugify } = require('slugify');

module.exports.makeSlug = (title) => {
    const slug = slugify(title, {
        replacement: '-',
        remove: /[*+~.()'"!:@/<>]/g,
        lower: true,
    });
    return slug;
};
