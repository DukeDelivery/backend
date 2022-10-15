const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
  name: String,
  contacts: [{name: String, number: String}],
})
companySchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
  }
})

module.exports = mongoose.model('Company', companySchema);