const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const bcrypt = require("bcryptjs");
const ObjectId = mongoose.Types.ObjectId;

const DocSchema = new Schema({
    appId : {
        type: String,
        required: true,
    },
    SENDGRIDFROMEMAIL : {
        type: String,
        default: ""
    },
    SENDGRIDKEY : {
        type: String,
        default: ""
    }
},{
        timestamps: true
    }
);
DocSchema.set("toJSON", {
    getters: true,
    virtuals: true
});

module.exports = mongoose.model("appsettings", DocSchema);