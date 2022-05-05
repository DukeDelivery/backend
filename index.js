const http = require('http');
const express = require('express');
require('dotenv').config();
const MessagingResponse = require('twilio').twiml.MessagingResponse;
const bodyParser = require('body-parser');
const textbot = require('./textbot');
const Delivery = require('./models/delivery');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('connected to MongoDB')
  })
  .catch((error) => {
    console.log('error connecting to MongoDB:', error.message)
  }
);

const app = express();

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static('build'));



app.get('/delivery', async (req, res) => {
  const deliveries = await Delivery.find({});
  res.json(deliveries);
});

app.delete('/delivery', (req, res) => {
  Delivery.findByIdAndDelete(req.body.id)
    .then(() => res.end('Delivery removed from database'));
})

app.put('/delivery', (req, res) => {
  Delivery.findByIdAndUpdate(req.body.id, {...req.body})
    .then(x => {
      console.log(req.body);
      res.json(x);
    });
})

app.post('/delivery', (req, res) => {
  const delivery = new Delivery({...req.body});
  delivery.save();
  res.end('Delivery added to Database');
});

app.post('/login', (req, res) => {
  if (req.body.username === "log" && req.body.password === "in") {
    res.end('valid');
  }
  else res.end('invalid');
})

app.post('/sms', async (req, res) => {
  const twiml = new MessagingResponse();
  const message = twiml.message();
  message.body(await textbot(req));
  res.writeHead(200, {'Content-Type': 'text/xml'});
  res.end(twiml.toString());
});

http.createServer(app).listen(process.env.PORT || 3001, () => {
  console.log('Express server listening on port 3001');
});