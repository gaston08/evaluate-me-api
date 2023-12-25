import { Request, Response, NextFunction } from 'express';
import { body, check, validationResult } from 'express-validator';
import { User, UserDocument, AuthToken } from '../models/User';
import { getAuthToken } from '../utils/common';

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

					const token = getAuthToken(user);

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

/**
 * Update profile information.
 * @route POST /update
 */
export const updateProfile = async (
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> => {
	await check('email', 'Please enter a valid email address.')
		.isEmail()
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
		const user: UserDocument | null = await User.findById(req.user._id);
		user.email = req.body.email || '';
		user.profile.name = req.body.profile.name || '';
		user.profile.gender = req.body.profile.gender || '';
		user.profile.location = req.body.profile.location || '';
		user.profile.website = req.body.profile.website || '';
		const userDoc = await user.save();
		userDoc.password = undefined;

		const token = getAuthToken(userDoc);

		res.status(200).json({
			token,
		});
	} catch (err) {
		if (err.code === 11000) {
			res.status(400).json({
				message:
					'The email address you have entered is already associated with an account.',
			});
			return;
		}
		return next(err);
	}
};

/**
 * Update current password.
 * @route POST /update/password
 */
export const updatePassword = async (
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> => {
	await check('password', 'Password must be at least 4 characters long')
		.isLength({ min: 4 })
		.run(req);
	await check('confirmPassword', 'Passwords do not match')
		.equals(req.body.password)
		.run(req);

	const errors = validationResult(req);

	if (!errors.isEmpty()) {
		res.status(400).json({
			errors: errors.array(),
		});
		return;
	}

	try {
		const user: UserDocument | null = await User.findById(req.user._id);
		user.password = req.body.password;
		const userDoc = await user.save();

		userDoc.password = undefined;

		const token = getAuthToken(userDoc);

		res.status(200).json({
			token,
		});
	} catch (err) {
		if (err.code === 11000) {
			res.status(400).json({
				message:
					'The email address you have entered is already associated with an account.',
			});
			return;
		}
		return next(err);
	}
};
