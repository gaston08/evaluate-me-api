import axios from 'axios';
import { User } from '../../../src/models/User';

const access_token = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2NThhZmYxYjM5YzFkOWVjMmEwYTdkYmQiLCJlbWFpbCI6Imdhc3RvbjA4cGVkcmF6YUBnbWFpbC5jb20iLCJ0b2tlbnMiOltdLCJjcmVhdGVkQXQiOiIyMDIzLTEyLTI2VDE2OjI4OjExLjc4NloiLCJ1cGRhdGVkQXQiOiIyMDIzLTEyLTI2VDE2OjMwOjAyLjEzMloiLCJfX3YiOjAsImlhdCI6MTcwMzYxNDU4OCwiZXhwIjozNTk1Nzc0NTg4fQ.CPWWeLhZIPDqDGhHFMO9fG6NONG6ZLg2hOSNsO3cyuI`;
jest
  .spyOn(User.prototype, 'save')
  .mockImplementationOnce(() => Promise.resolve({ user: true }));

axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response.status === 403 || error.response.status === 500) {
      return Promise.resolve({
        status: error.response.status,
        data: error.response.data,
      });
    }

    // reject with error if response status is not 403
    return Promise.reject(error);
  }
);

/*describe('GET /', () => {
  it('should return a message', async () => {
    const res = await axios.get(`/`);

    expect(res.status).toBe(200);
    expect(res.data).toEqual({ message: 'Hello API' });
  });
});

describe('POST /auth', () => {
  it('should return a status and a name', async () => {
    const res = await axios.post(`/auth`, {});

    expect(res.status).toBe(200);
    expect(res.data).toEqual({ success: true, name: 'Cheddar' });
  });
});
*/
describe('indexControllers', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });
  it('should return hello api', async () => {
    const res = await axios.get('/');

    expect(res.status).toBe(200);
    expect(res.data).toEqual({ message: 'Hello API' });
  });

  it('should return logged', async () => {
    const res = await axios.get('/auth', {
      headers: {
        authorization: `Bearer ${access_token}`,
      },
    });

    expect(res.status).toBe(200);
    expect(res.data).toEqual({ message: 'logged' });
  });

  it('should return 403 no token provided', async () => {
    const res = await axios.get('/auth');

    expect(res.status).toBe(403);
    expect(res.data).toEqual({ message: 'no token provided' });
  });

  it('should return 403 no token provided', async () => {
    const res = await axios.get('/auth', {
      headers: { authorization: 'bad token' },
    });
    console.log(res);

    expect(res.status).toBe(500);
    expect(res.data).toEqual({ message: 'jwt malformed' });
  });
});
