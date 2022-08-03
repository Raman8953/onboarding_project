const router = require("express").Router();
const controller = require("../controllers/index");
const services = require("../../services/index");

router.post("/login", controller.employee.login);
router.post("/sendOtp", controller.employee.sendOtp);
router.post("/verifyOtp", controller.employee.verifyOtp);
router.delete("/", services.auth.verify("employee"), controller.employee.logout);
router.get("/", services.auth.verify("employee"), controller.employee.getProfile);
router.put("/", services.auth.verify("employee"), controller.employee.updateProfile);
router.put("/changePassword", services.auth.verify("employee"), controller.employee.changePassword);
router.post("/sendEmailVerification", services.auth.verify("employee"), controller.employee.sendEmailVerification);
router.post("/verifyAccountEmail", services.auth.verify("employee"), controller.employee.verifyAccountEmail);
router.post("/resetPassword", services.auth.verify("employee"), controller.employee.resetPassword);

module.exports = router;