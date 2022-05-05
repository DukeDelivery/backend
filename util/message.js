

const prompt = (field) => {
  switch (field) {
    case 'start':
      return 'What is the date for your delivery (MM/DD/YYYY)?';
    case 'duration':
      return 'How much time will your delivery take (minutes)?';
    case 'time':
      return 'What is the time for your delivery (HH:MM XM)?';
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
    case 'notes':
      return "Please reply with any additional notes for your delivery (reply 'none' for no note)"
  }
}
const error = (field) => {
  switch (field) {
    case 'start':
      return "Given date could not be understood. Please use MM/DD/YYYY format.\nReply 'info' for help.";
    case 'duration':
      return "Given duration could not be understood. Please only reply with a number.\nReply 'info' for help.";
    case 'time':
      return "Given time could not be understood. Please use HH:MM XM format.\nReply 'info' for help.";
    case 'company':
      return "Given company could not be understood.\nReply 'info' for help.";
    case 'description':
      return "Given delivery description could not be understood.\n Reply 'info' for help.";
    case 'contactName':
      return "Given contact name description could not be understood.\n Reply 'info' for help.";
    case 'contactNumber':
      return "Given contact number could not be understood.\n Reply 'info' for help.";
    case 'gate':
      return 'given gate not found.';
    case 'location':
      return "Given drop-off location could not be understood.\n Reply 'info' for help.";
  }
}
module.exports = {prompt, error};