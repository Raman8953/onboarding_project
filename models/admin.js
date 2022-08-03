const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const bcrypt = require("bcryptjs");
const ObjectId = mongoose.Types.ObjectId;

const DocSchema = new Schema({
        appId : {
            type : String,
            required : true
        },
        email: {
            type: String,
            unique: true,
            lowercase: true,
            index: true
        },
        phoneNo: {
            type: String,
            unique: true,
            default: ""
        },
        dialCode: {
            type: String,
            default: ""
        },
        password: {
            type: String,
            default: "",
            index: true
        },
        firstName: {
            type: String,
            default: ""
        },
        lastName: {
            type: String,
            default: ""
        },
        image: {
            type: String,
            default: ""
        },
        country: {
            type: String,
            default: ""
        },
        state: {
            type: String,
            default: ""
        },
        city: {
            type: String,
            default: ""
        },
        address: {
            type: String,
            default: ""
        },
        latitude: {
            type: Number,
            default: 0
        },
        longitude: {
            type: Number,
            default: 0
        },
        isProfileSetup: {
            type: Boolean,
            default: false
        },
        isEmailVerified: {
            type: Boolean,
            default: false
        },
        isPhoneVerified: {
            type: Boolean,
            default: false
        },
        isActive: {
            type: Boolean,
            default: false
        },
        isBlocked: {
            type: Boolean,
            default: false
        },
        isDeleted: {
            type: Boolean,
            default: false
        },
        loginCount: {
            type: Number,
            default: 0
        },
        lastLoginTime: {
            type: Date
        },
        jti: {
            type: String,
            default: "",
        },
        deviceToken: {
            type: String,
            default: "",
            index: true
        },
        deviceType: {
            type: String,
            default: "",
            enum: ["", "WEB", "IOS", "ANDROID"]
        },
        location: {
            type: {
                type: String,
                default: "Point"
            },
            coordinates: {
                type: [Number],
                default: [0, 0]
            }
        },
        tempData: {
            type: Object,
            default: {}
        },
    },{
        timestamps: true
    }
);


DocSchema.index({
    location: "2dsphere"
});
DocSchema.index({
    dialCode: 1,
    phoneNo: 1
});
DocSchema.set("toJSON", {
    getters: true,
    virtuals: true
});

DocSchema.virtual("fullName").get(function () {
    return this.firstName + " " + this.lastName;
}).set(function (val) {
    this.firstName = val.substr(0, val.indexOf(" "));
    this.lastName = val.substr(val.indexOf(" ") + 1);
});

DocSchema.methods.authenticate = function (password, callback) {
    const promise = new Promise((resolve, reject) => {
        if (!password) reject(new Error("MISSING_PASSWORD"));

        bcrypt.compare(password, this.password, (error, result) => {
            if (!result) reject(new Error("Invalid credential"));
            resolve(this);
        });
    });

    if (typeof callback !== "function") return promise;
    promise.then((result) => callback(null, result)).catch((err) => callback(err));
};
DocSchema.methods.setPassword = function (password, callback) {
    const promise = new Promise((resolve, reject) => {
        if (!password) reject(new Error("Missing Password"));

        bcrypt.hash(password, 10, (err, hash) => {
            if (err) reject(err);
            this.password = hash;
            resolve(this);
        });
    });

    if (typeof callback !== "function") return promise;
    promise.then((result) => callback(null, result)).catch((err) => callback(err));
};

module.exports = mongoose.model("admins", DocSchema);