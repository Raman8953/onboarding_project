const router = require("express").Router();
const employee = require('./employee');
const admin = require('./admin');
const superAdmin = require('./superAdmin');
const upload = require('./upload');

router.use('/superAdmin', superAdmin);
router.use('/admin', admin);
router.use('/employee', employee);
router.use('/upload', upload);

module.exports = router;