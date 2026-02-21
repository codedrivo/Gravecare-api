const mongoose = require('mongoose');
const validator = require('validator');
const { toJSON, paginate } = require('./plugins');
const bcrypt = require('bcrypt');
const ApiError = require('../helpers/apiErrorConverter');

// ================= LIFE STAGE LOCATION SCHEMA =================
const lifeStageLocationSchema = new mongoose.Schema(
  {
    cityState: {
      type: String,
      trim: true,
      default: "",
    },
    areaType: {
      type: String,
      enum: ["Urban", "Rural", "Suburban", "Other"],
      default: undefined,
    },
    neighborhoodClass: {
      type: String,
      enum: [
        "Humble",
        "Working Class",
        "Middle Class",
        "Upper Class",
        "Other",
      ],
      default: undefined,
    },
    livingSpace: {
      type: String,
      enum: [
        "Home",
        "Apartment building",
        "Townhouse",
        "Condominium",
        "RV Style",
        "Other",
      ],
      default: undefined,
    },
    livingSpaceOther: {
      type: String,
      trim: true,
      default: "",
    },
    maritalStatus: {
      type: String,
      enum: [
        "Single",
        "Married",
        "Divorced",
        "Widowed",
        "Domestic Partner",
        "Separated",
      ],
      default: undefined,
    },
  },
  { _id: false }
);

// ================= SIBLINGS SCHEMA =================
const siblingSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["Brother", "Sister"],
      required: true,
    },
    order: {
      type: String,
      enum: ["Older", "Younger"],
      required: true,
    },
  },
  { _id: false }
);

// ================= STORY HIGHLIGHT SCHEMA =================
const storyHighlightSchema = new mongoose.Schema(
  {
    momentType: {
      type: String,
      default: "",
    },
    momentOther: {
      type: String,
      default: "",
    },
    impactType: {
      type: String,
      default: "",
    },
    impactOther: {
      type: String,
      default: "",
    },
  },
  { _id: false }
);

// ================= REFERENCE IMAGES SCHEMA =================
const referenceImagesSchema = new mongoose.Schema(
  {
    earlyChildhood: {
      type: String,
      default: "",
    },
    lateChildhood: {
      type: String,
      default: "",
    },
    earlyAdulthood: {
      type: String,
      default: "",
    },
    lateAdulthood: {
      type: String,
      default: "",
    },
  },
  { _id: false }
);

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
    role: {
      type: String,
      enum: ["admin", "user"],
      default: "user",
    },
    isProfileCompleted: {
      type: Boolean,
      default: false
    },
    terms: {
      type: Boolean,
      default: true
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
    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
      default: undefined,
    },
    ageGroup: {
      type: String,
      enum: [
        "Under 50",
        "50-59",
        "60-69",
        "70-79",
        "80-89",
        "90-100",
      ],
      default: undefined,
    },
    ethnicity: {
      type: String,
      enum: [
        "Black",
        "White",
        "Asian",
        "Hispanic",
        "Native",
        "Middle Eastern",
        "Other",
      ],
      default: undefined,
    },
    paternalEthnicity: {
      type: String,
      enum: [
        "Black",
        "White",
        "Asian",
        "Hispanic",
        "Native",
        "Middle Eastern",
        "NA",
      ],
      default: undefined,
    },
    maternalEthnicity: {
      type: String,
      enum: [
        "Black",
        "White",
        "Asian",
        "Hispanic",
        "Native",
        "Middle Eastern",
        "NA",
      ],
      default: undefined,
    },

    // Siblings
    siblingsCount: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },
    siblings: {
      type: [siblingSchema],
      default: [],
    },

    // Childhood
    earlyChildhood: {
      type: lifeStageLocationSchema,
      default: () => ({}),
    },
    lateChildhood: {
      type: lifeStageLocationSchema,
      default: () => ({}),
    },
    sameAsEarly: {
      type: Boolean,
      default: null,
    },

    // Adulthood
    earlyAdulthood: {
      type: lifeStageLocationSchema,
      default: () => ({}),
    },
    lateAdulthood: {
      type: lifeStageLocationSchema,
      default: () => ({}),
    },
    sameAsEarlyAdulthood: {
      type: Boolean,
      default: null,
    },

    // Story Highlight
    shareStory: {
      type: String,
      enum: ["Yes", "No"],
      default: undefined,
    },
    storyHighlight: {
      type: storyHighlightSchema,
      default: () => ({}),
    },

    // Reference Images
    referenceImages: {
      type: referenceImagesSchema,
      default: () => ({}),
    },
  },
  {
    timestamps: true,
  }
);

userSchema.index({ email: 'text' });

// add plugin that converts mongoose to json
userSchema.plugin(toJSON);
userSchema.plugin(paginate);

// Middleware to handle same as early logic before save
userSchema.pre("save", function (next) {
  // Handle childhood same as early
  if (this.sameAsEarly === true) {
    this.lateChildhood = this.earlyChildhood;
  }

  // Handle adulthood same as early
  if (this.sameAsEarlyAdulthood === true) {
    this.lateAdulthood = this.earlyAdulthood;
  }

  // Auto-calculate siblingsCount from siblings array length
  if (this.siblings && Array.isArray(this.siblings)) {
    this.siblingsCount = this.siblings.length;
  }

  next();
});

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

userSchema.set('toObject', { virtuals: true });
userSchema.set('toJSON', { virtuals: true });

const User = mongoose.model('User', userSchema);

module.exports = User;