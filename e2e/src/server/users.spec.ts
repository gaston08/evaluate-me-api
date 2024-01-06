import axios from 'axios';
import jwt from 'jsonwebtoken';

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
  };
  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('create user', () => {
    it('should return status 400 with errors fields', async () => {
      const res = await axios.post('/signup', {});

      const emailError = res.data.errors.some((err) => err.path === 'email');
      const passwordError = res.data.errors.some(
        (err) => err.path === 'password'
      );
      const confirmPasswordError = res.data.errors.some(
        (err) => err.path === 'confirmPassword'
      );

      expect(res.status).toBe(400);
      expect(emailError).toBe(true);
      expect(passwordError).toBe(true);
      expect(confirmPasswordError).toBe(true);
    });

    it('should create an user successfully', async () => {
      const res = await axios.post('/signup', userData);
      expect(res.status).toBe(200);
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

  describe('delete user', () => {
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

  /*it('should return hello api', async () => {
    const res = await axios.get('/');

    expect(res.status).toBe(200);
    expect(res.data).toEqual({ message: 'Hello API' });
  });

  it('should return logged', async () => {
    const res = await axios.post('/auth', {
      headers: {
        authorization: `Bearer ${access_token}`,
      },
    });

    expect(res.status).toBe(200);
    expect(res.data).toEqual({ message: 'logged' });
  });

  it('should return 403 no token provided', async () => {
    const res = await axios.post('/auth');

    expect(res.status).toBe(403);
    expect(res.data).toEqual({ message: 'no token provided' });
  });

  it('should return 403 no token provided', async () => {
    const res = await axios.post('/auth', {
      headers: { authorization: 'bad token' },
    });
    console.log(res);

    expect(res.status).toBe(500);
    expect(res.data).toEqual({ message: 'jwt malformed' });
  });*/
});
