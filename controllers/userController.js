const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const factory = require('./handlerFactory');

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

exports.updateMe = catchAsync(async (req, res, next) => {
  // Create Error if the user password data \
  if (req.body.password || req.body.confirmPassword)
    return next(
      new AppError('This route is not for password update', 400)
    );

  const filteredBody = filterObj(req.body, 'name', 'email');

  const user = await User.findByIdAndUpdate(
    req.user.id,
    filteredBody,
    {
      new: true,
      runValidators: true,
    }
  );

  res.status(200).json({
    status: 'sucess',
    data: {
      updatedUser: user,
    },
  });
});

exports.createUsers = (req, res) => {
  res.status(500).json({
    status: 'err',
    message:
      'This route is not yet defined ! Please Use SignUp Instead',
  });
};
exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });
  res.status(204).json({
    status: 'Sucess',
    data: null,
  });
});

exports.getUser = factory.getOne(User);
exports.updateUser = factory.editOne(User);
exports.deleteUser = factory.deleteOne(User);
exports.getAllusers = factory.getAll(User);
