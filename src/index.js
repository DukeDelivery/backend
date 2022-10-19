const http = require('http');
const express = require('express');
require('dotenv').config();
const MessagingResponse = require('twilio').twiml.MessagingResponse;
const bodyParser = require('body-parser');
const textbot = require('./textbot');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
const Admin = require('./models/admin');
const gate = require('./routers/gate');
const delivery = require('./routers/delivery');
const workTime = require('./routers/workTime');
const company = require('./routers/company')


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

app.use('/delivery', delivery);
app.use('/gate', gate);
app.use('/time', workTime);
app.use('/company', company);

app.post('/admin', (req, res) => {
  Admin.findByIdAndUpdate(req.body._id, {...req.body})
    .then(() => res.end('Admin info updated'));
})

app.post('/login', async (req, res) => {
  const admin = await Admin.findOne({})
  if (req.body.username === admin.username && req.body.password === admin.password) {
    res.end('valid');
  }
  else res.end('invalid');
})

app.get('/map', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'images/site_map.png'));
})

app.get('/phone', (req, res) => {
  res.end(process.env.NUMBER);
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