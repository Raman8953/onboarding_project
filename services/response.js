const sendResponse = async (req, res, message, data) => {
    try {
        return res.send({
            data: data,
            status : 200,
            message : message
        });
    } catch (error) {
        throw error;
    }
};
const sendResponseError = async (req, res, message, data) => {
    try {
        message = message || "";
        data = data || {};
        return res.status(400).send({
            data: data,
            status : 400,
            message : message.message || message
        });
    } catch (error) {
        throw error;
    }
};
module.exports = {
    sendResponse : sendResponse,
    sendResponseError : sendResponseError
}