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
            await services.dbQueryServices.findOneAndUpdate(models.employee, {
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
        await services.dbQueryServices.findOneAndUpdate(models.employee, {
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
module.exports.login = async (req, res, next) => {
    try {
        await validation.employee.login(req);
        const appId = req.headers.appid;
        const lang = req.headers.lang || "en";
        if (appId == null || appId == ""){
            throw new Error(await services.multilingualService.getResponseMessage("APPID_MISSING", lang));
        }
        const qry = {
            appId : appId,
            email: (req.body.email).toLowerCase()
        }
        const jti = await services.utility.generateRandomStringAndNumbers(12);
        const doc = await services.dbQueryServices.findOneLogin(models.employee, qry, {
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
        const appId = req.headers.appid;
        const lang = req.headers.lang || "en";
        if (appId == null || appId == ""){
            throw new Error(await services.multilingualService.getResponseMessage("APPID_MISSING", lang));
        }
        await services.dbQueryServices.findOneAndUpdate(models.employee, {
            _id: req.employee._id,
            appId : appId
        }, {
            jti: ""
        })
        return await services.response.sendResponse(req, res, await services.multilingualService.getResponseMessage("LOGOUT_SUCCESS", lang), {});
    } catch (error) {
        next(error);
    }
};
module.exports.getProfile = async (req, res, next) => {
    try {
        const appId = req.headers.appid;
        const lang = req.headers.lang || "en";
        if (appId == null || appId == ""){
            throw new Error(await services.multilingualService.getResponseMessage("APPID_MISSING", lang));
        }
        const doc = await services.dbQueryServices.findOne(models.employee, {
            _id: req.employee._id,
            appId : appId
        })
        return await services.response.sendResponse(req, res, await services.multilingualService.getResponseMessage("SUCCESSMSG", lang), doc);
    } catch (error) {
        next(error);
    }
};
module.exports.updateProfile = async (req, res, next) => {
    try {
        await validation.employee.updateProfile(req);
        const appId = req.headers.appid;
        const lang = req.headers.lang || "en";
        if (appId == null || appId == ""){
            throw new Error(await services.multilingualService.getResponseMessage("APPID_MISSING", lang));
        }
        const nin = {
            $nin: [req.employee._id]
        };
        if (req.body.email) {
            const checkEmail = await services.dbQueryServices.findOne(models.employee, {
                appId : appId,
                _id: nin,
                email: req.body.email,
                isDeleted: false,
            });
            if (checkEmail) {
                throw new Error(await services.multilingualService.getResponseMessage("EMAIL_ALREADY_IN_USE", lang));
            }
        }
        if (req.body.phoneNo) {
            const checkPhone = await services.dbQueryServices.findOne(models.employee, {
                appId : appId,
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
        const updated = await services.dbQueryServices.findOneAndUpdate(models.employee, {
            _id: req.employee._id
        }, req.body);
        return await services.response.sendResponse(req, res, await services.multilingualService.getResponseMessage("SUCCESSMSG", lang), updated);
    } catch (error) {
        next(error);
    }
};
module.exports.changePassword = async (req, res, next) => {
    try {
        await validation.employee.changePassword(req);
        const appId = req.headers.appid;
        const lang = req.headers.lang || "en";
        if (appId == null || appId == ""){
            throw new Error(await services.multilingualService.getResponseMessage("APPID_MISSING", lang));
        }
        if (req.body.oldPassword === req.body.newPassword) {
            throw new Error(await services.multilingualService.getResponseMessage("PASSWORDS_SHOULD_BE_DIFFERENT", lang));
        }
        const doc = await services.dbQueryServices.changePasswordQuery(models.employee, {
            _id: req.employee._id,
            appId : appId
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
        await validation.employee.sendOtp(req);
        const appId = req.headers.appid;
        const lang = req.headers.lang || "en";
        if (appId == null || appId == ""){
            throw new Error(await services.multilingualService.getResponseMessage("APPID_MISSING", lang));
        }
        let doc = null;
        if (req.body.email) {
            doc = await services.dbQueryServices.findOne(models.employee, {
                email: req.body.email.toLowerCase(),
                isDeleted: false,
                appId : appId
            });
        } else if (req.body.phoneNo) {
            doc = await services.dbQueryServices.findOne(models.employee, {
                dialCode: req.body.dialCode,
                phoneNo: req.body.phoneNo,
                isDeleted: false,
                appId : appId
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
        await validation.employee.verifyOtp(req);
        const appId = req.headers.appid;
        const lang = req.headers.lang || "en";
        if (appId == null || appId == ""){
            throw new Error(await services.multilingualService.getResponseMessage("APPID_MISSING", lang));
        }
        let doc = null;
        let criteria = {};
        if (req.body.email) {
            criteria = {
                email: req.body.email.toLowerCase(),
                isDeleted: false,
                appId : appId
            }
            doc = await services.dbQueryServices.findOne(models.employee, criteria);
        } else if (req.body.phoneNo) {
            criteria = {
                dialCode: req.body.dialCode,
                phoneNo: req.body.phoneNo,
                isDeleted: false,
                appId : appId
            }
            doc = await services.dbQueryServices.findOne(models.employee, criteria);
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
        await services.dbQueryServices.findOneAndUpdate(models.employee, criteria, updatedObj);
        doc = await services.dbQueryServices.findOneWithAuthorization(models.employee, criteria, {
            jti: await services.utility.generateRandomStringAndNumbers(10)
        });
        return await services.response.sendResponse(req, res, await services.multilingualService.getResponseMessage("OTP_VERIFIED", lang), doc);
    } catch (error) {
        next(error);
    }
};
module.exports.sendEmailVerification = async (req, res, next) => {
    try {
        await validation.employee.sendEmailVerification(req);
        const appId = req.headers.appid;
        const lang = req.headers.lang || "en";
        if (appId == null || appId == ""){
            throw new Error(await services.multilingualService.getResponseMessage("APPID_MISSING", lang));
        }
        const doc = await services.dbQueryServices.findOne(models.employee, {
            _id: req.employee._id,
            appId : appId
        })
        await _sendEmailVerification(doc, req.body.email.toLowerCase());
        return await services.response.sendResponse(req, res, await services.multilingualService.getResponseMessage("OTP_SENT", lang), {});
    } catch (error) {
        next(error);
    }
};
module.exports.verifyAccountEmail = async (req, res, next) => {
    try {
        await validation.employee.verifyAccountEmail(req);
        const appId = req.headers.appid;
        const lang = req.headers.lang || "en";
        if (appId == null || appId == ""){
            throw new Error(await services.multilingualService.getResponseMessage("APPID_MISSING", lang));
        }
        const doc = await services.dbQueryServices.findOne(models.employee, {
            _id: req.employee._id,
            "tempData.emailSecret": req.body.secretCode,
            isDeleted: false,
            appId : appId
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
        if (doc.tempData.email === req.employee.email) {
            delete tempData.email;
        }
        delete tempData.emailSecret;
        delete tempData.emailSecretExpiry;
        doc.tempData = tempData;
        await services.dbQueryServices.findOneAndUpdate(models.employee, {
            _id: req.employee._id,
            appId : appId
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
        await validation.employee.resetPassword(req);
        const appId = req.headers.appid;
        const lang = req.headers.lang || "en";
        if (appId == null || appId == ""){
            throw new Error(await services.multilingualService.getResponseMessage("APPID_MISSING", lang));
        }
        const doc = await services.dbQueryServices.findOne(models.employee, {
            _id: req.employee._id,
            appId : appId
        });
        if (!doc) {
            throw new Error(await services.multilingualService.getResponseMessage("ACCOUNT_NOT_FOUND", lang))
        }
        await services.dbQueryServices.changePasswordQuery(models.employee, {
            _id: req.employee._id,
            appId : appId
        }, {
            password: req.body.newPassword
        });
        return await services.response.sendResponse(req, res, await services.multilingualService.getResponseMessage("PASSWORD_RESET_SUCCESSFULLY", lang), {});
    } catch (error) {
        next(error);
    }
};