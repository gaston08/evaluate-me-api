import express from 'express';
import morgan from 'morgan';
import nodemailer from 'nodemailer';
import connect from './connect';

// controllers
import * as indexController from './controllers/index';
import * as usersController from './controllers/users';

const host = process.env.HOST ?? 'localhost';
const port = process.env.PORT ? Number(process.env.PORT) : 3000;

const app = express();

app.use(express.json());
app.use(morgan('dev'));

const mongoUrl = process.env.MONGODB_URI;
connect({ db: mongoUrl });

// primary app routes
app.get('/', indexController.index);
app.get('/auth', indexController.checkAuth, indexController.indexAuth);
app.post('/signup', usersController.signup);
app.post('/login', usersController.login);
app.post(
  '/user/update/profile',
  indexController.checkAuth,
  usersController.updateProfile
);
app.post(
  '/user/update/password',
  indexController.checkAuth,
  usersController.updatePassword
);
app.post(
  '/user/delete',
  indexController.checkAuth,
  usersController.deleteAccount
);
app.post('/user/forgot/password', usersController.forgotPassword);
app.post('/user/reset/password/:token', usersController.resetPassword);

export const transporter = nodemailer.createTransport({
  service: 'Outlook365',
  auth: {
    user: process.env.EMAIL_SENDER,
    pass: process.env.EMAIL_SENDER_PASSWORD,
  },
});

app.listen(port, host, () => {
  console.log(`[ ready ] http://${host}:${port}`);
});
