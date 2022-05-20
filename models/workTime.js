const mongoose = require('mongoose');

const workTimeSchema = new mongoose.Schema({
  sunday: {
    active: Boolean,
    start: Number,
    end: Number
  },
  monday: {
    active: Boolean,
    start: Number,
    end: Number
  },
  tuesday: {
    active: Boolean,
    start: Number,
    end: Number
  },
  wednesday: {
    active: Boolean,
    start: Number,
    end: Number
  },
  thursday: {
    active: Boolean,
    start: Number,
    end: Number
  },
  friday: {
    active: Boolean,
    start: Number,
    end: Number
  },
  saturday: {
    active: Boolean,
    start: Number,
    end: Number
  }
});

module.exports = mongoose.model('WorkTime', workTimeSchema);