const bcrypt = require('bcryptjs');

const generateRandomStringAndNumbers = function (len) {
    var text = "";
    var possible = "abcdefghijklmnopqrstuvwxyz0123456789";
    for (var i = 0; i < len; i++){
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
};
const generateOtp = function (len) {
    var text = "";
    var possible = "0123456789";
    for (var i = 0; i < len; i++){
        text += possible[Math.floor(Math.random() * possible.length)];
    }
    console.log("otp---", text);
    return text;
};
const hashPassword = function (password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(10));
}
const compareHash = function (password, hash) {
    return bcrypt.compareSync(password, hash);
}

module.exports = {
    generateRandomStringAndNumbers : generateRandomStringAndNumbers,
    generateOtp : generateOtp,
    hashPassword : hashPassword,
    compareHash : compareHash
}