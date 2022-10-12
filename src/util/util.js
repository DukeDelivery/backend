const accountSid = process.env.TWILIO_SID;
const authToken = process.env.AUTH_TOKEN;
const client = require('twilio')(accountSid, authToken);

const path = require('path');
const { MIN, DAY } = require('./time');

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
const toDateString = (date) => {
  return new Date(date).toLocaleString('en-US', {dateStyle: 'medium'});
}
const toDateTimeString = (date) => {
  return new Date(date).toLocaleString('en-US', {dateStyle: 'medium', timeStyle: 'short'});
}

const toTimeString = (time)  => {
  const today = new Date();
  today.setHours(0,0,0,0);
  today.setMilliseconds(time);
  return today.toLocaleTimeString('en-US', {timeStyle: 'short'});
}

const getTime = (date) => {
  return (date - new Date(date).getTimezoneOffset()*MIN) % DAY;
}
const getWeekday = (date) => {
  const weekdays = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday'];
  return weekdays[new Date(date).getUTCDay()];
}

module.exports = { fileAt, sendText, toDateString, toTimeString, getTime, getWeekday, toDateTimeString }