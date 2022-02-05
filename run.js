const mongoose = require('mongoose');
const User = require('./models/user');
const afterAll = require('after-all');
require('dotenv').config();

const url = process.env.MONGODB_URI;

const runner = async () => {
  mongoose.connect(url)
    .then(console.log("connected to mongb"))
    .catch("error connecting to mongodb");

  const users = await User.findOne({number: 1234});
  console.log(users);
}
runner();


