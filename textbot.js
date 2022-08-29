const mongoose = require('mongoose');
const User = require('./models/user');
const Delivery = require('./models/delivery');
const Admin = require('./models/admin');
const msg = require('./util/message');
const { sendText, formatDateString, formatTimeString } = require('./util/util')

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

    case 'delivery': 
      if (message.toLowerCase() == 'cancel') {
        user.delivery = null;
        user.state = 'default';
        user.save();
        return 'Your delivery has been cancelled.';
      }
      
      switch (user.delivery.state) {

        case 'time':
          try {
            const d = new Date(parse(message, 'time'));
            const start = new Date(user.delivery.start);
            start.setHours(d.getHours());
            start.setMinutes(d.getMinutes());
            user.delivery.start = start;
          } catch {
            return msg.error('time');
          }
          console.log(user.delivery.start);
          user.delivery.state = next(user);
          user.save();
          return msg.prompt(user.delivery.state);

        case 'complete':
          if (message.toLowerCase() !== 'yes') {
            user.delivery.state = 'edit';
            user.save();
            return 'Which field needs to be updated?';
          }
          const autoSchedule = true;
          const delivery = new Delivery({
            ...user.delivery,
            end: new Date(new Date(user.delivery.start).getTime() + user.delivery.duration*60000)
          });
          const start = new Date(delivery.start).setHours(delivery.start.getHours()+4);
          const end = new Date(delivery.end).setHours(delivery.end.getHours()+4);
          delivery.start = start;
          delivery.end = end;
          delivery.duration = undefined;
          delivery.state = undefined;
          if (delivery.notes.toLowerCase() === 'none') {
            delivery.notes = undefined;
          }
          delivery.save();
          const text = `Delivery of ${delivery.description} scheduled for ${delivery.start}.`
          Admin.findOne({}).then(x => sendText(x.number, text));
          User.findByIdAndDelete(user._id).then(x=>{});
          return (autoSchedule ? 'Your delivery has been scheduled.\nThank You.' : 'Your delivery request has been made.\nThank You.');

        case 'edit':
          if (user.delivery.hasOwnProperty(message.toLowerCase())) {
            delete user.delivery[message.toLowerCase()];
            user.delivery.state = message.toLowerCase();
            user.save();
            return msg.prompt(user.delivery.state);
          }
          else return "Given field could not be understood. Please use exact field name from preceding message.\nReply 'info' for help.";

        default:
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
    

    case 'schedule':
      user.save();
      let date = null;
      try {
        date = new Date(parse(message, 'date'));
      } catch {
        return msg.error('start');
      }
      user.state = 'default';
      const deliveries = await Delivery.find({
        start: {
          $gt: new Date(date),
          $lt: new Date(date.setDate(date.getDate()+1))
        }
      }).sort({'start': 1})
      date = new Date(date.setDate(date.getDate()-1));
      if (deliveries.length === 0) return `There are no deliveries scheduled for ${date}.`
      let ret = 'Deliveries:\n';
      deliveries.forEach(delivery => {
        ret = ret.concat(`${formatTimeString(new Date(new Date(delivery.start).setHours(new Date(delivery.start).getHours()-4)))}- ${delivery.description} for ${delivery.company}\n`);
      })
      return ret;

    default:
      switch (message.toLowerCase()) {

        case 'schedule':
          user.state = 'schedule';
          user.save();
          return 'What date (MM/DD/YYYY) do you want to view?';

        case 'delivery':
          user.state = 'delivery';
          user.delivery = {
            state: 'start',
            company: null,
            description: null,
            start: null,
            duration: null,
            contactName: null,
            contactNumber: user.number,
            gate: null,
            location: null,
            notes: null
          };
          user.save();
          return msg.prompt('start');

        case 'info':
          return "Reply 'delivery' to schedule a new delivery.\nReply 'schedule' to see the schedule for a day.\nReply 'cancel' to cancel delivery request";
        
        case 'map':
          return "Site Map:"

        default: 
          return "Your command could not be understood. reply 'info' for a list of commands";
      }
    }
};
const next = (user) => {
  const params = ['start', 'duration', 'company', 'description', 'contactName', 'contactNumber', 'gate', 'location', 'notes'];
  if (user.delivery.state == 'start') {
    return 'time';
  }
  for (x of params) {
    if (user.delivery[x] === null) return x;
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
    case 'start':
      const monthLength = [31,28,31,30,31,30,30,31,30,31,30,31];
      const arr = string.split('/');
      if (arr.length != 3) return 'incorrect format';
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
      return new Date(year, month, day);
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
      var d = new Date();    	    	
      d.setHours(hours);
      d.setMinutes(parseInt(time[3],10) || 0);
      d.setSeconds(0, 0);	 
      return d;
    default:
      return string;
  }
}
const displayDelivery = (delivery) => {
  const ret = `Start: ${formatDateString(delivery.start)}\n
  Duration: ${delivery.duration} minutes\n
  Company: ${delivery.company}\n
  Description: ${delivery.description}\n
  Gate: ${delivery.gate}\n
  Location: ${delivery.location}\n
  Contact Name: ${delivery.contactName}\n
  Contact Number: ${delivery.contactNumber}\n
  Additional Notes: ${delivery.notes}`;
  return ret;
}

module.exports = main;