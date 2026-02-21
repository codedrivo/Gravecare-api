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

const updateProfile = catchAsync(async (req, res, next) => {
  // Initialize referenceImages if it doesn't exist


  // Handle profile image upload
  if (req.files) {
    // Handle profile image
    if (req.files.profileimageurl) {
      req.body.profileimageurl = req.files.profileimageurl[0].location;
    }
    if (!req.body.referenceImages) {
      req.body.referenceImages = {};
    }

    // Map uploaded files to reference images

    if (req.files.earlyChildhoodImage) {
      req.body.referenceImages.earlyChildhood = req.files.earlyChildhoodImage[0].location;
    }
    if (req.files.lateChildhoodImage) {
      req.body.referenceImages.lateChildhood = req.files.lateChildhoodImage[0].location;
    }
    if (req.files.earlyAdulthoodImage) {
      req.body.referenceImages.earlyAdulthood = req.files.earlyAdulthoodImage[0].location;
    }
    if (req.files.lateAdulthoodImage) {
      req.body.referenceImages.lateAdulthood = req.files.lateAdulthoodImage[0].location;
    }
  }

  // Parse nested objects if they come as strings
  if (req.body.earlyChildhood && typeof req.body.earlyChildhood === 'string') {
    try {
      req.body.earlyChildhood = JSON.parse(req.body.earlyChildhood);
    } catch (error) {
      console.error('Error parsing earlyChildhood:', error);
    }
  }
  if (req.body.lateChildhood && typeof req.body.lateChildhood === 'string') {
    try {
      req.body.lateChildhood = JSON.parse(req.body.lateChildhood);
    } catch (error) {
      console.error('Error parsing lateChildhood:', error);
    }
  }
  if (req.body.earlyAdulthood && typeof req.body.earlyAdulthood === 'string') {
    try {
      req.body.earlyAdulthood = JSON.parse(req.body.earlyAdulthood);
    } catch (error) {
      console.error('Error parsing earlyAdulthood:', error);
    }
  }
  if (req.body.lateAdulthood && typeof req.body.lateAdulthood === 'string') {
    try {
      req.body.lateAdulthood = JSON.parse(req.body.lateAdulthood);
    } catch (error) {
      console.error('Error parsing lateAdulthood:', error);
    }
  }
  if (req.body.storyHighlight && typeof req.body.storyHighlight === 'string') {
    try {
      req.body.storyHighlight = JSON.parse(req.body.storyHighlight);
    } catch (error) {
      console.error('Error parsing storyHighlight:', error);
    }
  }
  if (req.body.siblings && typeof req.body.siblings === 'string') {
    try {
      req.body.siblings = JSON.parse(req.body.siblings);
    } catch (error) {
      console.error('Error parsing siblings:', error);
    }
  }

  const user = await service.updateUser(req.user._id, req.body);

  let message = "Profile updated successfully";

  res.status(200).send({
    message,
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
