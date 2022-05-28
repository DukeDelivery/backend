const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require('twilio')(accountSid, authToken);

const path = require('path');

const fileAt = (file) => path.join(__dirname, file);

const sendText = (number, message) => {
  client.messages
    .create({
      body: message,
      from: '+12183962061',
      to: number,
    })
    .then(x => console.log(x));
}
const formatDateString = (string) => {
  return new Date(string).toLocaleString('en-US', {dateStyle: 'medium', timeStyle: 'short'});
}

const formatTimeString = (string)  => {
  return new Date(string).toLocaleTimeString('en-US', {timeStyle: 'short'});
}

module.exports = { fileAt, sendText, formatDateString, formatTimeString }