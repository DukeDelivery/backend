const accountSid = process.env.TWILIO_SID;
const authToken = process.env.AUTH_TOKEN;
const client = require('twilio')(accountSid, authToken);

const path = require('path');

const fileAt = (file) => path.join(__dirname, file);

const sendText = (number, message) => {
	
	if(number.includes("+1")) {
		
	}
	else {
		number = "+1" + number;
	}
	
  client.messages
    .create({
      body: message,
      from: process.env.NUMBER,
      to: number
    })
}
const formatDateString = (string) => {
  return new Date(string).toLocaleString('en-US', {dateStyle: 'medium', timeStyle: 'short'});
}

const formatTimeString = (string)  => {
  return new Date(string).toLocaleTimeString('en-US', {timeStyle: 'short'});
}

module.exports = { fileAt, sendText, formatDateString, formatTimeString }