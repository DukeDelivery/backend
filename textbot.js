const mongoose = require('mongoose');
const User = require('./models/user');
const Delivery = require('./models/delivery');

const main = async (req, res) => {
  await mongoose.connect(process.env.MONGODB_URI);
  const message = req.body.Body;
  let user = await User.findOne({number: req.body.From});
  if (user === null) {
    user = new User({
      number: req.body.From,
      state: 'default'
    });
    user.save();
    return "Welcome to the Skanska delivery management text-bot. \nReply 'delivery' to schedule a delivery.\nReply 'schedule' to see today's schedule.\nReply 'info' to see a list of commands.";
  }
  switch (user.state) {

    case 'delivery': {
      if (message.toLowerCase() === 'cancel') {
        user.state = 'default';
        user.delivery = undefined;
        user.save();
        return "Your delivery request has been cancelled. reply 'delivery' to begin a new request";
      }
      switch (user.delivery.state) {
        case 'date':
          try {
            user.delivery.date = parseDate(message);
          } catch {
            return "Given date could not be understood. Please use MM/DD/YYYY format \nReply 'info' for help";
          }
          user.delivery.state = 'time';
          user.save();
          return 'What is the time for your delivery (HH:MM XM)';
        case 'time':
          try {
            user.delivery.date.setTime(parseTime(message).getTime());
          } catch {
            return "Given time could not be understood. Please use HH:MM XM format.\nReply 'info' for help";
          }
          
          user.delivery.state = 'duration';
          user.save();
          return 'what is the duration of your delivery (minutes)?';
        case 'duration':
          try {
            user.delivery.duration = parseDuration(message);
          } catch {
            return "given duration could not be understood. Please only reply with a number. \nReply 'info' for help";
          }
          user.delivery.state = 'company';
          user.save();
          return 'What company is the delivery for?';
        default:
          user.delivery[user.delivery.state] = format(message, user.delivery.state);
          user.delivery.state = next(user);
          if (user.delivery.state !== 'complete') {
            user.save();
            return `What is the ${user.delivery.state.toUpperCase()} for your delivery?`;
          } 
          else {
            user.state = 'complete';
            user.save();
            return displayDelivery(user.delivery);
          }
      }  
    }

    case 'complete':
      if (message.toLowerCase() === 'cancel') {
        user.state = 'default';
        user.delivery = undefined;
        user.save();
        return "Your delivery request has been cancelled. reply 'delivery' to begin a new request";
      }
      if (message.toLowerCase() !== 'yes') {
        user.state = 'edit';
        user.save();
        return 'Which field needs to be updated?';
      }
      const autoSchedule = true;
      const delivery = new Delivery({
        ...user.delivery
      });
      delivery.state = undefined;
      delivery.save();
      User.findByIdAndDelete(user._id);
      return (autoSchedule ? 'Your delivery has been scheduled\nGoodbye' : 'Your delivery request has been made\nGoodbye');

    case 'edit':
      if (message.toLowerCase() === 'cancel') {
        user.state = 'default';
        user.delivery = undefined;
        user.save();
        return "Your delivery request has been cancelled. reply 'delivery' to begin a new request";
      }
      if (user.delivery.hasOwnProperty(message)) {
        delete user.delivery[message];
        user.save();
        user.delivery.state = message;
        return `What is the ${user.delivery.state.toUpperCase()} for your delivery?`;
      }
      else return 'given field could not be understood. Please use exact field name from preceding message';

    default:
      switch (message.toLowerCase()) {
        case 'schedule':
          return 'TODAYS SCHEDULE';
        case 'delivery':
          user.state = 'delivery';
          user.delivery = {
            state: 'date',
            company: null,
            description: null,
            date: null,
            duration: null,
            contactName: null,
            contactNumber: user.number,
            gate: null
          };
          user.save();
          return 'What is the date for your delivery (MM/DD/YYYY)?';
        case 'info':
          return "Reply 'delivery' to schedule a new delivery.\nReply 'schedule' to see today's schedule\nReply 'cancel' to cancel delivery request"
        default:
          if (message.toLowerCase().startsWith('schedule')) {
            return `SCHEDULE OF ${message.substring(8)}`
          }
          else return "Your command could not be understood. reply 'help' for a list of commands";
      }
  }
};
const next = (user) => {
  for (x in user.delivery) {
    if (x === 'state') continue;
    if (user.delivery[x] === null) return x;
  }
  return 'complete';
};
const format = (string, type) => {
  switch (type) {
    case 'gate':
      return parseInt(string);
    default:
      return string;
  }
}
const parseDate = (date) => {
  if (date === 'date') throw 100;
  return new Date(); //TODO
}
const parseTime = (time) => {
  return new Date(); //TODO
}
const parseDuration = (len) => {
  return 1; //TODO
}
const displayDelivery = (delivery) => {
  let ret = '';
  const params = ['company', 'description', 'date', 'duration', 'contactName', 'contactNumber', 'gate'];
  for (x of params) {
    ret = ret.concat('\n', `${x}: ${delivery[x]}`);
  }
  return ret;
}
module.exports = main;