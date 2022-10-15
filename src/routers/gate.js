const express = require('express');
const Gate = require('../models/gate');
const router = express.Router();

router.get('/', (req, res) => {
  Gate.find({}).then(x => res.json(x));
});

router.post('/', (req, res) => {
  gate = new Gate({...req.body});
  gate.save().then (() => res.end('Gate added'));
})

router.delete('/:id', (req, res) => {
  console.log(req.params.id);
  Gate.findByIdAndDelete(req.params.id)
    .then(() => res.end("Gate Removed"));
})

module.exports = router;