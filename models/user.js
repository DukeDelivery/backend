const mongoose = require('mongoose');


const userSchema = new mongoose.Schema({
  number: String,
  query: String,
  delivery: {
    company: String,
    description: String,
    date: Date,
    contact: String,
    gate: Number, 
  }
});
/*userSchema.set('toJSON', {
  transform: (document, returned) => {
    returned.id = returned._id.toString();
    delete returned._id;
    delete returned.__v;
  }
});*/

module.exports = mongoose.model('User', userSchema);