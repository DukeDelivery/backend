const mongoose = require('mongoose');

const gateSchema = new mongoose.Schema({
  name: String,
})

gateSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
  }
})

module.exports = mongoose.model('Gate', gateSchema);