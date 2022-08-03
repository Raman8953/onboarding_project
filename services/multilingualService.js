const languages = require('./languages/index');
const constants = require('./constants');
const getResponseMessage = async(code, language) =>{
  let response = "";
  switch (language) {
    case constants.language.ENGLISH:
      response = languages.en[code];
      break;
    case constants.language.ARABIC:
      response = languages.ar[code];
      break;
    default:
      response = languages.en[code];
  }
  if (!response) {
    response = languages.en[code] || "";
  }
  return response;
}
module.exports = {
  getResponseMessage : getResponseMessage
}