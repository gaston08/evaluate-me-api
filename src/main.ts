import express from 'express';
import morgan from 'morgan';
import { doAuth } from 'auth';
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
app.post('/signup', usersController.postSignup);

app.post('/auth', (req, res) => {
  res.send(doAuth());
});

app.listen(port, host, () => {
  console.log(`[ ready ] http://${host}:${port}`);
});
