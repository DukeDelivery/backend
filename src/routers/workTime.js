const express = require('express');
const WorkTime = require('../models/workTime');
const router = express.Router();

router.get('/', (req, res) => {
  WorkTime.findOne({})
    .then(x => res.json(x));
});

router.post('/', (req, res) => {
  WorkTime.findByIdAndUpdate(req.body._id, {...req.body})
    .then(() => res.end('Work hours updated'));
});

module.exports = router;