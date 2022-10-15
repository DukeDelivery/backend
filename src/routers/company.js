const express = require('express');
const Company = require('../models/company');
const router = express.Router();

router.get('/', (req, res) => {
  Company.find({}).then(x => res.json(x));
});

router.post('/', (req, res) => {
  company = new company({...req.body});
  Company.save().then (() => res.end('Gate added'));
})

router.delete('/:id', (req, res) => {
  company.findByIdAndDelete(req.body.id)
    .then(() => res.end("Gate Removed"));
})

module.exports = router;