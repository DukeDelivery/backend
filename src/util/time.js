const SEC = 1000;
const MIN = 60000;
const HOUR = 3600000;
const DAY = 86400000;

const toMilliseconds = (timeString) => {
  const t = timeString.split(':');
  return parseInt(t[0])*HOUR + parseInt(t[1])*MIN;
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

module.exports = { SEC, MIN, HOUR, DAY, toDateString, toDateTimeString, toTimeString, getTime, getWeekday, toMilliseconds };
