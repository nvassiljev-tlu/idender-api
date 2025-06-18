const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');

const createResponse = require('./api/middlewares/createResponse');
const isProd = process.env.NODE_ENV === 'production';

app.use(cookieParser());

const oauthRouter = require('./api/routes/oauth/v1/router');
const ideasRouter = require('./api/routes/ideas/v1/router');
const usersRouter = require('./api/routes/users/v1/router');
const votingRouter = require('./api/routes/voting/v1/router');
const newsRouter = require('./api/routes/news/v1/router');

const allowedOrigins = [
  'http://172.19.2.236:3000',
  'http://localhost:3000',
  'https://idender-staging.services.nvassiljev.com'
];

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use('/uploads', express.static('uploads'));

app.use((req, res, next) => {
  const origin = req.headers.origin;
  console.log(`Request from origin: ${origin}`);

  if (allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header(
      'Access-Control-Allow-Methods',
      'GET, POST, DELETE, PATCH, PUT, OPTIONS'
    );
    res.header(
      'Access-Control-Allow-Headers',
      'Origin, X-Requested-With, Content-Type, Accept, Authorization'
    );
  }

  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }

  next();
});

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 950,
    handler: (req, res) => {
        res.status(429).json(createResponse(429, {}, {
            message: 'You are being rate limited'
        }));
    }
});

app.use(limiter);
app.set('trust proxy', 1);

app.use('/v1/oauth', oauthRouter);
app.use('/v1/ideas', ideasRouter);
app.use('/v1/users', usersRouter);
app.use('/v1/voting', votingRouter);
app.use('/v1/news', newsRouter);

app.use((req, res, next) => {
    const httpCode = 404;
    const errors = {
        message: 'Requested resource was not found',
    };

    res.status(httpCode).json(createResponse(httpCode, {}, errors));
});

app.use((error, req, res, next) => {
  const httpCode = error.status || 500;
  const errors = {
    message: error.message,
    ...(isProd ? {} : { stack: error.stack })
  };

  res.status(httpCode).json(createResponse(httpCode, {}, errors));
});

module.exports = app;
