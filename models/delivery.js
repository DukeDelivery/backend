const mongoose = require('mongoose');

const deliverySchema = new mongoose.Schema({
  state: String,
  company: String,
  description: String,
  date: Date,
  duration: Number,
  contactName: String,
  contactNumber: String,
  gate: Number, 
});
module.exports = mongoose.model('Delivery', deliverySchema);