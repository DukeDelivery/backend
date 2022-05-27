const mongoose = require('mongoose');

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
    location: String,
    notes: String,
  }
});

module.exports = mongoose.model('User', userSchema);