import axios from 'axios';
import { User } from '../../../src/models/User';

const access_token = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2NTk4ODczNjM5YTI2NTAxNGExNjQwNzUiLCJlbWFpbCI6Imdhc3RpQGdtYWlsLmNvbSIsInRva2VucyI6W10sImNyZWF0ZWRBdCI6IjIwMjQtMDEtMDVUMjI6NDg6MjIuNjA4WiIsInVwZGF0ZWRBdCI6IjIwMjQtMDEtMDVUMjI6NDg6MjIuNjA4WiIsIl9fdiI6MCwiaWF0IjoxNzA0NDk0OTEwLCJleHAiOjE3MDQ3MTA5MTB9.otU8ll9U55MRwcCd_ghuw1VjQBQK__vlFK-5iJ6V4UI`;
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
  });
});
