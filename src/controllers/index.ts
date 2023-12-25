import { Request, Response, NextFunction } from 'express';
import { body, check, validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';

export const index = (req: Request, res: Response) => {
	res.send({ message: 'Hello API' });
};

export const checkAuth = (req: Request, res: Response, next: NextFunction) => {
	if (!req.headers.authorization) {
		return res.status(403).json({
			message: 'no token provided',
		});
	}

	const access_token = req.headers.authorization.split(' ')[1];

	try {
		const decoded = jwt.verify(access_token, process.env.SECRET_TOKEN_KEY);
		req.user = decoded;
		return next();
		next();
	} catch (err) {
		return next(err);
	}
};

export const indexAuth = (req: Request, res: Response) => {
	res.status(200).json({
		message: 'logged',
	});
};
