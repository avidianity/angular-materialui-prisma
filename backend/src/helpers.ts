import { Request, Response, NextFunction } from 'express';
import { validationResult, matchedData } from 'express-validator';
import { ValidationException } from './exceptions/ValidationException';
import { hashSync, compareSync } from 'bcrypt';
import { PrismaClient } from '@prisma/client';
import { capitalize } from 'lodash';

export function validate() {
	return (req: Request, _res: Response, next: NextFunction) => {
		const errors = validationResult(req);

		if (!errors.isEmpty()) {
			return next(new ValidationException(errors.array()));
		}

		const data = matchedData(req, { locations: ['body'] });
		req.body = { ...data };
		return next();
	};
}

export namespace Hash {
	export function make(data: any) {
		return hashSync(data, 8);
	}

	export function check(data: any, hashed: string) {
		return compareSync(data, hashed);
	}
}

export namespace Validation {
	export function unique(model: keyof PrismaClient, key: string, message?: string) {
		const prisma: any = new PrismaClient();
		return async (value: any) => {
			try {
				const exists = await prisma[model].findFirst({
					where: {
						[key]: value,
					},
				});
				if (exists) {
					return Promise.reject(message ? message : `${capitalize(key)} is already taken.`);
				}
				return true;
			} catch (error) {
				console.error(error);
				return Promise.reject(`Unable to verify ${key}.`);
			}
		};
	}

	export function exists(model: keyof PrismaClient, key: string, message?: string) {
		const prisma: any = new PrismaClient();
		return async (value: any) => {
			try {
				const exists = await prisma[model].findFirst({
					where: {
						[key]: value,
					},
				});
				if (!exists) {
					return Promise.reject(message ? message : `${capitalize(key)} does not exist.`);
				}
				return true;
			} catch (error) {
				console.error(error);
				return Promise.reject(`Unable to verify ${key}.`);
			}
		};
	}
}

export function getPrisma(req: Request) {
	return req.app.get('prisma') as PrismaClient;
}
