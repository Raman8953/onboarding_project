const mongoose = require('mongoose');
global.config = require('config');
const autoIncrement = require('mongoose-auto-increment');
console.log('autoIncrement configurations',config.get('DB_URL'));
mongoose.connect(config.get('DB_URL'), {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    },
    function (err) {
      if (err) {
        console.log("mongoose Error ", err);
      } else {
        console.log("connected to mongodb via ",config.get('DB_URL'));
      }
    }
);
autoIncrement.initialize(mongoose);

module.exports = mongoose;