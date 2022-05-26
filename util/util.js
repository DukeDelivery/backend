const path = require('path');

const fileAt = (file) => path.join(__dirname, file);

const sendText = (number, message) => {
  console.log('Text: ', message);
}
const formatDateString = (string) => {
  return new Date(string).toLocaleString('en-US', {dateStyle: 'medium', timeStyle: 'short'});
}

module.exports = { fileAt, sendText, formatDateString }