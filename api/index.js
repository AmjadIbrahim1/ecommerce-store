// Vercel serverless entrypoint.
// Every request that does not match a static file is rewritten here (see vercel.json)
// and handled by the exported Express app.
const app = require('../app');

module.exports = app;
