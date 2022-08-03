const sgMail = require('@sendgrid/mail');
const models = require("../models/index");
const services = require('./index');
const {
  google
} = require('googleapis');
const MailComposer = require('nodemailer/lib/mail-composer');
const credentials = require('../config/credentials.json');
const tokens = require('../config/token.json');
module.exports = {
  async mailer(emailPayload) {
    try {
      let msg = {
        to: emailPayload.to,
        subject: emailPayload.title,
        html: emailPayload.message,
      };
      let sendGrid = null;
      if(emailPayload.appId){
        sendGrid = await getSendGrid(emailPayload.appId);
      }
      if (sendGrid != null) {
        sgMail.setApiKey(sendGrid.SENDGRIDKEY);
        msg.from = sendGrid.SENDGRIDFROMEMAIL;
        await sendEmailUsingSendgrid(msg);
      } else {
        await sendEmailUsingGsuite(msg);
      }
    } catch (error) {
      next(error);
    }
  }
};
/* G-SUITE services */
const getGmailService = () => {
  const {
    client_secret,
    client_id,
    redirect_uris
  } = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
  oAuth2Client.setCredentials(tokens);
  const gmail = google.gmail({
    version: 'v1',
    auth: oAuth2Client
  });
  return gmail;
};
const encodeMessage = (message) => {
  return Buffer.from(message).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};
const createMail = async (options) => {
  const mailComposer = new MailComposer(options);
  const message = await mailComposer.compile().build();
  return encodeMessage(message);
};
const sendMail = async (options) => {
  const gmail = getGmailService();
  const rawMessage = await createMail(options);
  const {
    data: {
      id
    } = {}
  } = await gmail.users.messages.send({
    userId: 'me',
    resource: {
      raw: rawMessage,
    },
  });
  return id;
};
async function sendEmailUsingGsuite(msg) {
  await sendMail(msg).then((response) => {
    console.log("Mail send Successfully by Gsuite")
  }).catch((err) => {
    console.log("error while sending mail", err);
  });

}
/* SENDGRID services */
async function getSendGrid(appId) {
  try {
    let checkAppSetting = await services.dbQueryServices.findOneWithProjection(models.superAdmin, {
      appId: appId
    }, {
      SENDGRIDFROMEMAIL: 1,
      SENDGRIDKEY: 1
    })
    if (checkAppSetting != null && checkAppSetting.SENDGRIDFROMEMAIL != "" && checkAppSetting.SENDGRIDKEY != "") {
      return checkAppSetting
    } else {
      return null;
    }
  } catch (error) {
    console.log(error);
  }
}
async function sendEmailUsingSendgrid(payload) {
  try {
    await sgMail.send(payload);
    console.log('email sent successfully');
    return true;
  } catch (error) {
    console.error(error, "resulterror");
  }
}