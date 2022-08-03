const auth = require('./auth');
const conn = require('./conn');
const cron = require('./cron');
const dbQueryServices = require('./dbQueryServices');
const response = require('./response');
const socket = require('./socket');
const utility = require('./utility');
const emailService = require('./emailService');
const constants = require('./constants');
const multilingualService = require('./multilingualService');
const language = require('./languages/index');

module.exports = {
    auth : auth,
    conn : conn,
    cron : cron,
    dbQueryServices : dbQueryServices,
    response : response,
    socket : socket,
    utility : utility,
    constants : constants,
    multilingualService : multilingualService,
    language : language,
    emailService : emailService
}