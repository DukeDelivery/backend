const mongoose = require('mongoose');
const User = require('./models/user');

const main = async (req, res) => {
  mongoose.connect(process.env.MONGODB_URI);
  const message = req.body;
  let user = await User.findOne({number: message.From})
  if (user === null) {
    user = new User({
      number: message.From,
      query: 'none'
    })
    await user.save();
    return 'GREETING MESSAGE';
  }
  if (query === 'none') {
    switch (message.Body.toLowerCase()) {
      case 'help':
        return 'HELP MESSAGE';
      case 'schedule':
        User.findByIdAndUpdate()
    }
  }
  if (message.Body.toLowerCase() !== 'delivery')
  return 'RETURNING MESSAGE';
};
module.exports = main;