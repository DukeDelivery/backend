const http = require('http');
const express = require('express');
require('dotenv').config();
const MessagingResponse = require('twilio').twiml.MessagingResponse;
const bodyParser = require('body-parser');
const textbot = require('./textbot');
const Delivery = require('./models/delivery');
const User = require('./models/user');
const cors = require('cors');
const { DeliveryReceiptContext } = require('twilio/lib/rest/conversations/v1/conversation/message/deliveryReceipt');

const app = express();
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));

app.get('/', (req, res) => {
  res.send('server online');
})

app.get('/delivery', async (req, res) => {
  const deliveries = await Delivery.find({});
  res.json(deliveries);
});

app.post('/delete', (req, res) => {

})

app.post('/delivery', (req, res) => {
  const delivery = new Delivery({
    ...req.body
  });
  delivery.save();
  res.end('Delivery added to Database');
});
app.post('/sms', async (req, res) => {

  const twiml = new MessagingResponse();
  const message = twiml.message();
  if (req.body.Body.trim().toLowerCase() === 'map') {
    message.media('https://demo.twilio.com/owl.png');
  } else {
    message.body(await textbot(req, res));
  }
  res.writeHead(200, {'Content-Type': 'text/xml'});
  res.end(twiml.toString());
});

http.createServer(app).listen(process.env.PORT || 3001, () => {
  console.log('Express server listening on port 3001');
});