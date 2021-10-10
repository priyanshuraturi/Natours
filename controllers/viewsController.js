const Tour = require('../models/tourModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

exports.getOverview = catchAsync(async (req, res) => {
  //1) Get All The Tour Data From The Collection
  const tours = await Tour.find();

  //2) Build Template

  //3) Render Thet Template using tour data
  res.status(200).render('overview', {
    title: 'All Tours',
    tours,
  });
});

exports.getTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.find({ slug: req.params.slug }).populate({
    path: 'reviews',
    fields: 'review rating user',
  });
  if (!tour) {
    // (!tour) wasn't working here
    console.log('Inside The If');
    return next(
      new AppError("Tour Dosen't Exist With This Name", 404)
    );
  }
  res.status(200).render('tour', {
    title: `${tour[0].name}`,
    tour: tour[0],
  });
});

exports.login = (req, res) => {
  res.status(200).render('login', {
    title: 'Log Into Your Account',
  });
};
exports.signup = (req, res) => {
  res.status(200).render('signup', {
    title: 'Sign Up For New Account',
  });
};
