var aws = require('aws-sdk');
const router = require("express").Router();
const multer = require("multer");
const multerS3 = require('multer-s3');
const controller = require("../controllers/index");
aws.config.update({
    secretAccessKey: config.get('SECRETACCESSKEY'),
    accessKeyId: config.get('ACCESSKEYS3'),
    region: config.get('region')
});
var s3 = new aws.S3();
var upload = multer({
    storage: multerS3({
        s3: s3,
        bucket: config.get('BUCKET_NAME'),
        acl: "public-read",
        key: function (req, file, cb) {
            console.log(file);
            cb(null, Date.now() + "_" + file.originalname); //use Date.now() for unique file keys
        }
    })
});

router.post('/', upload.single('file'), controller.upload.upload);

module.exports = router;