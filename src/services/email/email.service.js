const sgMail = require('@sendgrid/mail');
const config = require('../../config/config');
const logger = require('../../config/logger');

const sendSendgridEmail = async (to, subject, data, tid) => {
  const mailData = {
    to,
    from: config.email.from,
    subject,
    templateId: tid,
    dynamic_template_data: data,
  };
  await sendSGEmail(mailData);
};

const sendSGEmail = async (mailData) => {
  sgMail.setApiKey(config.email.sg.sendGridApiKey);
  try {
    await sgMail.send(mailData);
    logger.info('mail sent');
  } catch (error) {
    if (error.response) {
      logger.error(error.response.body);
    }
    throw error;
  }
};

module.exports = {
  sendSendgridEmail,
};
