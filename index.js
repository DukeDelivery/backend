const http = require('http');
const express = require('express');
require('dotenv').config();
const MessagingResponse = require('twilio').twiml.MessagingResponse;
const bodyParser = require('body-parser');
const textbot = require('./textbot');

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));

app.post('/sms', (req, res) => {
  const twiml = new MessagingResponse();
  const message = twiml.message();

  message.body(textbot(req, res));

  res.writeHead(200, {'Content-Type': 'text/xml'});
  res.end(twiml.toString());
});

http.createServer(app).listen(3001, () => {
  console.log('Express server listening on port 3001');
});