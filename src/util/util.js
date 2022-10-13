const accountSid = process.env.TWILIO_SID;
const authToken = process.env.AUTH_TOKEN;
const client = require('twilio')(accountSid, authToken);
const path = require('path');

const fileAt = (file) => path.join(__dirname, file);

const sendText = (number, message) => {
	
	if(!number.includes("+1")) {
		number = "+1" + number;
	}
  client.messages
    .create({
      body: message,
      from: process.env.NUMBER,
      to: number
    })
}

module.exports = { fileAt, sendText }