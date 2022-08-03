const router = require("express").Router();
const controller = require("../controllers/index");
const services = require("../../services/index");

router.post("/register", controller.superAdmin.register);
router.post("/login", controller.superAdmin.login);
router.post("/sendOtp", controller.superAdmin.sendOtp);
router.post("/verifyOtp", controller.superAdmin.verifyOtp);
router.delete("/", services.auth.verify("superAdmin"), controller.superAdmin.logout);
router.get("/", services.auth.verify("superAdmin"), controller.superAdmin.getProfile);
router.put("/", services.auth.verify("superAdmin"), controller.superAdmin.updateProfile);
router.put("/changePassword", services.auth.verify("superAdmin"), controller.superAdmin.changePassword);
router.post("/sendEmailVerification", services.auth.verify("superAdmin"), controller.superAdmin.sendEmailVerification);
router.post("/verifyAccountEmail", services.auth.verify("superAdmin"), controller.superAdmin.verifyAccountEmail);
router.post("/resetPassword", services.auth.verify("superAdmin"), controller.superAdmin.resetPassword);

module.exports = router;