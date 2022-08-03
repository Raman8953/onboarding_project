const models = require("../../models/index");
const moment = require("moment");
const validation = require("../validation/index");
const services = require("../../services/index");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;

const _sendEmailVerification = async (doc, email, appId) => {
    try {
        if (!doc) throw new Error(await services.multilingualService.getResponseMessage("DOC_MISSING", lang));
        if (!email) throw new Error(await services.multilingualService.getResponseMessage("EMAIL_MISSING", lang));
        doc = JSON.parse(JSON.stringify(doc));
        const tobeUpdated = {};
        const token = services.utility.generateOtp(4);
        if (doc.email && doc.email === email && doc.isEmailVerified === true) {
            tobeUpdated.email = email;
            tobeUpdated.tempData = Object.assign({}, doc.tempData, {
                email: email,
                emailSecret: token,
                emailSecretExpiry: moment().add(10, "m"),
            });
            await services.dbQueryServices.findOneAndUpdate(models.admin, {
                _id: doc._id
            }, tobeUpdated);
            if (token) {
                let sendPayload = {
                    to: email,
                    title: "Verify your account",
                    message: `Please, use this code address to verify your account - <b>${token}</b>`
                }
                services.emailService.mailer(sendPayload);
            }
            return;
        } else if (!doc.email) {
            tobeUpdated.email = email;
            tobeUpdated.isEmailVerified = false;
        }
        tobeUpdated.tempData = Object.assign({}, doc.tempData, {
            email: email,
            emailSecret: token,
            emailSecretExpiry: moment().add(10, "m"),
        });
        await services.dbQueryServices.findOneAndUpdate(models.admin, {
            _id: doc._id
        }, tobeUpdated);
        if (token) {
            let sendPayload = {
                to: email,
                title: "Verify your account",
                message: `Please, use this code address to verify your account - <b>${token}</b>`
            }
            services.emailService.mailer(sendPayload);
        }
        return;
    } catch (error) {
        throw new Error(error)
    }
};
/* ONBOARDING API'S */
module.exports.register = async (req, res, next) => {
    try {
        await validation.admin.register(req);
        const lang = req.headers.lang || "en";
        if (req.body.email) {
            const checkEmail = await services.dbQueryServices.findOne(models.admin, {
                email: (req.body.email).toLowerCase(),
                isDeleted: false,
            });
            if (checkEmail) {
                throw new Error(await services.multilingualService.getResponseMessage("EMAIL_ALREADY_IN_USE", lang));
            }
        }
        if (req.body.phoneNo) {
            const checkPhone = await services.dbQueryServices.findOne(models.admin, {
                dialCode: req.body.dialCode,
                phoneNo: req.body.phoneNo,
                isDeleted: false,
            });
            if (checkPhone) {
                throw new Error(await services.multilingualService.getResponseMessage("PHONE_ALREADY_IN_USE", lang));
            }
        }
        req.body.jti = await services.utility.generateRandomStringAndNumbers(10);
        req.body.appId = await services.utility.generateRandomStringAndNumbers(32);
        const doc = await services.dbQueryServices.create(models.admin, req.body);
        return await services.response.sendResponse(req, res, await services.multilingualService.getResponseMessage("ACCOUNT_CREATED_SUCCESSFULLY", lang), doc);
    } catch (error) {
        next(error);
    }
};
module.exports.login = async (req, res, next) => {
    try {
        await validation.admin.login(req);
        const lang = req.headers.lang || 'en';
        const qry = {
            email: (req.body.email).toLowerCase()
        }
        const jti = await services.utility.generateRandomStringAndNumbers(12);
        const doc = await services.dbQueryServices.findOneLogin(models.admin, qry, {
            password: req.body.password,
            deviceToken: req.body.deviceToken,
            deviceType: req.body.deviceType,
            jti: jti
        })
        if (!doc) {
            throw new Error(await services.multilingualService.getResponseMessage("INVALID_CREDENTIALS", lang));
        }
        return await services.response.sendResponse(req, res, await services.multilingualService.getResponseMessage("LOGIN_SUCCESS", lang), doc);
    } catch (error) {
        next(error);
    }
};
module.exports.logout = async (req, res, next) => {
    try {
        const lang = req.headers.lang || 'en';
        const adminData = await services.dbQueryServices.findOneAndUpdate(models.admin, {
            _id: req.admin._id
        }, {
            jti: ""
        })
        return await services.response.sendResponse(req, res, await services.multilingualService.getResponseMessage("LOGOUT_SUCCESS", lang), adminData);
    } catch (error) {
        next(error);
    }
};
module.exports.getProfile = async (req, res, next) => {
    try {
        const lang = req.headers.lang || "en";
        const doc = await services.dbQueryServices.findOne(models.admin, {
            _id: req.admin._id
        })
        return await services.response.sendResponse(req, res, await services.multilingualService.getResponseMessage("SUCCESSMSG", lang), doc);
    } catch (error) {
        next(error);
    }
};
module.exports.updateProfile = async (req, res, next) => {
    try {
        await validation.admin.updateProfile(req);
        const lang = req.headers.lang || "en";
        const nin = {
            $nin: [req.admin._id]
        };
        if (req.body.email) {
            const checkEmail = await services.dbQueryServices.findOne(models.admin, {
                _id: nin,
                email: req.body.email,
                isDeleted: false,
            });
            if (checkEmail) {
                throw new Error(await services.multilingualService.getResponseMessage("EMAIL_ALREADY_IN_USE", lang));
            }
        }
        if (req.body.phoneNo) {
            const checkPhone = await services.dbQueryServices.findOne(models.admin, {
                _id: nin,
                dialCode: req.body.dialCode,
                phoneNo: req.body.phoneNo,
                isDeleted: false,
            });
            if (checkPhone) {
                throw new Error(await services.multilingualService.getResponseMessage("PHONE_ALREADY_IN_USE", lang));
            }
        }
        req.body.isProfileSetup = true;
        const updated = await services.dbQueryServices.findOneAndUpdate(models.admin, {
            _id: req.admin._id
        }, req.body);
        return await services.response.sendResponse(req, res, await services.multilingualService.getResponseMessage("SUCCESSMSG", lang), updated);
    } catch (error) {
        next(error);
    }
};
module.exports.changePassword = async (req, res, next) => {
    try {
        await validation.admin.changePassword(req);
        const lang = req.headers.lang || "en";
        if (req.body.oldPassword === req.body.newPassword) {
            throw new Error(await services.multilingualService.getResponseMessage("PASSWORDS_SHOULD_BE_DIFFERENT", lang));
        }
        const doc = await services.dbQueryServices.changePasswordQuery(models.admin, {
            _id: req.admin._id
        }, {
            password: req.body.newPassword
        });
        if (!doc) {
            throw new Error(await services.multilingualService.getResponseMessage("ACCOUNT_NOT_FOUND", lang));
        }
        return await services.response.sendResponse(req, res, await services.multilingualService.getResponseMessage("PASSWORD_CHANGED_SUCCESSFULLY", lang), doc);
    } catch (error) {
        next(error);
    }
};
module.exports.sendOtp = async (req, res, next) => {
    try {
        await validation.admin.sendOtp(req);
        const lang = req.headers.lang || "en";
        let doc = null;
        if (req.body.email) {
            doc = await services.dbQueryServices.findOne(models.admin, {
                email: req.body.email.toLowerCase(),
                isDeleted: false,
            });
        } else if (req.body.phoneNo) {
            doc = await services.dbQueryServices.findOne(models.admin, {
                dialCode: req.body.dialCode,
                phoneNo: req.body.phoneNo,
                isDeleted: false,
            });
        }
        if (!doc) {
            throw new Error(await services.multilingualService.getResponseMessage("ACCOUNT_NOT_FOUND", lang))
        }
        if (req.body.email) {
            await _sendEmailVerification(doc, req.body.email.toLowerCase());
        }
        if (req.body.dialCode && req.body.phoneNo) {
            // await _sendPhoneVerification(doc, req.body.dialCode, req.body.phoneNo);
        }
        return await services.response.sendResponse(req, res, await services.multilingualService.getResponseMessage("OTP_SENT", lang), {});
    } catch (error) {
        next(error);
    }
};
module.exports.verifyOtp = async (req, res, next) => {
    try {
        await validation.admin.verifyOtp(req);
        const lang = req.headers.lang || "en";
        let doc = null;
        let criteria = {};
        if (req.body.email) {
            criteria = {
                email: req.body.email.toLowerCase(),
                isDeleted: false,
            }
            doc = await services.dbQueryServices.findOne(models.admin, criteria);
        } else if (req.body.phoneNo) {
            criteria = {
                dialCode: req.body.dialCode,
                phoneNo: req.body.phoneNo,
                isDeleted: false,
            }
            doc = await services.dbQueryServices.findOne(models.admin, criteria);
        }
        if (!doc) {
            throw new Error(await services.multilingualService.getResponseMessage("ACCOUNT_NOT_FOUND", lang))
        };
        let updatedObj = {};
        if (req.body.email) {
            if (req.body.secretCode != doc.tempData.emailSecret) {
                throw new Error(await services.multilingualService.getResponseMessage("INVALID_OTP", lang));
            }
            if (doc.tempData.emailSecretExpiry < moment()) {
                throw new Error(await services.multilingualService.getResponseMessage("LINK_EXPIRED", lang));
            }
            let tempData = {
                emailSecret: "",
                emailSecretExpiry: new Date(0)
            }
            updatedObj = {
                isEmailVerified: true,
                tempData: tempData
            }
        } else if (req.body.phoneNo) {
            if (req.body.secretCode !== doc.tempData.phoneSecretCode) {
                throw new Error(await services.multilingualService.getResponseMessage("INVALID_OTP", lang));
            }
            let tempData = {
                phoneSecretCode: "",
                phoneSecretExpiry: new Date(0)
            }
            updatedObj = {
                isPhoneVerified: true,
                tempData: tempData
            }
        }
        await services.dbQueryServices.findOneAndUpdate(models.admin, criteria, updatedObj);
        doc = await services.dbQueryServices.findOneWithAuthorization(models.admin, criteria, {
            jti: await services.utility.generateRandomStringAndNumbers(10)
        });
        return await services.response.sendResponse(req, res, await services.multilingualService.getResponseMessage("OTP_VERIFIED", lang), doc);
    } catch (error) {
        next(error);
    }
};
module.exports.sendEmailVerification = async (req, res, next) => {
    try {
        await validation.admin.sendEmailVerification(req);
        const lang = req.headers.lang || "en";
        const doc = await services.dbQueryServices.findOne(models.admin, {
            _id: req.admin._id
        })
        await _sendEmailVerification(doc, req.body.email.toLowerCase());
        return await services.response.sendResponse(req, res, await services.multilingualService.getResponseMessage("OTP_SENT", lang), {});
    } catch (error) {
        next(error);
    }
};
module.exports.verifyAccountEmail = async (req, res, next) => {
    try {
        await validation.admin.verifyAccountEmail(req);
        const lang = req.headers.lang || "en";
        const doc = await services.dbQueryServices.findOne(models.admin, {
            _id: req.admin._id,
            "tempData.emailSecret": req.body.secretCode,
            isDeleted: false,
        })
        if (!doc) {
            throw new Error(await services.multilingualService.getResponseMessage("ACCOUNT_NOT_FOUND", lang));
        }
        if (!doc.tempData || !doc.tempData.emailSecretExpiry || doc.tempData.emailSecretExpiry < new Date().valueOf()) {
            throw new Error(await services.multilingualService.getResponseMessage("LINK_EXPIRED", lang));
        }
        doc.email = doc.tempData.email;
        doc.isEmailVerified = true;
        const tempData = {
            ...doc.tempData
        };
        if (doc.tempData.email === req.admin.email) {
            delete tempData.email;
        }
        delete tempData.emailSecret;
        delete tempData.emailSecretExpiry;
        doc.tempData = tempData;
        await services.dbQueryServices.findOneAndUpdate(models.admin, {
            _id: req.admin._id
        }, doc);
        return await services.response.sendResponse(req, res, await services.multilingualService.getResponseMessage("EMAIL_VERIFIED_SUCCESSFULLY", lang), {});
    } catch (error) {
        console.error(error);
        error.message = "INVALID_LINK";
        next(error);
    }
};
module.exports.resetPassword = async (req, res, next) => {
    try {
        await validation.admin.resetPassword(req);
        const lang = req.headers.lang || "en";
        const doc = await services.dbQueryServices.findOne(models.admin, {
            _id: req.admin._id
        });
        if (!doc) {
            throw new Error(await services.multilingualService.getResponseMessage("ACCOUNT_NOT_FOUND", lang))
        }
        await services.dbQueryServices.changePasswordQuery(models.admin, {
            _id: req.admin._id
        }, {
            password: req.body.newPassword
        });
        return await services.response.sendResponse(req, res, await services.multilingualService.getResponseMessage("PASSWORD_RESET_SUCCESSFULLY", lang), {});
    } catch (error) {
        next(error);
    }
};
/* Employee Modules */
module.exports.addEmployee = async (req, res, next) => {
    try {
        await validation.admin.addEmployee(req);
        const appId = req.headers.appid;
        const lang = req.headers.lang || "en";
        if (appId == null || appId == ""){
            throw new Error(await services.multilingualService.getResponseMessage("APPID_MISSING", lang));
        }
        if (req.body.email) {
            const checkEmail = await services.dbQueryServices.findOne(models.user, {
                appId : appId,
                email: (req.body.email).toLowerCase(),
                isDeleted: false,
            });
            if (checkEmail) {
                throw new Error(await services.multilingualService.getResponseMessage("EMAIL_ALREADY_IN_USE", lang));
            }
        }
        if (req.body.phoneNo) {
            const checkPhone = await services.dbQueryServices.findOne(models.user, {
                appId: req.body.appId,
                dialCode: req.body.dialCode,
                phoneNo: req.body.phoneNo,
                isDeleted: false,
            });
            if (checkPhone) {
                throw new Error(await services.multilingualService.getResponseMessage("PHONE_ALREADY_IN_USE", lang));
            }
        }
        req.body.jti = await services.utility.generateRandomStringAndNumbers(10);
        req.body.appId = appId;
        const doc = await services.dbQueryServices.create(models.employee, req.body);
        return await services.response.sendResponse(req, res, await services.multilingualService.getResponseMessage("ACCOUNT_CREATED_SUCCESSFULLY", lang), doc);
    } catch (error) {
        next(error);
    }
};
module.exports.getEmployee = async (req, res, next) => {
    try {
        await validation.admin.getEmployee(req);
        const appId = req.headers.appid;
        const lang = req.headers.lang || "en";
        if (appId == null || appId == ""){
            throw new Error(await services.multilingualService.getResponseMessage("APPID_MISSING", lang));
        }
        const limit = req.query.limit || services.constants.limit;
        const skip = Number(req.query.page) > 1 ? (Number(req.query.page) - 1) * limit : 0;
        const doc = await services.dbQueryServices.findWithPagination(models.employee, {
            appId : appId,
            isDeleted : false
        }, skip, limit);
        if (!doc) {
            throw new Error(await services.multilingualService.getResponseMessage("EMPLOYEE_NOT_FOUND", lang));
        }
        return await services.response.sendResponse(req, res, await services.multilingualService.getResponseMessage("SUCCESSMSG", lang), doc);
    } catch (error) {
        next(error);
    }
};
module.exports.getEmployeeById = async (req, res, next) => {
    try {
        await validation.admin.getEmployeeById(req);
        const appId = req.headers.appid;
        const lang = req.headers.lang || "en";
        if (appId == null || appId == ""){
            throw new Error(await services.multilingualService.getResponseMessage("APPID_MISSING", lang));
        }
        const doc = await services.dbQueryServices.findOne(models.employee, {
            appId : appId,
            _id : ObjectId(req.query.id)
        });
        if (!doc) {
            throw new Error(await services.multilingualService.getResponseMessage("EMPLOYEE_NOT_FOUND", lang));
        }
        return await services.response.sendResponse(req, res, await services.multilingualService.getResponseMessage("SUCCESSMSG", lang), doc);
    } catch (error) {
        next(error);
    }
};
module.exports.updateEmployeeProfile = async (req, res, next) => {
    try {
        await validation.admin.updateEmployeeProfileId(req);
        await validation.admin.updateEmployeeProfileData(req);
        const appId = req.headers.appid;
        const lang = req.headers.lang || "en";
        if (appId == null || appId == ""){
            throw new Error(await services.multilingualService.getResponseMessage("APPID_MISSING", lang));
        }
        const nin = {
            $nin: [ObjectId(req.query.id)]
        };
        if (req.body.email) {
            const checkEmail = await services.dbQueryServices.findOne(models.employee, {
                _id: nin,
                email: req.body.email,
                isDeleted: false,
                appId : appId
            });
            if (checkEmail) {
                throw new Error(await services.multilingualService.getResponseMessage("EMAIL_ALREADY_IN_USE", lang));
            }
        }
        if (req.body.phoneNo) {
            const checkPhone = await services.dbQueryServices.findOne(models.employee, {
                _id: nin,
                dialCode: req.body.dialCode,
                phoneNo: req.body.phoneNo,
                isDeleted: false,
                appId : appId
            });
            if (checkPhone) {
                throw new Error(await services.multilingualService.getResponseMessage("PHONE_ALREADY_IN_USE", lang));
            }
        }
        const updated = await services.dbQueryServices.findOneAndUpdate(models.employee, {
            appId : appId,
            _id: ObjectId(req.query.id)
        }, req.body);
        return await services.response.sendResponse(req, res, await services.multilingualService.getResponseMessage("SUCCESSMSG", lang), updated);
    } catch (error) {
        next(error);
    }
};
module.exports.deleteEmployeeById = async (req, res, next) => {
    try {
        await validation.admin.deleteEmployeeById(req);
        const appId = req.headers.appid;
        const lang = req.headers.lang || "en";
        if (appId == null || appId == ""){
            throw new Error(await services.multilingualService.getResponseMessage("APPID_MISSING", lang));
        }
        const doc = await services.dbQueryServices.findOneAndUpdate(models.employee, {
            appId : appId,
            _id : ObjectId(req.query.id)
        },{isDeleted : true});
        if (!doc) {
            throw new Error(await services.multilingualService.getResponseMessage("EMPLOYEE_NOT_FOUND", lang));
        }
        return await services.response.sendResponse(req, res, await services.multilingualService.getResponseMessage("SUCCESSMSG", lang), {});
    } catch (error) {
        next(error);
    }
};