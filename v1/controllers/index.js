const employee = require('./employee');
const admin = require('./admin');
const superAdmin = require('./superAdmin');
const upload = require('./upload');
module.exports = {
    superAdmin : superAdmin,
    admin : admin,
    employee : employee,
    upload : upload
}