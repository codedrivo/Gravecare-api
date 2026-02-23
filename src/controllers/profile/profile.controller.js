const catchAsync = require('../../helpers/asyncErrorHandler');
const service = require('../../services/auth/auth.service');
const ApiError = require('../../helpers/apiErrorConverter');

// Delete account
const deleteAccount = catchAsync(async (req, res, next) => {
  await service.deleteAccountById(req.user._id);
  res.status(200).send({ message: 'Account Deleted Successfully' });
});

const edituser = catchAsync(async (req, res) => {
  const userData = await service.getUserByIdWithGroup(req.params.id);
  const teamData = await service.getTeamByUserId(req.params.id);
  const matchData = await service.getMatchByUserId(req.params.id, teamData);
  res.status(200).send({ status: 200, userData: userData, team: teamData, matchData: matchData });
});

// Password change
const passwordChange = catchAsync(async (req, res, next) => {
  await service.updatePassword(
    req.user,
    req.body.password_new,
    req.body.password_old,
  );
  res
    .status(200)
    .send({ status: 200, message: 'Password Updated Successfully' });
});

// Notification settings
const notificationToggle = catchAsync(async (req, res, next) => {
  await service.updateNotificationSetting(
    req.user.email,
    req.body.notification,
  );
  res
    .status(200)
    .send({ message: 'Notification Settings Updated Successfully' });
});

// Get profile
const getProfile = catchAsync(async (req, res, next) => {
  res.status(200).send({ user: req.user });
});

// Helper function to deeply parse JSON strings
const deepParseJSON = (data) => {
  if (typeof data === 'string') {
    try {
      const parsed = JSON.parse(data);
      return deepParseJSON(parsed);
    } catch {
      return data;
    }
  }

  if (Array.isArray(data)) {
    return data.map(item => deepParseJSON(item));
  }

  if (data && typeof data === 'object') {
    const result = {};
    for (const key in data) {
      result[key] = deepParseJSON(data[key]);
    }
    return result;
  }

  return data;
};

const updateProfile = catchAsync(async (req, res, next) => {
  // Initialize referenceImages if it doesn't exist
  if (!req.body.referenceImages) {
    req.body.referenceImages = {};
  }

  // FIXED: Handle musicGenres - deep parse to handle multiple stringification
  if (req.body.musicGenres) {
    console.log('Raw musicGenres:', req.body.musicGenres);

    // Deep parse to handle multiple stringification
    const parsed = deepParseJSON(req.body.musicGenres);

    // Ensure it's an array and filter out empty strings
    if (Array.isArray(parsed)) {
      req.body.musicGenres = parsed.filter((genre) => genre && genre.trim() !== '');
    } else if (typeof parsed === 'string' && parsed) {
      req.body.musicGenres = [parsed];
    } else {
      req.body.musicGenres = [];
    }

    console.log('Final musicGenres:', req.body.musicGenres);
  }

  // Handle file uploads
  if (req.files) {
    // Handle profile image
    if (req.files.profileimageurl) {
      req.body.profileimageurl = req.files.profileimageurl[0].location;
    }

    // Map uploaded files to reference images
    const imageMappings = {
      earlyChildhoodImage: 'earlyChildhood',
      lateChildhoodImage: 'lateChildhood',
      earlyAdulthoodImage: 'earlyAdulthood',
      lateAdulthoodImage: 'lateAdulthood'
    };

    Object.entries(imageMappings).forEach(([fileField, imageField]) => {
      if (req.files[fileField] && req.files[fileField].length > 0) {
        req.body.referenceImages[imageField] = req.files[fileField][0].location;
      }
    });
  }

  // Parse nested objects if they come as strings
  const fieldsToParse = [
    'earlyChildhood',
    'lateChildhood',
    'earlyAdulthood',
    'lateAdulthood',
    'storyHighlight',
    'siblings'
  ];

  fieldsToParse.forEach(field => {
    if (req.body[field] && typeof req.body[field] === 'string') {
      try {
        req.body[field] = JSON.parse(req.body[field]);
      } catch (error) {
        console.error(`Error parsing ${field}:`, error);
      }
    }
  });

  // Handle shareStory empty string
  if (req.body.shareStory === '') {
    delete req.body.shareStory;
  }

  // Set isProfileCompleted to true on any profile update
  req.body.isProfileCompleted = true;

  const user = await service.updateUser(req.user._id, req.body);

  res.status(200).send({
    success: true,
    message: "Profile updated successfully",
    data: { user },
  });
});

const listusers = catchAsync(async (req, res, next) => {
  const id = req.user._id;
  const users = await service.listUser(id);
  res.status(200).send({ users });
});

const addSupport = catchAsync(async (req, res) => {
  userId = req.user._id;
  const data = {
    userId,
    ...req.body,
  };
  const supportData = await service.addSupport(data);
  res.status(200).json({
    message: 'Data added successfully',
    data: supportData,
  });
});


module.exports = {
  deleteAccount,
  passwordChange,
  getProfile,
  updateProfile,
  notificationToggle,
  addSupport,
  listusers,
  edituser
};
