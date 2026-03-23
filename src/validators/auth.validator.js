const Joi = require('joi');
const password = (value, helpers) => {
  if (
    !/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/.test(
      value
    )
  ) {
    return helpers.message(
      "Password must be 8 chars, include upper, lower, number & special char"
    );
  }
  return value;
};

const notifyAdmin = Joi.object({
  /* BASIC INFO */
  firstName: Joi.string().required(),
  lastName: Joi.string().required(),
  dob: Joi.date().required(),
  gender: Joi.string().required(),
  maritalStatus: Joi.string().required(),
  /* CONTACT */
  email: Joi.string().email().required(),
  emailVerified: Joi.boolean().default(false),
  phone: Joi.string().required(),
  phoneVerified: Joi.boolean().default(false),
  /* AUTH */
  password: Joi.string().required().custom(password),
  /* ADDRESS */
  address: Joi.string().required(),
  unit: Joi.string().allow("", null),
  city: Joi.string().required(),
  state: Joi.string().required(),
  zipCode: Joi.string().required(),
  isTexas: Joi.boolean().required(),

});

const register = Joi.object({
  firstName: Joi.string().required(),
  lastName: Joi.string().required(),
  email: Joi.string().email().required(),
  phone: Joi.string().required(),
  password: Joi.string().required(),

});

const login = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

const forgot = Joi.object({
  email: Joi.string().email().required(),
});

const reset = Joi.object({
  phone: Joi.string().required(),
  otp: Joi.string().max(6).min(6).required(),
  newPassword: Joi.string().required(),
});

const resetAdmin = Joi.object({
  email: Joi.string().email().required(),
  otp: Joi.string().max(6).min(6).required(),
  password: Joi.string().required(),
});

const verify = Joi.object({
  email: Joi.string().email(),
  phone: Joi.string().pattern(/^[0-9]{10}$/),
  otp: Joi.string().length(6).required(),
})
  .xor("email", "phone") // only one allowed
  .required();

const verifyCtg = Joi.object({
  email: Joi.string().email().required(),
  otp: Joi.string().max(6).min(6).required(),
});

const tokens = Joi.object({
  token: Joi.string().required(),
});

const logout = Joi.object({
  access: Joi.string().required(),
  refresh: Joi.string().required(),
});

// CTG RESET PASS
const ctgreset = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

const phoneVerify = Joi.object({
  phone: Joi.string().required(),
});

module.exports = {
  login,
  forgot,
  reset,
  tokens,
  logout,
  verify,
  phoneVerify,
  notifyAdmin,
  resetAdmin,
  verifyCtg,
  ctgreset,
  register
};
