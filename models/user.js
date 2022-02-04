const mongoose = require('mongoose');


const userSchema = {
  number: String,
  query: String,
  delivery: {
    company: String,
    description: String,
    date: Date,
    contact: String,
    gate: Number, 
  }
}

module.exports = mongoose.model('User', userSchema);