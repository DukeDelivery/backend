const http = require('http');
const express = require('express');
require('dotenv').config();
const MessagingResponse = require('twilio').twiml.MessagingResponse;
const bodyParser = require('body-parser');
const textbot = require('./textbot');
const mongoose = require('mongoose');

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));

app.get('/', (req, res) => {
  res.send('Server online');
})
app.post('/sms', async (req, res) => {

  const twiml = new MessagingResponse();
  const message = twiml.message();

  message.body(await textbot(req, res));
  mongoose.connection.close();
  res.writeHead(200, {'Content-Type': 'text/xml'});
  res.end(twiml.toString());
});

http.createServer(app).listen(3001, () => {
  console.log('Express server listening on port 3001');
});