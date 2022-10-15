const express = require('express');
const Company = require('../models/company');
const router = express.Router();

router.get('/', (req, res) => {
  Company.find({}).then(x => res.json(x));
});

router.post('/', (req, res) => {
  const company = new Company({...req.body});
  company.save().then(() => res.end('Gate added'));
})

router.delete('/:id', (req, res) => {
  Company.findByIdAndDelete(req.body.id)
    .then(() => res.end("Gate Removed"));
})

module.exports = router;