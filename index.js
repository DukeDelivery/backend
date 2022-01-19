const accountSid = 'ACb4d281fe99edf5d56fb2bfb2e1147e2c';
const authToken = '9d49eb9a4535d36115cec39fcec7527d';
const client = require('twilio')(accountSid, authToken);

client.messages
  .create({
     body: 'Hello World',
     from: '+19892814706',
     to: '+19899542007'
   })
  .then(message => console.log(message.sid));