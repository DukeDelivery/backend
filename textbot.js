const mongoose = require('mongoose');
const User = require('./models/user');
const Delivery = require('./models/delivery');
const params = ['date', 'duration', 'company', 'description', 'contactName', 'contactNumber', 'gate'];

const main = async (req, res) => {
  await mongoose.connect(process.env.MONGODB_URI);
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
            user.delivery.date = parse(message, 'date');
          } catch {
            return "Given date could not be understood. Please use MM/DD/YYYY format \nReply 'info' for help";
          }
          user.delivery.state = 'time';
          user.save();
          return 'What is the time for your delivery (HH:MM XM)';

        case 'time':
          try {
            user.delivery.date.setTime(parse(message, 'time').getTime());
          } catch {
            return "Given time could not be understood. Please use HH:MM XM format.\nReply 'info' for help";
          }
          
          user.delivery.state = next(user);
          user.save();
          return `what is the ${user.delivery.state} for your delivery?`;

        case 'duration':
          try {
            user.delivery.duration = parse(message, 'duration');
          } catch {
            return "given duration could not be understood. Please only reply with a number.\nReply 'info' for help";
          }
          user.delivery.state = next(user);
          user.save();
          return `What is the ${user.delivery.state} for your delivery?`;

        case 'complete':
          if (message.toLowerCase() !== 'yes') {
            user.delivery.state = 'edit';
            user.save();
            return 'Which field needs to be updated?';
          }
          const autoSchedule = true;
          const delivery = new Delivery({
            ...user.delivery
          });
          delivery.state = undefined;
          delivery.save();
          User.findByIdAndDelete(user._id).then(x=>{});
          return (autoSchedule ? 'Your delivery has been scheduled\nGoodbye' : 'Your delivery request has been made\nGoodbye');

        case 'edit':
          if (user.delivery.hasOwnProperty(message)) {
            delete user.delivery[message];
            user.delivery.state = message;
            user.save();
            return `What is the ${user.delivery.state} for your delivery?`;
          }
          else return "given field could not be understood. Please use exact field name from preceding message\nReply 'info' for help";
        default:
          try {
            user.delivery[user.delivery.state] = parse(message, user.delivery.state);
          } catch {
            return `given ${user.delivery.state} could not be understood. Please try again.\nReply 'info' for help`;
          }
          
          user.delivery.state = next(user);
          user.save();
          if (user.delivery.state !== 'complete') {
            return `What is the ${user.delivery.state} for your delivery?`;
          } 
          else {
            return displayDelivery(user.delivery).concat("\n\n","Reply 'yes' to confirm or 'no' to make changes.");
          }
      }  
    }

    case 'schedule':
      let date = null;
      try {
        date = parse(date, 'date');
      }
      catch {
        return "Given date could not be understood. Please use MM/DD/YYYY format \nReply 'info' for help";
      }
      return `Schedule of ${date}`

    default:
      switch (message.toLowerCase()) {

        case 'schedule':
          user.state = 'schedule';
          user.save();
          return 'What date (MM/DD/YYYY) do you want to view?';

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
          return "Reply 'delivery' to schedule a new delivery.\nReply 'schedule' to see today's schedule\nReply 'cancel' to cancel delivery request";
        
        case 'delete':
          User.findByIdAndDelete(user._id).then(x =>{});
          return "Deleted user.";

        default:
          if (message.toLowerCase().startsWith('schedule')) {
            return `SCHEDULE OF ${message.substring(8)}`
          }
          else return "Your command could not be understood. reply 'info' for a list of commands";
      }
  }
};
const next = (user) => {
  for (x of params) {
    if (user.delivery[x] === null) return x;
  }
  return 'complete';
};
const parse = (string, type) => { //TODO
  switch (type) {
    case 'gate':
      return 2;
    case 'duration':
      return 1;
    case 'date':
      return new Date();
    case 'time':
      return new Date();
    default:
      return string;
  }
}
const displayDelivery = (delivery) => {
  let ret = '';
  for (x of params) {
    ret = ret.concat('\n', `${x}: ${delivery[x]}`);
  }
  return ret;
}
module.exports = main;