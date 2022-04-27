

const prompt = (field) => {
  switch (field) {
    case 'start':
      return 'What is the date for your delivery (MM/DD/YYYY)?';
    case 'duration':
      return 'How much time will your delivery take (minutes)?';
    case 'time':
      return 'What is the time for your delivery (HH:MM XM)';
    case 'company':
      return 'What is the company for your delivery?';
    case 'description':
      return 'What is the item being delivered?';
    case 'contactName':
      return 'Who is the contact for your delivery?';
    case 'contactNumber':
      return 'What is the number of the contact for your delivery?';
    case 'gate':
      return 'Which gate is your delivery to?';
    case 'location':
      return 'What is the drop-off location for your delivery?';
  }
}
const error = (field) => {
  switch (field) {
    case 'start':
      return "Given date could not be understood. Please use MM/DD/YYYY format \nReply 'info' for help";
    case 'duration':
      return "Given duration could not be understood. Please only reply with a number.\nReply 'info' for help";
    case 'time':
      return "Given time could not be understood. Please use HH:MM XM format.\nReply 'info' for help";
    case 'company':
      return 'COMPANY PROMPT';
    case 'description':
      return 'DESCRIPTION PROMPT';
    case 'contactName':
      return 'CONTACT NAME PROMPT';
    case 'contactNumber':
      return 'CONTACT NUMBER PROMPT';
    case 'gate':
      return 'given gate not found.';
    case 'location':
      return 'LoCATION PROMPT';
  }
}
module.exports = {prompt, error};