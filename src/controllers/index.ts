import { Request, Response, NextFunction } from 'express';
import { body, check, validationResult } from 'express-validator';

export const index = (req: Request, res: Response) => {
	res.send({ message: 'Hello API' });
};
