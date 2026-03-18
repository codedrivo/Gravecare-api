const mongoose = require('mongoose');
const validator = require('validator');
const { toJSON, paginate } = require('./plugins');
const bcrypt = require('bcrypt');
const ApiError = require('../helpers/apiErrorConverter');

// ================= LIFE STAGE LOCATION SCHEMA =================
const lifeStageLocationSchema = new mongoose.Schema(
  {
    city: {
      type: String,
      trim: true,
      default: "",
    },
    state: {
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
        "Working",
        "Middle",
        "Upper",
        "Other",
      ],
      default: undefined,
    },
    livingSpace: {
      type: String,
      enum: [
        "Home",
        "Apartment",
        "Townhouse",
        "Condominium",
        "RV",
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

// ================= SIBLINGS SCHEMA - UPDATED =================
// Changed from 'type' to 'gender' to match React frontend
const siblingSchema = new mongoose.Schema(
  {
    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
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
      enum: [
        "Career Change",
        "Marriage",
        "Loss of Loved One",
        "Birth of Child",
        "Health Challenge",
        "Other"
      ],
      default: undefined,
    },
    momentOther: {
      type: String,
      default: "",
    },
    impactType: {
      type: String,
      enum: [
        "Changed career direction",
        "Strengthened relationships",
        "Improved personal growth",
        "Changed life perspective",
        "Other"
      ],
      default: undefined,
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
    online: {
      type: Boolean,
      default: false,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
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
        "90-100",
        "80-89",
        "70-79",
        "60-69",
        "50-59",
        "Under 50",
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
    ethnicityOther: {
      type: String,
      default: "",
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
        "Other",
      ],
      default: undefined,
    },
    paternalEthnicityOther: {
      type: String,
      default: "",
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
        "Other",
      ],
      default: undefined,
    },
    maternalEthnicityOther: {
      type: String,
      default: "",
    },

    // Music Genres
    musicGenres: {
      type: [String],
      default: [],
    },

    // Siblings - Using updated schema with gender
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
    sameAsEarly: {
      type: Boolean,
      default: null,
    },
    earlyChildhood: {
      type: lifeStageLocationSchema,
      default: () => ({}),
    },
    lateChildhood: {
      type: lifeStageLocationSchema,
      default: () => ({}),
    },

    // Adulthood
    sameAsEarlyAdulthood: {
      type: Boolean,
      default: null,
    },
    earlyAdulthood: {
      type: lifeStageLocationSchema,
      default: () => ({}),
    },
    lateAdulthood: {
      type: lifeStageLocationSchema,
      default: () => ({}),
    },

    // Story Highlight
    shareStory: {
      type: String,
      enum: ["", "Yes", "No"],
      default: "",
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

// Indexes
userSchema.index({ email: 'text' });

// Plugins
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

  // Clear Other fields if not needed
  if (this.ethnicity !== 'Other') {
    this.ethnicityOther = '';
  }
  if (this.paternalEthnicity !== 'Other') {
    this.paternalEthnicityOther = '';
  }
  if (this.maternalEthnicity !== 'Other') {
    this.maternalEthnicityOther = '';
  }

  // Filter out empty strings from musicGenres
  if (this.musicGenres && Array.isArray(this.musicGenres)) {
    this.musicGenres = this.musicGenres.filter(genre => genre && genre.trim() !== '');
  }

  // Auto-check if profile is complete
  const requiredFields = [
    'firstName',
    'lastName',
    'email',
    'gender',
    'ageGroup'
  ];

  const isComplete = requiredFields.every(field =>
    this[field] && this[field].toString().trim() !== ''
  );

  this.isProfileCompleted = isComplete;

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