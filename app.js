//disable-Single-Quote
const express = require('express');

const path = require('path');

const morgan = require('morgan');

const rateLimit = require('express-rate-limit');

//const helmet = require('helmet');

const cookieParser = require('cookie-parser');

const mongoSanitize = require('express-mongo-sanitize');

const xss = require('xss-clean');
const hpp = require('hpp');

const AppError = require('./utils/appError');

const errorController = require('./controllers/errorController');

const app = express();

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));

const tourRouter = require('./routes/tourRoutes');

const userRouter = require('./routes/userRoutes');

const reviewRouter = require('./routes/reviewRoutes');

const viewRouter = require('./routes/viewRoutes');

// const eAdressse =
//   process.env.NODE_ENV === 'development'
//     ? `http://${process.env.LOCALHOST}:${process.env.PORT}`
//     : process.env.PRODHOST;

//app.use(helmet());

// app.use(
//   helmet.contentSecurityPolicy({
//     useDefaults: true,
//     directives: {
//       'default-src': [
//         "'self'",
//         "'unsafe-inline'",
//         "'unsafe-eval'",
//         'blob:',
//         'https://*.mapbox.com/',
//         `${eAdressse}`,
//       ],
//       'script-src': [
//         'self',
//         "'unsafe-inline'",
//         "'unsafe-eval'",
//         'https://*.mapbox.com/',
//         `${eAdressse}`,
//         'https://cdnjs.cloudflare.com/',
//       ],
//       'style-src': [
//         "'self'",
//         "'unsafe-eval'",
//         "'unsafe-inline'",
//         'https://*.mapbox.com/',
//         'https://*.googleapis.com/',
//       ],
//       'worker-src': [
//         "'self'",
//         "'unsafe-inline'",
//         "'unsafe-eval'",
//         'https://*.mapbox.com/',
//         'https://*.googleapis.com/',
//         'blob:',
//       ],
//       'connect-src': [
//         "'self'",
//         "'unsafe-inline'",
//         "'unsafe-eval'",
//         'https://*.mapbox.com/',
//         `${eAdressse}`,
//       ],
//     },
//   })
//);

// Serving Static Files
// app.use(helmet());
// Global  MiddleWare
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
const limiter = rateLimit({
  max: 50,
  windowMs: 60 * 60 * 1000,
  message:
    'To Many Request From This IP Please Try Again After an Hour',
});
//Limiting Request Per iP
app.use('/api', limiter);
//Body Parser
app.use(express.json({ limit: '10kb' }));

app.use(cookieParser());

//Data Sanitization against No SQL Query Injection

app.use(mongoSanitize());

//Data Sanitization against XSS

app.use(xss());
//Test Middleware

//Prevent Parameter Pollution
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  })
);

app.use((req, res, next) => {
  const ts = Date.now();
  const dateObj = new Date(ts);
  const date = dateObj.getDate();
  const month = dateObj.getMonth() + 1;
  const year = dateObj.getFullYear();
  console.log(
    `Request IP: ${
      req.connection.remoteAddress
    } Time : ${date}/${month}/${year} ${dateObj.getHours()}:${dateObj.getMinutes()}:${dateObj.getSeconds()}`
  );
  //console.log(req.cookies);

  next();
});

app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);

app.all('*', (req, res, next) => {
  next(
    new AppError(`Can't Find ${req.originalUrl} on This Server`, 404)
  );
});

app.use(errorController);

module.exports = app;

//export PATH="$HOME/.npm/bin:$PATH"
