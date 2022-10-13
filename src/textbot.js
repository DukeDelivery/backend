const mongoose = require('mongoose');
const User = require('./models/user');
const Delivery = require('./models/delivery');
const Admin = require('./models/admin');
const WorkTime = require('./models/workTime');
const msg = require('./util/message');
const { SEC, MIN, HOUR, DAY, toDateString, toTimeString, getTime, getWeekday } = require('./util/time');
const { sendText } = require('./util/util');

const main = async (req) => {
  const message = req.body.Body.trim();
  let user = await User.findOne({number: req.body.From});
  if (user === null) {
    user = new User({
      number: req.body.From,
      state: 'default'
    });
    user.save();
    return "Welcome to the Skanska delivery management text-bot.\nReply 'delivery' to schedule a delivery.\nReply 'schedule' to see today's schedule.\nReply 'info' to see a list of commands.";
  }

  if (message.toLowerCase() === 'delete') {
    User.findByIdAndDelete(user._id).then(x =>{});
    return "Deleted user.";
  }
  
  switch (user.state) {

    case 'delivery': {
      if (message.toLowerCase() == 'cancel') {
        user.delivery = null;
        user.state = 'default';
        user.save();
        return 'Your delivery has been cancelled.';
      }
      
      switch (user.delivery.state) {

        case 'date': {
          try {
            user.delivery.date = parse(message, 'date');
          } catch {
            return msg.error('date');
          }
          const workTime = await WorkTime.findOne({});
          const day = getWeekday(user.delivery.date);
          if (!workTime[day].active) {
            return `Deliveries cannot be scheduled on ${day}s. Please provide another date.\nReply 'cancel' to cancel delivery request.`
          }
          console.log(user.delivery.date);
          user.delivery.state = 'start';
          user.save();
          return msg.prompt('start');
        }
          
        case 'start': {
          try {
            user.delivery.start = parse(message, 'time');
          } catch {
            return msg.error('start');
          }
          if (user.delivery.start - new Date().valueOf() < 2*DAY) {
            user.delivery.state = 'date';
            user.save();
            return `Deliveries must be scheduled 48 hours in advance. Please provide another date.\nReply 'cancel' to cancel delivery request.`
          }
          const day = getWeekday(user.delivery.start);
          const workTime = await WorkTime.findOne({});
          if (user.delivery.start < workTime[day].start || user.delivery.start > workTime[day].end) {
            return `Deliveries on ${day}s must be between ${toTimeString(workTime[day].start)} and ${toTimeString(workTime[day].end)}\nPlease provide a valid time.\nReply 'cancel' to cancel delivery.`
          }
          user.delivery.state = 'end';
          user.save();
          return msg.prompt('end');
        }
          
        case 'end': {
          try {
            user.delivery.end = parse(message, 'time');
          } catch {
            return msg.error('end');
          }
          const day = getWeekday(user.delivery.start);
          const workTime = await WorkTime.findOne({});
          if (user.delivery.end < workTime[day].start || user.delivery.end > workTime[day].end) {
            user.delivery.state = 'start';
            user.delivery.start = undefined;
            user.delivery.end = undefined;
            user.save();
            return `Deliveries on ${day}s must be between ${toTimeString(workTime[day].start)} and ${toTimeString(workTime[day].end)}\nPlease provide new start time.\nReply 'cancel' to cancel delivery.`
          }
          user.delivery.state = next(user);
          user.save();
          if (user.delivery.state == 'complete') return displayDelivery(user.delivery).concat("\n\n","Reply 'yes' to confirm or 'no' to make changes.");
          return msg.prompt(user.delivery.state);
        }
          
        case 'complete': {
          console.log(user.delivery.end);
          if (message.toLowerCase() !== 'yes') {
            user.delivery.state = 'edit';
            user.save();
            return 'Which field needs to be updated?';
          }
          const delivery = new Delivery({
            ...user.delivery,
            start: user.delivery.date + user.delivery.start,
            end: user.delivery.date + user.delivery.end,
            approved: false,
            completed: false,
            date: undefined,
            state: undefined,
          });
          if (delivery.notes.toLowerCase() === 'none') {
            delivery.notes = undefined;
          }
          delivery.save();
          const text = `Delivery of ${delivery.description} scheduled for ${delivery.start}.`
          Admin.findOne({}).then(x => sendText(x.number, text));
          User.findByIdAndDelete(user._id).then(()=>{});
          return 'Your delivery has been scheduled.\nThank You.';
        }
          
        case 'edit': {
          if (user.delivery.hasOwnProperty(message.toLowerCase())) {
            delete user.delivery[message.toLowerCase()];
            user.delivery.state = message.toLowerCase();
            user.save();
            return msg.prompt(user.delivery.state);
          }
          else return "Given field could not be understood. Please use exact field name from preceding message.\nReply 'info' for help.";
        }
         
        default: {
          try {
            user.delivery[user.delivery.state] = parse(message, user.delivery.state);
          } catch {
            return msg.error(user.delivery.state);
          }
          user.delivery.state = next(user);
          user.save();
          if (user.delivery.state !== 'complete') {
            return msg.prompt(user.delivery.state);
          } 
          else {
            return displayDelivery(user.delivery).concat("\n\n","Reply 'yes' to confirm or 'no' to make changes.");
          }
        }
      }    
    }  

    case 'schedule': {
      let date = null;
      try {
        date = parse(message, 'date');
      } catch {
        return msg.error('start');
      }
      user.state = 'default';
      user.save();
      const deliveries = await Delivery.find({
        start: {
          $gt: date,
          $lt: date + DAY
        }
      }).sort({'start': 1})
      if (deliveries.length === 0) return `There are no deliveries scheduled for ${toDateString(date)}.`
      let ret = 'Deliveries:\n';
      deliveries.forEach(delivery => {
        ret = ret.concat(`${toTimeString(getTime(delivery.start))}- ${toTimeString(getTime(delivery.end))}: ${delivery.description} for ${delivery.company}\n`);
      })
      return ret;
    }
      
    default: {
      switch (message.toLowerCase()) {

        case 'schedule':
          user.state = 'schedule';
          user.save();
          return 'What date (MM/DD/YYYY) do you want to view?';

        case 'delivery':
          user.state = 'delivery';
          user.delivery = {
            state: 'date',
            contactNumber: user.number,
          };
          user.save();
          return msg.prompt('date');

        case 'info':
          return "Reply 'delivery' to schedule a new delivery.\nReply 'schedule' to see the schedule for a day.\nReply 'cancel' to cancel delivery request";
        
        case 'map':
          return "Site Map:"

        default: 
          return "Your command could not be understood. reply 'info' for a list of commands";
      }
    }
      
    }
};
const next = (user) => {
  const params = ['company', 'description', 'contactName', 'contactNumber', 'gate', 'location', 'notes'];
  for (x of params) {
    if (user.delivery[x] === undefined) return x;
  }
  return 'complete';
};
const parse = (string, type) => { 
  switch (type) {
    case 'gate':
      const num = parseInt(string);
      if (num) return num;
      throw 100;
    case 'duration':
      const num2 = parseInt(string);
      if (num2) return num2;
      throw 100;
    case 'date':
      const monthLength = [31,28,31,30,31,30,30,31,30,31,30,31];
      const arr = string.split('/');
      if (arr.length != 3) throw 100;
      let month = 0;
      let day = 0;
      let year = 0;
      try {
        month = parseInt(arr[0]-1);
        day = parseInt(arr[1]);
        year = parseInt(arr[2]);
      } catch {
        throw 100;
      }
      if (month < 0 || month > 11) {
        throw 100;
      }
      if (day < 0 || day > monthLength[month]) {
        throw 100;
      }
      if (year < 2000) year += 2000;
      return new Date(year, month, day).valueOf();
    case 'time':
      if (string == '') return null;
      var time = string.match(/(\d+)(:(\d\d))?\s*(p?)/i);	
      if (time == null) return null;
      
      var hours = parseInt(time[1],10);	 
      if (hours == 12 && !time[4]) {
          hours = 0;
      }
      else {
        hours += (hours < 12 && time[4])? 12 : 0;
      }
      return (hours*3600000) + (parseInt(time[3],10) || 0)*60000;
    default:
      return string;
  }
}
const displayDelivery = (delivery) => {
  const ret = `Date: ${toDateString(delivery.date)}
  Start: ${toTimeString(delivery.start)}
  End: ${toTimeString(delivery.end)}
  Company: ${delivery.company}
  Description: ${delivery.description}
  Gate: ${delivery.gate}
  Location: ${delivery.location}
  Contact Name: ${delivery.contactName}
  Contact Number: ${delivery.contactNumber}
  Additional Notes: ${delivery.notes}`;
  return ret;
}

module.exports = main;