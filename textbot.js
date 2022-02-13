const mongoose = require('mongoose');
const User = require('./models/user');

const main = async (req, res) => {
  await mongoose.connect(process.env.MONGODB_URI);
  const message = req.body;
  let user = await User.findOne({number: message.From})
  if (user === null) {
    user = new User({
      number: message.From,
      state: 'default'
    });
    await user.save();
    return 'GREETING MESSAGE';
  }
  if (user.state === 'default') {
    switch (message.Body.toLowerCase()) {
      case 'help':
        return 'HELP MESSAGE';
      case 'schedule':
        return 'TODAYS SCHEDULE';
      case 'delivery':
        return 'DELIVERY MESSAGE';
    }
  }
  return 'RETURNING MESSAGE';
};
module.exports = main;