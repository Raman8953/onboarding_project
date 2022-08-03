const jwt = require('jsonwebtoken');
const models = require('../models/index');

const getToken = async (data) => {
    try {
        console.log(config.jwtSecretKey, "config.get", data);
        return await jwt.sign(data, config.get("jwtSecretKey"), {
            expiresIn: config.get("expiresIn")
        });
    } catch (error) {
        console.log(error);
    }
}
const verifyToken = (token) => {
    return jwt.verify(token, config.get("jwtSecretKey"));
};
const verify = (...args) => async (req, res, next) => {
    try {
        const lang = req.headers.lang || 'en';
        const roles = [].concat(args).map((role) => role.toLowerCase());
        const token = String(req.headers.authorization || "").replace(/bearer|jwt/i, "").replace(/^\s+|\s+$/g, "");
        let decoded;
        if (token) {
            decoded = await verifyToken(token);
            console.log(decoded);
        } else {
            throw new Error("The authorization token is required");
        }
        let doc = null;
        let role = "";
        if (!decoded && roles.includes("guest")) {
            role = "guest";
            return next();
        }
        if (roles.includes("employee")) {
            role = "employee";
            doc = await models.employee.findOne({
                _id: decoded._id,
                accessToken: token,
                isBlocked: false,
                isDeleted: false,
            });
        } else if (roles.includes("admin")) {
            role = "admin";
            doc = await models.admin.findOne({
                _id: decoded._id,
                accessToken: token,
                isBlocked: false,
                isDeleted: false,
            });
        } else if (roles.includes("superadmin")) {
            role = "superAdmin";
            doc = await models.superAdmin.findOne({
                _id: decoded._id,
                jti: decoded.jti
            });
        }
        if (!doc) {
            throw new Error("Your authorization is invalid");
        }
        if (role) req[role] = doc.toJSON();
        // proceed next
        next();
    } catch (error) {
        return res.status(401).send({
            data: {},
            status: 401,
            message: error.message || error
        });
    }
};
module.exports = {
    getToken: getToken,
    verifyToken: verifyToken,
    verify: verify
}