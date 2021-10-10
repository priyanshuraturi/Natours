const crypto = require('crypto');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

const catchAsync = require('../utils/catchAsync');

const appError = require('../utils/appError');
const sendEmail = require('../utils/email');
const AppError = require('../utils/appError');
//const { log } = require('console');

const signToken = (id) =>
  jwt.sign({ id: id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

const sendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  // Remove Password From Output on Create Query
  user.password = undefined;
  user.active = undefined;

  const cookieOptions = {
    expires: new Date(
      Date.now() +
        process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };
  if (process.env.NODE_ENV === 'production')
    cookieOptions.secure = true;

  res.cookie('jwt', token, cookieOptions);

  res.status(statusCode).json({
    status: 'Sucess',
    token,
    data: {
      user,
    },
  });
};

exports.signUp = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
    role: req.body.role,
  });

  sendToken(newUser, 201, res);
});
exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // Check if Email and Password Actually Exist
  if (!email || !password) {
    return next(
      new appError('Please Provide Email and Password', 400)
    );
  }

  //Check if the user Actually exist

  const user = await User.findOne({ email }).select('+password');
  // If Everything is ok Send Token to Client

  if (
    !user ||
    !(await user.correctPassword(password, user.password))
  ) {
    return next(
      new appError('Incorrect Combination , Unauthorised!', 400)
    );
  }
  sendToken(user, 200, res);
});

exports.logout = (req, res) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.status(200).json({ status: 'success' });
};

// Only For Rendered Pages
exports.isLoggedIn = async (req, res, next) => {
  // 1) Get The Token From Body

  if (req.cookies.jwt) {
    try {
      const decoded = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET
      );
      //3) Check if User Still Exist
      const freshUser = await User.findById(decoded.id);
      if (!freshUser) return next();
      //4) Check if User changed password after the token was issued
      if (freshUser.isPasswordChanged(decoded.iat)) return next();

      //There is a Logged In User
      res.locals.user = freshUser;
      return next();
    } catch (err) {
      return next();
    }
  }
  return next();
};

exports.protect = catchAsync(async (req, res, next) => {
  // 1) Get The Token From Body
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) token = req.cookies.jwt;

  if (!token) {
    return next(
      new appError('Authorization Failed, Please Login', 401)
    );
  }

  //2) Verification of Token

  const decoded = await promisify(jwt.verify)(
    token,
    process.env.JWT_SECRET
  );
  //3) Check if User Still Exist
  const freshUser = await User.findById(decoded.id);
  if (!freshUser)
    return next(new appError("User Dosen't Exist ", 401));
  //4) Check if User changed password after the token was issued
  if (freshUser.isPasswordChanged(decoded.iat))
    return new appError('Password Changed ,Please Relogin!', 401);
  req.user = freshUser;
  next();
});
exports.restrictTo =
  (...roles) =>
  (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new appError(
          'You Donot have permission to perform this action',
          403
        )
      );
    }
    next();
  };

exports.forgotPassword = async (req, res, next) => {
  // 1) fet User Based on POSTed Email
  const user = await User.findOne({ email: req.body.email });
  if (!user)
    return next(new appError('No User Exists With This Email'));

  // 2) Generate the random reset Token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  // 3) Send it to user's email
  const resetURL = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/resetPassword/${resetToken}`;
  const message = `Forgot Your Password ?, Submit a PATCH request with your password and confirm to: ${resetURL}.\n If You Didn't Please Ignore This Email`;
  try {
    await sendEmail({
      email: user.email,
      subject: 'Your Password Reset Token (Only Valid For 10 Min)',
      message,
    });
    res.status(200).json({
      status: 'Sucess',
      message: 'Token Sent To Registered Email',
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError('There Was an Error Sending The Email'),
      500
    );
  }
};
exports.resetPassword = catchAsync(async (req, res, next) => {
  // 1) Get User Based On Token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  let user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  // 2) If Token has not expiered , and there is user , set the new password
  if (!user)
    return next(new AppError('Token is Invalid / Expired', 400));
  // 3) update changedPasseordAt property for the user
  user.password = req.body.password;
  user.confirmPassword = req.body.confirmPassword;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  user = await user.save();
  console.log(user);

  // 4) Log The user in ,send JWT
  sendToken(user, 200, res);
});
exports.updatePassword = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id).select('+password');
  if (
    !(await user.correctPassword(
      req.body.oldPassword,
      user.password
    ))
  ) {
    return next(
      new AppError(
        'Incorrect Old Password, Please Provide Correct Password!',
        402
      )
    );
  }
  user.password = req.body.password;
  user.confirmPassword = req.body.confirmPassword;
  const changedUser = await user.save();
  sendToken(changedUser, 201, res);
});
