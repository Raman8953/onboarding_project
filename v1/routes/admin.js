const router = require("express").Router();
const controller = require("../controllers/index");
const services = require("../../services/index");

/* Onboarding Flow */
router.post("/register", controller.admin.register);
router.post("/login", controller.admin.login);
router.post("/sendOtp", controller.admin.sendOtp);
router.post("/verifyOtp", controller.admin.verifyOtp);
router.delete("/", services.auth.verify("admin"), controller.admin.logout);
router.get("/", services.auth.verify("admin"), controller.admin.getProfile);
router.put("/", services.auth.verify("admin"), controller.admin.updateProfile);
router.put("/changePassword", services.auth.verify("admin"), controller.admin.changePassword);
router.post("/sendEmailVerification", services.auth.verify("admin"), controller.admin.sendEmailVerification);
router.post("/verifyAccountEmail", services.auth.verify("admin"), controller.admin.verifyAccountEmail);
router.post("/resetPassword", services.auth.verify("admin"), controller.admin.resetPassword);
/* Employee Modules */
router.post("/addEmployee", services.auth.verify("admin"), controller.admin.addEmployee);
router.get("/getEmployee", services.auth.verify("admin"), controller.admin.getEmployee);
router.get("/getEmployeeById", services.auth.verify("admin"), controller.admin.getEmployeeById);
router.put("/updateEmployeeProfile", services.auth.verify("admin"), controller.admin.updateEmployeeProfile);
router.delete("/deleteEmployeeById", services.auth.verify("admin"), controller.admin.deleteEmployeeById);


module.exports = router;