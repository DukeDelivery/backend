const mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_URI)
  .then(result => {
    console.log('connected to MongoDB')
  })
  .catch((error) => {
    console.log('error connecting to MongoDB:', error.message)
  });
const userSchema = new mongoose.Schema({
  number: String,
  state: String,
  delivery: {
    state: String,
    company: String,
    description: String,
    start: Date,
    duration: Number,
    contactName: String,
    contactNumber: String,
    gate: Number, 
    location: String
  }
});

module.exports = mongoose.model('User', userSchema);