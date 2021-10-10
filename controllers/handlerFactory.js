const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const APIFeatures = require('../utils/apiFeatures');

exports.deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);

    if (!doc) {
      return next(
        new AppError(
          `There is No Documnet With ${req.params.id} `,
          404
        )
      );
    }

    res.status(204).json({
      status: 'Success',
      data: null,
    });
  });

exports.editOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const updatedDoc = await Model.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedDoc) {
      return next(
        new AppError(
          `There is No Doc With ID ${req.params.id} `,
          404
        )
      );
    }

    res.status(200).json({
      status: 'Success',
      data: {
        updatedDoc,
      },
    });
  });

exports.createOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const newDoc = await Model.create(req.body);

    res.status(201).json({
      status: 'Success',
      newDoc,
    });
  });

exports.getOne = (Model, popOptions) =>
  catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id);
    if (popOptions) query = query.populate(popOptions);

    const doc = await query;

    if (!doc) {
      return next(
        new AppError(`There is No doc With ${req.params.id} `, 404)
      );
    }

    res.status(200).json({
      status: 'success',
      data: {
        doc,
      },
    });
  });
exports.getAll = (Model) =>
  // Filter Object is For Filter Review
  catchAsync(async (req, res, next) => {
    let filter = {};
    if (req.params.tourId) filter = { tour: req.params.tourId };
    const features = new APIFeatures(Model.find(filter), req.query)
      .filter()
      .sort()
      .fields()
      .pagination();
    // const doc = await features.query.explain();
    const doc = await features.query;

    // {difficulty:'easy',duration:{$gte:500]}}
    res.status(200).json({
      status: 'success',
      data: {
        doc,
      },
    });
  });
