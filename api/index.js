// Vercel entry point for the existing Express API.
// All /api/* requests are rewritten here by vercel.json.
const app = require('../server');

module.exports = (req, res) => app(req, res);
