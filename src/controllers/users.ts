import { Request, Response, NextFunction } from 'express';
import { body, check, validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';
import { User, UserDocument, AuthToken } from '../models/User';

/**
 * Create a new local account.
 * @route POST /signup
 */

export const signup = async (
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> => {
	await check('email', 'Email is not valid').isEmail().run(req);
	await check('password', 'Password must be at least 4 characters long')
		.isLength({ min: 4 })
		.run(req);
	await check('confirmPassword', 'Passwords do not match')
		.equals(req.body.password)
		.run(req);
	await body('email').normalizeEmail({ gmail_remove_dots: false }).run(req);

	const errors = validationResult(req);

	if (!errors.isEmpty()) {
		res.status(400).json({
			errors: errors.array(),
		});
		return;
	}

	const user = new User({
		email: req.body.email,
		password: req.body.password,
	});

	try {
		const result: UserDocument | null = await User.findOne({
			email: req.body.email,
		});

		if (result === null) {
			const userDoc: UserDocument = await user.save();
			userDoc.password = undefined;

			res.status(200).json({
				user: userDoc,
			});
		} else {
			res.status(400).json({
				message: 'Account with that email address already exists',
			});
		}
	} catch (err) {
		return next(err);
	}
};

/**
 * Sign in using email and password.
 * @route POST /login
 */

export const login = async (
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> => {
	await check('email', 'Email is not valid').isEmail().run(req);
	await check('password', 'Password cannot be blank')
		.isLength({ min: 1 })
		.run(req);
	await body('email').normalizeEmail({ gmail_remove_dots: false }).run(req);

	const errors = validationResult(req);

	if (!errors.isEmpty()) {
		res.status(400).json({
			errors: errors.array(),
		});
		return;
	}

	try {
		const user: UserDocument | null = await User.findOne({
			email: req.body.email,
		});
		if (user === null) {
			res.status(400).json({
				message: 'access denied',
			});
		} else {
			user.comparePassword(req.body.password, (err, isMatch) => {
				if (err) {
					return next(err);
				}
				if (isMatch) {
					user.password = undefined;
					// expiration time in 3 min
					const expiresIn = 3 * 60;

					const token = jwt.sign(
						JSON.parse(JSON.stringify(user)),
						process.env.SECRET_TOKEN_KEY,
						{
							expiresIn,
						}
					);
					res.status(200).json({
						token,
					});
				} else {
					res.status(400).json({
						message: 'access denied',
					});
				}
			});
		}
	} catch (err) {
		return next(err);
	}
};
