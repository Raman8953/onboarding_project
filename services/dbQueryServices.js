const models = require('../models/index');
const mongoose = require("mongoose");
const services = require("./index");
const jwt = require('jsonwebtoken');

const create = async (db_name, qry) => {
    try {
        let resultData = await db_name.create(qry);
        await resultData.setPassword(qry.password);
        await resultData.save();
        resultData = await db_name.findOne({_id: resultData._id}).lean();
        let accessToken = await jwt.sign({
            _id: resultData._id,
            jti: resultData.jti
        }, config.get("jwtSecretKey"), {
            expiresIn: config.get("expiresIn")
        });
        resultData.accessToken = accessToken;
        return resultData;
    } catch (error) {
        console.log(error);
    }
}
const findOne = async (db_name, qry) => {
    try {
        const resultData = await db_name.findOne(qry).lean();
        return resultData;
    } catch (error) {
        console.log(error);
    }
}
const findWithPagination = async (db_name, qry, skip, limit) => {
    try {
        const resultData = await db_name.find(qry).skip(skip).limit(limit).sort({_id:-1}).lean();
        return resultData;
    } catch (error) {
        console.log(error);
    }
}
const findOneLoginRegister = async (db_name, qry) => {
    try {
        const resultData = await db_name.findOne(qry).lean();
        console.log("resultData-----", resultData)
        let accessToken = await services.auth.getToken({
            _id: resultData._id,
            jti: resultData.jti
        }, config.get("jwtSecretKey"), {
            expiresIn: config.get("expiresIn")
        });
        console.log(accessToken, "accessTokenaccessToken")
        resultData.accessToken = accessToken;
        return resultData;
    } catch (error) {
        console.log(error);
    }
}
const findOneLogin = async (db_name, qry, pMatch) => {
    try {
        let resultData = await db_name.findOne(qry);
        if (resultData != null) {
            await resultData.authenticate(pMatch.password);
            resultData.loginCount += 1;
            resultData.deviceToken = pMatch.deviceToken;
            resultData.deviceType = pMatch.deviceType;
            resultData.jti = pMatch.jti;
            resultData.lastLoginTime = new Date(),
                await resultData.save();
            resultData = await db_name.findOne(qry).lean();
            let accessToken = await jwt.sign({
                _id: resultData._id,
                jti: resultData.jti
            }, config.get("jwtSecretKey"), {
                expiresIn: config.get("expiresIn")
            });
            resultData.accessToken = accessToken;
            return resultData;
        } else {
            return resultData;
        }
    } catch (error) {
        console.log(error);
    }
}
const findOneWithAuthorization = async (db_name, qry, pMatch) => {
    try {
        let resultData = await db_name.findOne(qry);
        if (resultData != null) {
            resultData.jti = pMatch.jti;
            await resultData.save();
            resultData = await db_name.findOne(qry).lean();
            let accessToken = await jwt.sign({
                _id: resultData._id,
                jti: resultData.jti
            }, config.get("jwtSecretKey"), {
                expiresIn: config.get("expiresIn")
            });
            resultData.accessToken = accessToken;
            return resultData;
        } else {
            return resultData;
        }
    } catch (error) {
        console.log(error);
    }
}
const findOneAndUpdate = async (db_name, qry, updatePayload) => {
    try {
        const resultData = await db_name.findOneAndUpdate(qry, {
            $set: updatePayload
        }, {
            new: true
        }).lean();
        return resultData;
    } catch (error) {
        console.log(error);
    }
}
const findOneWithProjection = async (db_name, qry, projectedData) => {
    try {
        const resultData = await db_name.findOne(qry, projectedData).lean();
        return resultData;
    } catch (error) {
        console.log(error);
    }
}
const changePasswordQuery = async (db_name, qry, updatePayload) => {
    try {
        const resultData = await db_name.findOne(qry);
        await resultData.setPassword(updatePayload.password);
        await resultData.save();
        return resultData;
    } catch (error) {
        console.log(error);
    }
}
module.exports = {
    findOne: findOne,
    findOneLogin: findOneLogin,
    findOneLoginRegister: findOneLoginRegister,
    create: create,
    findOneAndUpdate: findOneAndUpdate,
    changePasswordQuery: changePasswordQuery,
    findOneWithProjection: findOneWithProjection,
    findOneWithAuthorization: findOneWithAuthorization,
    findWithPagination : findWithPagination
}