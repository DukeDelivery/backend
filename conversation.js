const accountSid = 'ACb4d281fe99edf5d56fb2bfb2e1147e2c';
const authToken = '22d6b101a1b116663333104c5074d9aa';
const client = require('twilio')(accountSid, authToken);

client.conversations.conversations('CH7308d281d42d48dd83040cdd2dd57515')
                    .participants
                    .create({identity: 'testPineapple'})
                    .then(participant => console.log(participant.sid));