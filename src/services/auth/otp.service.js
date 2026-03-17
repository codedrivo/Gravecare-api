const ApiError = require('../../helpers/apiErrorConverter');
const Otp = require('../../models/otp.model');
const User = require('../../models/user.model');
const crypto = require('crypto');
const email = require('../email/email.service');
const config = require('../../config/config');

function generateSecureOTP() {
  const digits = '0123456789';
  let otp = '';
  for (let i = 0; i < 6; i++) {
    const randomIndex = crypto.randomInt(0, digits.length);
    otp += digits[randomIndex];
  }
  return otp;
}

const createOtp = async ({ identifier, type }) => {
  // generate OTP
  const otp = generateSecureOTP();

  // remove old OTPs for same identifier & type
  await Otp.deleteMany({
    identifier,
    type,
  });

  // save OTP
  await Otp.create({
    otp,
    identifier,
    type,
    is_verified: false,
  });

  return otp;
};
const sendPhoneOTP = async (phone) => {
  try {
    const otp = await createOtp({
      identifier: phone,
      type: 'phone',
    });
    console.log(otp)
    await client.messages.create({
      body: `Your verification code is ${otp}. It will expire in 5 minutes.`,
      from: "+18885703324",
      to: "+12816509746"
      //to: phone,
    });
    return true;
  } catch (error) {
    throw new ApiError(error.message || 'Failed to send OTP', 500);
  }
};

const sendEmailOTP = async (userEmail, type, tempID) => {
  try {
    const otp = await createOtp({
      identifier: userEmail,
      type: type,
    });
    return email.sendSendgridEmail(userEmail, 'Email Verification', { otp: otp }, tempID);
  } catch (e) {
    throw new ApiError(e.message, 500);
  }
}

// Send support email
const sendSupportEmail = async (userEmail, tempID, data) => {
  try {
    return email.sendSendgridEmail(
      userEmail,
      'Lead Support Request',
      {
        name: data.fullname,
        email: data.email,
        phone: data.phone || 'N/A',
        message: data.message,
      },
      tempID
    );
  } catch (e) {
    throw new ApiError(e.message, 500);
  }
};

const checkVerifyOtp = async (identifier, otp, type) => {
  const normalizedIdentifier = identifier.toLowerCase();
  const record = await Otp.findOne({ identifier: normalizedIdentifier, otp, type, is_verified: false });
  if (!record) throw new ApiError('Invalid or expired OTP', 400);
  await Otp.deleteOne({ _id: record._id });
  return true;
};

const generateOtp = async (user, type) => {
  await Otp.deleteMany({ identifier: user.email, type: 'email' });

  const otp = await Otp.create({ otp: generateSecureOTP(), identifier: user.email, type: 'email', is_verified: false });
  if (!otp) {
    throw new ApiError('Error In OTP generations', 500);
  }
  if (type == 'emailVerify' || type == 'resend') {
    await email.sendSendgridEmail(
      user.email,
      'Email Verification',
      { otp: otp.otp },
      'd-1c767f05cc6249708e590c9298915074',
    );
  } else {
    await email.sendSendgridEmail(
      user.email,
      'Password Reset OTP',
      { otp: otp.otp },
      'd-c60beffa1f45430eb5ed565009adfef6',
    );
  }
};

const getOtpIfVerified = async (email, otp) => {
  const otpindb = await Otp.findOne({ email, otp });
  if (!otpindb) {
    throw new ApiError('Unverified Or Invalid OTP', 400);
  }
  return Otp.deleteOne({ _id: otpindb._id });
};

const resendOtp = async (user) => {
  let otp = await Otp.findOne({ email: user.email });

  if (!otp) {
    otp = await Otp.create({ otp: generateSecureOTP(), email: user.email });
  }

  if (!otp) {
    throw new ApiError('Error In OTP generations', 500);
  }

  await email.sendSendgridEmail(
    user.email,
    'Password Reset OTP',
    otp.otp,
    'd-8e092450a85a4e158288342590812cf9',
  );
};

const verifyOtp = async (email, otp) => {
  const otpindb = await Otp.findOne({identifier: email, otp });

  if (!otpindb) {
    throw new ApiError('Invalid OTP', 400);
  }

  const createdAt = otpindb.createdAt;

  const currentTime = new Date();

  const timeDifferenceInMilliseconds = currentTime - createdAt;
  const timeDifferenceInMinutes = timeDifferenceInMilliseconds / (1000 * 60);

  if (
    timeDifferenceInMinutes > Number(config.jwt.resetPasswordExpirationMinutes)
  ) {
    throw new ApiError('OTP expired', 400);
  }

  otpindb.is_verified = true;
  await otpindb.save();
  return;
};

module.exports = {
  generateOtp,
  getOtpIfVerified,
  resendOtp,
  verifyOtp,
  sendEmailOTP,
  checkVerifyOtp,
  sendPhoneOTP,
  sendSupportEmail
};
