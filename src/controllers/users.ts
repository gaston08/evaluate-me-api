import { Request, Response, NextFunction } from 'express';
import { body, check, validationResult } from 'express-validator';
import { User, UserDocument } from '../models/User';
import { getAuthToken } from '../utils/common';
import crypto from 'crypto';
import { transporter } from '../main';

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
 * @route POST /user/update/profile
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
 * @route POST /user/update/password
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
		return next(err);
	}
};

/**
 * Delete user account.
 * @route POST /user/delete
 */
export const deleteAccount = async (
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		const result = await User.deleteOne({ _id: req.user._id });
		if (result.acknowledged && result.deletedCount === 1) {
			res.status(200).json({
				message: 'ok',
			});
		} else {
			res.status(400).json({
				message: 'cannot delete user',
			});
		}
	} catch (err) {
		return next(err);
	}
};

/**
 * Create a random token, then the send user an email with a reset link.
 * @route POST /user/forgot/password
 */
export const forgotPassword = async (
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
		const user: UserDocument | null = await User.findOne({
			email: req.body.email,
		});
		if (user === null) {
			res.status(400).json({
				message: `account with that email doesn't exist`,
			});
			return;
		}

		const random_token = crypto.randomBytes(32).toString('hex');
		user.passwordResetToken = random_token;
		user.passwordResetExpires = Date.now() + 3600000; // 1 hour
		await user.save();

		const mailOptions = {
			from: process.env.EMAIL_SENDER,
			to: 'gastigasti0808@gmail.com',
			subject: 'Reset your password',
			text: `You are receiving this email because you (or someone else) have requested the reset of the password for your account.\n\n
          Please click on the following link, or paste this into your browser to complete the process:\n\n
          http://${req.headers.host}/reset/${random_token}\n\n
          If you did not request this, please ignore this email and your password will remain unchanged.\n`,
		};

		const result = await transporter.sendMail(mailOptions);
		if (result.accepted.length === 1) {
			res.status(200).json({
				message: 'email sended',
			});
		} else {
			res.status(500).json({
				message: 'can not send email',
			});
		}
	} catch (err) {
		return next(err);
	}
};

/**
 * Process the reset password request.
 * @route POST /user/reset/password
 */
export const resetPassword = async (
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> => {
	await check('password', 'Password must be at least 4 characters long.')
		.isLength({ min: 4 })
		.run(req);
	await check('confirmPassword', 'Passwords must match.')
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
		const user: UserDocument | null = await User.findOne({
			passwordResetToken: req.params.token,
		})
			.where('passwordResetExpires')
			.gt(Date.now())
			.exec();

		if (user === null) {
			res.status(400).json({
				message: `token invalid or has expired`,
			});
			return;
		}

		user.password = req.body.password;
		user.passwordResetToken = undefined;
		user.passwordResetExpires = undefined;

		await user.save();

		const mailOptions = {
			from: process.env.EMAIL_SENDER,
			to: 'gastigasti0808@gmail.com',
			subject: 'your password has changed',
			text: `password changed successfully`,
		};

		const result = await transporter.sendMail(mailOptions);
		if (result.accepted.length === 1) {
			res.status(200).json({
				message: 'email sended',
			});
		} else {
			res.status(500).json({
				message: 'can not send email',
			});
		}
	} catch (err) {
		return next(err);
	}
};
