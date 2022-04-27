const mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_URI)
  .then(result => {
    console.log('connected to MongoDB')
  })
  .catch((error) => {
    console.log('error connecting to MongoDB:', error.message)
  });

const deliverySchema = new mongoose.Schema({
  company: String,
  description: String,
  start: Date,
  end: Date,
  contactName: String,
  contactNumber: String,
  gate: Number, 
  location: String,
  schedName: String,
  schedNumber: String,
  supplier: String,
  hoistMethod: String,
  trucks: Number,
  notes: String
});

deliverySchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
  }
})
module.exports = mongoose.model('Delivery', deliverySchema);