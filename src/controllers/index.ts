import { Request, Response, NextFunction } from 'express';
import { body, check, validationResult } from 'express-validator';

export const index = (req: Request, res: Response) => {
	res.send({ message: 'Hello API' });
};

export const postSignup = async (
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> => {
	console.log(req.body);
	return;
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
		console.log(errors.array());
		return;
	}

	/*const user = new User({
		email: req.body.email,
		password: req.body.password,
	});

	User.findOne(
		{ email: req.body.email },
		(err: NativeError, existingUser: UserDocument) => {
			if (err) {
				return next(err);
			}
			if (existingUser) {
				req.flash('errors', {
					msg: 'Account with that email address already exists.',
				});
				return res.redirect('/signup');
			}
			user.save((err) => {
				if (err) {
					return next(err);
				}
				req.logIn(user, (err) => {
					if (err) {
						return next(err);
					}
					res.redirect('/');
				});
			});
		}
	);*/
};
