import jwt from 'jsonwebtoken';

export const getAuthToken = (data) => {
	// expiration time in 1 hs
	const expiresIn = 60 * 60 * 60;

	const token = jwt.sign(
		JSON.parse(JSON.stringify(data)),
		process.env.SECRET_TOKEN_KEY,
		{
			expiresIn,
		}
	);

	return token;
};
