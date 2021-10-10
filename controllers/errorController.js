const AppError = require('../utils/appError');

const handleExpiredToken = () =>
  new AppError('Session Expiered , Please Login Again', 401);

const handleInvalidToken = () =>
  new AppError('Invalid Token Please Login Again', 401);

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new AppError(message, 400);
};
const handleDuplicateFieldsDB = (err) => {
  const message = `Duplicate Field Value: "${err.keyValue.name}", Please Enter Another Value`;
  return new AppError(message, 400);
};
// const handleValidationErrorDB = (err) =>
//   new AppError(err.message, 400);
const sendErrorDev = (err, res, req) => {
  if (req.originalUrl.startsWith('/api')) {
    res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
    });
  } else {
    //Render Page
    res.status(err.statusCode).render('error', {
      title: 'Something Went Wrong',
      msg: err.message,
    });
  }
};
const sendErrorProd = (err, res, req) => {
  // Operational ,trusted Error
  if (req.originalUrl.startsWith('/api')) {
    if (err.isOperational) {
      res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
    } else {
      //Unknown Error, Don't Want To Leak Eror Details To The Client
      //Log The Error
      // The Send the Genreic Error

      console.error('Error 💣', err);
      res.status(500).json({
        status: 'Error',
        message: 'Something Went Very Wrong',
      });
    }
  } else {
    //Render Page
    res.status(err.statusCode).render('error', {
      title: 'Something Went Wrong',
      msg: 'OOPs Something Went Wrong',
    });
  }
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res, req);
  } else if (process.env.NODE_ENV === 'production') {
    // eslint-disable-next-line node/no-unsupported-features/es-syntax
    let error = { ...err };
    error.message = err.message;
    // eslint-disable-next-line no-proto
    if (err.name === 'CastError') error = handleCastErrorDB(error);
    if (err.code === 11000) error = handleDuplicateFieldsDB(error);
    if (err.name === 'ValidationError') {
      error.message = err.message;
      error = new AppError(error.message, 400); // Validation Error
    }
    if (err.name === 'JsonWebTokenError')
      error = handleInvalidToken();
    if (err.name === 'TokenExpiredError')
      error = handleExpiredToken();

    sendErrorProd(error, res, req);
  }
};
