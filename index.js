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
const WorkTime = require('./models/workTime');
const Admin = require('./models/admin');
const {sendText, formatDateString} = require('./util/util');

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
  sendText("hello", "hello");
  const deliveries = await Delivery.find({});
  res.json(deliveries);
});

app.post('/delete', (req, res) => {
  console.log(req.body);
  const message = `Your '${req.body.description}' delivery for ${formatDateString(req.body.start)} has been deleted by the administrator.`
  sendText(req.body.contactNumber, message );
  Delivery.findByIdAndDelete(req.body.id)
    .then(() => res.end('Delivery removed from database'));
})

app.put('/delivery', (req, res) => {
  const message = `Your'${req.body.description}' delivery on ${formatDateString(req.body.start)} has been edited by the administrator. See calendar for details.`
  sendText(req.body.contactNumber, message);
  Delivery.findByIdAndUpdate(req.body.id, {...req.body})
    .then(x => {
      res.json(x);
    });

})

app.post('/delivery', (req, res) => {
  const delivery = new Delivery({...req.body});
  delivery.save();
  const text = `Delivery of ${delivery.description} scheduled for ${delivery.start}.`
  Admin.findOne({}).then(x => sendText(x.number, text));
  res.end('Delivery added to Database');
});

app.get('/time', (req, res) => {
  WorkTime.findOne({})
    .then(x => res.json(x));
});

app.post('/time', (req, res) => {
  WorkTime.findByIdAndUpdate(req.body._id, {...req.body})
    .then(() => res.end('Work hours updated'));
});

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
  res.sendFile(path.join(__dirname, 'images/site_map.png'));
})

app.get('/phone', (req, res) => {
  Admin.findOne({})
    .then(x => res.end(process.env.NUMBER));
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