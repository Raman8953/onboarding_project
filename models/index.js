const admin = require('./admin');
const employee = require('./employee');
const superAdmin = require('./superAdmin');
const appSetting = require('./appSetting');
module.exports ={
    superAdmin : superAdmin,
    admin : admin,
    employee : employee,
    appSetting : appSetting
}