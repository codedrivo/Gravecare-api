const mongoose = require('mongoose');
const validator = require('validator');
const { toJSON, paginate } = require('./plugins');
const bcrypt = require('bcrypt');
const ApiError = require('../helpers/apiErrorConverter');

/* ================= USER ================= */
const userSchema = new mongoose.Schema(
  {
    // Basic Information
    firstName: {
      type: String,
      trim: true,
      required: true
    },
    lastName: {
      type: String,
      trim: true,
      required: true
    },
    email: {
      type: String,
      unique: true,
      trim: true,
      lowercase: true,
      required: true,
      index: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new ApiError("Invalid email", 400);
        }
      },
    },
    phone: {
      type: String,
      trim: true,
      unique: true,
      sparse: true,
      validate(value) {
        if (value && !validator.isMobilePhone(value, 'any', { strictMode: false })) {
          throw new ApiError("Invalid phone number", 400);
        }
      },
    },
    role: {
      type: String,
      enum: ["admin", "user"],
      default: "user",
    },

    password: {
      type: String,
      trim: true,
      minlength: 8,
      private: true,
      required: true
    },

    // Profile Information
    profileimageurl: {
      type: String,
      default: "",
    },

  },
  {
    timestamps: true,
  }
);

// Indexes
userSchema.index({ email: 'text', phone: 'text' });

// Plugins
userSchema.plugin(toJSON);
userSchema.plugin(paginate);


// Check if user password is matching
userSchema.methods.isPasswordMatch = async function (password) {
  const user = this;
  return bcrypt.compare(password, user.password);
};

// Hash the user password before saving data to db
userSchema.pre('save', async function (next) {
  const user = this;
  if (user.isModified('password')) {
    user.password = await bcrypt.hash(user.password, 8);
  }
  next();
});

// Login user
userSchema.statics.loginUser = async function (email, password) {
  const user = await this.findOne({ email });

  if (!user) {
    throw new ApiError('User not found', 404);
  }

  if (!(await user.isPasswordMatch(password))) {
    throw new ApiError('Invalid email or password', 400);
  }

  return user;
};

// Find user by email or phone
userSchema.statics.findByEmailOrPhone = async function (identifier) {
  const user = await this.findOne({
    $or: [
      { email: identifier.toLowerCase() },
      { phone: identifier }
    ]
  });
  return user;
};

userSchema.set('toObject', { virtuals: true });
userSchema.set('toJSON', { virtuals: true });

const User = mongoose.model('User', userSchema);

module.exports = User;