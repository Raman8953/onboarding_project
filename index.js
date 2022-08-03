const express = require('express');
const logger = require("morgan");
const routes = require('./v1/routes/index');
const responses = require("./services/index").response;
const dbConnection = require("./services/index").conn;
const socket = require("./services/index").socket;
const cors = require("cors");
const app = express();
process.env.NODE_CONFIG_DIR = 'config/';
/* Moving NODE_APP_INSTANCE aside during configuration loading */
const app_instance = process.argv.NODE_APP_INSTANCE;
process.argv.NODE_APP_INSTANCE = "";
global.config = require('config');
process.argv.NODE_APP_INSTANCE = app_instance;

app.use(cors());
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({
    extended: false
}));
app.use('/api/v1', routes);
app.use((error, req, res, next) => {
    console.log(error);
    return responses.sendResponseError(req, res, error.message || error, {});
});

if(process.env.NODE_ENV == 'local') {
    const http = require('http');
    server = http.createServer(app).listen(config.get('PORT'), function () {
        console.log("server listening 🌎 on port =>", config.get('PORT'));
        console.log('start socketInitialize');
            const io = require('socket.io')(server);
            socket(io);
            // cronJob.startCronJobs().then(console.log("cronJob.startCronJobs();"));
            // dbConnection.connect().then(console.log("connected to database", config.get('DB_NAME')));
            // logger.info({
            //     context: "APP",
            //     event: "Express server listening",
            //     message: {
            //         port: process.env.PORT,
            //         ENV: process.env.NODE_ENV
            //     }
            // });
    });

}else if(process.env.NODE_ENV == 'dev'){
    const https = require('https');
    const options = {
        key: fs.readFileSync(process.env.PRIVKEY),
        cert: fs.readFileSync(process.env.FULLCHAIN)
    };
    const server = https.createServer(options, app).listen(process.env.PORT, () => {
        console.log("server listening 🌎 on port =>", process.env.PORT);
        console.log('start socketInitialize');
            const io = require('socket.io')(server);
            socket(io);
            cronJob.startCronJobs().then(console.log("cronJob.startCronJobs();"));
            dbConnection.connect().then(console.log("connected to database", process.env.DB_NAME ));
            logger.info({
                context: "APP",
                event: "Express server listening",
                message: {
                    port: process.env.PORT,
                    ENV: process.env.NODE_ENV
                }
            });
    });
}

module.exports = app;