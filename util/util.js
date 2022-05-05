const path = require('path');

const fileAt = (file) => path.join(__dirname, file);

module.exports = { fileAt }