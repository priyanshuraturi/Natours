const Review = require('../models/reviewModel');
//const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');

exports.getAllReviews = factory.getAll(Review);
exports.getReview = factory.getOne(Review, {
  path: 'tour',
  select: 'name',
});
exports.setTourUserId = (req, res, next) => {
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user.id;
  next();
};
exports.createReview = factory.createOne(Review);
exports.editReview = factory.editOne(Review);

exports.deleteReview = factory.deleteOne(Review);
