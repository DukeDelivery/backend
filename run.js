const mongoose = require('mongoose');
const User = require('./models/user');
require('dotenv').config();
const url = process.env.MONGODB_URI;

mongoose.connect(url)
  .then(console.log("connected to mongodb"))
  .catch("error connecting to mongodb");

const user = new User({
  number: "12345",
  query: "delivery"
});
user.save().then(result => mongoose.connection.close());

