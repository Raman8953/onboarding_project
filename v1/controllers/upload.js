const services = require("../../services/index");
/* ONBOARDING API'S */
module.exports.upload = async (req, res, next) => {
    try {
        console.log("upload complete");
        const appId = req.headers.appid;
        const lang = req.headers.lang || "en";
        if (appId == null || appId == "") {
            throw new Error(await services.multilingualService.getResponseMessage("APPID_MISSING", lang));
        }
        if (!req.file) {
            throw new Error(await services.multilingualService.getResponseMessage("UPLOADING_ERROR", lang));
        }
        const filePath = req.file;
        const image = filePath.location;
        return multilingualService.sendResponse(req, res, true, 1, 0, await multilingualService.getResponseMessage("SUCCESSMSG", lang), image);
    } catch (error) {
        next(error);
    }
};