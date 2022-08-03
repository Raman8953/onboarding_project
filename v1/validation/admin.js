const joi = require("joi");

const validateSchema = async (inputs, schema) => {
  try {
    const {
      error,
      value
    } = schema.validate(inputs);
    console.log(error,"error: ");
    if (error) throw error.details ? error.details[0].message.replace(/['"]+/g, "") : "";
    else return false;
  } catch (error) {
    throw error;
  }
};

/* ONBOARDING */
exports.login = async (req, property = "body") => {
  let schema = joi.object().keys({
    email: joi.string().required(),
    password: joi.string().required()
  });
  return await validateSchema(req[property], schema);
};
exports.register = async (req, property = "body") => {
  let schema = joi.object().keys({
    firstName: joi.string().required().min(3).max(30).regex(/^[a-zA-Z ]+$/),
    lastName: joi.string().optional().allow("", null),
    email: joi.string().required(),
    password: joi.string().required()
  });
  return await validateSchema(req[property], schema);
};
exports.updateProfile = async (req, property = "body") => {
  let schema = joi.object().keys({
    firstName: joi.string().optional().min(3).max(30).regex(/^[a-zA-Z ]+$/),
    lastName: joi.string().optional().allow("", null),
    email: joi.string().optional().allow(""),
    phoneNo: joi.string().regex(/^[0-9]{5,}$/).optional().allow(""),
    dialCode: joi.string().regex(/^\+?[0-9]{1,}$/).optional().allow(""),
    image : joi.string().optional().allow(""),
    country : joi.string().optional().allow(""),
  });
  return await validateSchema(req[property], schema);
};
exports.changePassword = async (req, property = "body") => {
  let schema = joi.object().keys({
    oldPassword: joi.string().required(),
    newPassword: joi.string().required()
  });
  return await validateSchema(req[property], schema);
};
exports.sendOtp = async (req, property = "body") => {
  let schema = joi.object().keys({
    email: joi.string().optional().allow(""),
    phoneNo: joi.string().regex(/^[0-9]{5,}$/).optional().allow(""),
    dialCode: joi.string().regex(/^[0-9]{5,}$/).optional().allow(""),
  }).or("phoneNo", "email")
  .with("phoneNo", "dialCode");
  return await validateSchema(req[property], schema);
};
exports.verifyOtp = async (req, property = "body") => {
  let schema = joi.object().keys({
    email: joi.string().optional().allow(""),
    phoneNo: joi.string().regex(/^[0-9]{5,}$/).optional().allow(""),
    dialCode: joi.string().regex(/^[0-9]{5,}$/).optional().allow(""),
    secretCode: joi.number().required(),
  }).or("phoneNo", "email")
  .with("phoneNo", "dialCode");
  return await validateSchema(req[property], schema);
};
exports.sendEmailVerification = async (req, property = "body") => {
  let schema = joi.object().keys({
    email: joi.string().required()
  })
  return await validateSchema(req[property], schema);
};
exports.verifyAccountEmail = async (req, property = "body") => {
  let schema = joi.object().keys({
    secretCode: joi.number().required(),
  })
  return await validateSchema(req[property], schema);
};
exports.resetPassword = async (req, property = "body") => {
  let schema = joi.object().keys({
    newPassword: joi.string().required(),
  })
  return await validateSchema(req[property], schema);
};
/* Employee Modules */
exports.addEmployee = async (req, property = "body") => {
  let schema = joi.object().keys({
    firstName: joi.string().required().min(3).max(30).regex(/^[a-zA-Z ]+$/),
    lastName: joi.string().optional().allow("", null),
    email: joi.string().required(),
    password: joi.string().required()
  });
  return await validateSchema(req[property], schema);
};
exports.getEmployee = async (req, property = "query") => {
  let schema = joi.object().keys({
    page: joi.string().optional(),
    limit: joi.string().optional()
  });
  return await validateSchema(req[property], schema);
};
exports.getEmployeeById = async (req, property = "query") => {
  let schema = joi.object().keys({
    id: joi.string().required().length(24)
  });
  return await validateSchema(req[property], schema);
};
exports.updateEmployeeProfileId = async (req, property = "query") => {
  let schema = joi.object().keys({
    id: joi.string().required().length(24)
  });
  return await validateSchema(req[property], schema);
};
exports.updateEmployeeProfileData = async (req, property = "body") => {
  let schema = joi.object().keys({
    firstName: joi.string().optional().min(3).max(30).regex(/^[a-zA-Z ]+$/),
    lastName: joi.string().optional().allow("", null),
    email: joi.string().optional().allow(""),
    phoneNo: joi.string().regex(/^[0-9]{5,}$/).optional().allow(""),
    dialCode: joi.string().regex(/^\+?[0-9]{1,}$/).optional().allow(""),
    image : joi.string().optional().allow(""),
    country : joi.string().optional().allow(""),
  });
  return await validateSchema(req[property], schema);
};
exports.deleteEmployeeById = async (req, property = "query") => {
  let schema = joi.object().keys({
    id: joi.string().required().length(24)
  });
  return await validateSchema(req[property], schema);
};
