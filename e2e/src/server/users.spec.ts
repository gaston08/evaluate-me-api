import axios from 'axios';
import jwt from 'jsonwebtoken';
import { getAuthToken } from '../../../src/utils/common';

axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error.response.status === 400 ||
      error.response.status === 403 ||
      error.response.status === 500
    ) {
      return Promise.resolve({
        status: error.response.status,
        data: error.response.data,
      });
    }

    return Promise.reject(error);
  }
);

describe('users controller', () => {
  let access_token;
  const userData = {
    email: 'gaston08pedraza@gmail.com',
    password: 'Abcd1234',
    confirmPassword: 'Abcd1234',
    name: 'gaston',
  };
  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('create user', () => {
    it('should return status 400 with errors fields', async () => {
      const res = await axios.post('/signup', {});

      const emailError = res.data.errors.some((err) => err.path === 'email');
      const nameError = res.data.errors.some((err) => err.path === 'name');
      const passwordError = res.data.errors.some(
        (err) => err.path === 'password'
      );
      const confirmPasswordError = res.data.errors.some(
        (err) => err.path === 'confirmPassword'
      );

      expect(res.status).toBe(400);
      expect(emailError).toBe(true);
      expect(nameError).toBe(true);
      expect(passwordError).toBe(true);
      expect(confirmPasswordError).toBe(true);
    });

    it('should create an user successfully', async () => {
      const res = await axios.post('/signup', userData);
      expect(res.status).toBe(200);
      expect(res.data.user.name).toBe('gaston');
      expect(res.data.user.email).toBe('gaston08pedraza@gmail.com');
      expect(res.data.user.password).toBe(undefined);
    });

    it('should return status 400 with error: Account with that email address already exists', async () => {
      const res = await axios.post('/signup', userData);
      expect(res.status).toBe(400);
      expect(res.data.message).toBe(
        'Account with that email address already exists'
      );
    });
  });

  describe('login user', () => {
    it('should return status 400 with errors fields', async () => {
      const res = await axios.post('/login', {});

      const emailError = res.data.errors.some((err) => err.path === 'email');
      const passwordError = res.data.errors.some(
        (err) => err.path === 'password'
      );

      expect(res.status).toBe(400);
      expect(emailError).toBe(true);
      expect(passwordError).toBe(true);
    });

    it('should return status 400 with access denied message for invalid email', async () => {
      const res = await axios.post('/login', {
        email: 'a@invalidinvalid.com',
        password: 'wrongpass',
      });
      expect(res.status).toBe(400);
      expect(res.data.message).toBe('access denied');
    });

    it('should return status 400 with access denied message for correct email but invalid password', async () => {
      const res = await axios.post('/login', {
        email: userData.email,
        password: 'wrongpass',
      });
      expect(res.status).toBe(400);
      expect(res.data.message).toBe('access denied');
    });

    it('should login successfully', async () => {
      const res = await axios.post('/login', {
        email: userData.email,
        password: userData.password,
      });

      access_token = res.data.token;

      expect(res.status).toBe(200);
      expect(typeof res.data.token).toBe('string');

      const decoded = jwt.verify(access_token, process.env.SECRET_TOKEN_KEY);
      expect(decoded.email).toBe('gaston08pedraza@gmail.com');
      expect(decoded.password).toBe(undefined);
    });
  });

  describe('require authorization', () => {
    describe('checkAuth middleware', () => {
      it('should return 403 no token provided', async () => {
        const res = await axios.post('/auth');

        expect(res.status).toBe(403);
        expect(res.data.message).toBe('no token provided');
      });

      it('should return status 500 and jwt malformed error', async () => {
        const res = await axios.post(
          '/auth',
          {},
          { headers: { authorization: 'Bearer invalidtoken' } }
        );
        expect(res.status).toBe(500);
        expect(res.data.error).toBe('jwt malformed');
      });

      it('should return status 500 and invalid token error', async () => {
        const res = await axios.post(
          '/auth',
          {},
          { headers: { authorization: `Bearer BADTOKEN${access_token}` } }
        );
        expect(res.status).toBe(500);
        expect(res.data.error).toBe('invalid token');
      });

      it('should return status 500 and jwt expired error', async () => {
        const expiredToken = getAuthToken({}, 0);
        const res = await axios.post(
          '/auth',
          {},
          {
            headers: {
              authorization: `Bearer ${expiredToken}`,
            },
          }
        );
        expect(res.status).toBe(500);
        expect(res.data.error).toBe('jwt expired');
      });

      it('should return status 500 and invalid signature error', async () => {
        const invalidSignaturedToken = jwt.sign({}, 'invalidSecret', {
          expiresIn: 1000,
        });
        const res = await axios.post(
          '/auth',
          {},
          {
            headers: {
              authorization: `Bearer ${invalidSignaturedToken}`,
            },
          }
        );
        expect(res.status).toBe(500);
        expect(res.data.error).toBe('invalid signature');
      });

      it('should return status 200 and logged message', async () => {
        const res = await axios.post(
          '/auth',
          {},
          {
            headers: {
              authorization: `Bearer ${access_token}`,
            },
          }
        );

        expect(res.status).toBe(200);
        expect(res.data.message).toEqual('logged');
      });
    });
    describe('update user', () => {
      it('should return 403 no token provided', async () => {
        const res = await axios.post('/user/update/profile');

        expect(res.status).toBe(403);
        expect(res.data.message).toBe('no token provided');
      });

      it('should return status 400 with errors fields', async () => {
        const res = await axios.post(
          '/user/update/profile',
          {},
          {
            headers: {
              authorization: `Bearer ${access_token}`,
            },
          }
        );

        const emailError = res.data.errors.some((err) => err.path === 'email');
        const nameError = res.data.errors.some((err) => err.path === 'name');

        expect(res.status).toBe(400);
        expect(emailError).toBe(true);
        expect(nameError).toBe(true);
      });

      it('should return status 500 with mongodb error ', async () => {
        const token = getAuthToken({ _id: 'invalidIdMongoDB' }, 1000);
        const res = await axios.post('/user/update/profile', userData, {
          headers: {
            authorization: `Bearer ${token}`,
          },
        });

        const err =
          'Cast to ObjectId failed for value "invalidIdMongoDB" (type string) at path "_id" for model "User"';

        expect(res.status).toBe(500);
        expect(res.data.error).toBe(err);
      });

      it('should return status 400 email already used', async () => {
        const newUserToken = await axios.post('/signup', {
          ...userData,
          email: 'norepeatemail@gmail.com',
        });
        const res = await axios.post(
          '/user/update/profile',
          { ...userData, email: 'norepeatemail@gmail.com' },
          {
            headers: {
              authorization: `Bearer ${access_token}`,
            },
          }
        );

        expect(res.status).toBe(400);
        expect(res.data.message).toBe(
          'The email address you have entered is already associated with an account.'
        );
        await axios.post(
          '/user/delete',
          {},
          {
            headers: {
              authorization: `Bearer ${newUserToken}`,
            },
          }
        );
      });

      it('should return status 200 with updated user', async () => {
        const name = 'newname';
        const email = 'newemail@gmail.com';
        const res = await axios.post(
          '/user/update/profile',
          { name, email },
          {
            headers: {
              authorization: `Bearer ${access_token}`,
            },
          }
        );

        expect(res.status).toBe(200);
        expect(typeof res.data.token).toBe('string');

        const decoded = jwt.verify(
          res.data.token,
          process.env.SECRET_TOKEN_KEY
        );
        expect(decoded.email).toBe(email);
        expect(decoded.name).toBe(name);
        expect(decoded.password).toBe(undefined);
      });
    });
    describe('delete user', () => {
      it('should return 403 no token provided', async () => {
        const res = await axios.post('/user/delete');

        expect(res.status).toBe(403);
        expect(res.data.message).toBe('no token provided');
      });

      it('should return status 500 and jwt malformed error', async () => {
        const res = await axios.post(
          '/auth',
          {},
          { headers: { authorization: 'Bearer invalidtoken' } }
        );
        expect(res.status).toBe(500);
        expect(res.data.error).toBe('jwt malformed');
      });
      it('should delete user successfully', async () => {
        const res = await axios.post(
          '/user/delete',
          {},
          {
            headers: {
              authorization: `Bearer ${access_token}`,
            },
          }
        );
        expect(res.status).toBe(200);
        expect(res.data.message).toBe('ok');
      });
    });
    describe('post user delete', () => {
      it('updateUser / should return status 400 user not found', async () => {
        const token = getAuthToken({ _id: 'invalidIdMongoDB' }, 1000);
        const res = await axios.post('/user/update/profile', userData, {
          headers: {
            authorization: `Bearer ${access_token}`,
          },
        });

        expect(res.status).toBe(400);
        expect(res.data.error).toBe('user not found');
      });
    });
  });
});
