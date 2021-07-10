import { Request, Response, Router } from 'express';
import { body } from 'express-validator';
import 'express-async-errors';
import { getPrisma, Hash, validate, Validation } from '../helpers';
import md5 from 'md5';
import { NotFoundException } from '../exceptions/NotFoundException';
import { BadRequestException } from '../exceptions/BadRequestException';
import dayjs from 'dayjs';
import { authenticate } from '../middlewares';

const router = Router();

router.post(
	'/register',
	[
		body('name').isString().bail().notEmpty(),
		body('email').isEmail().bail().custom(Validation.unique('user', 'email')),
		body('password').isString().bail().notEmpty(),
		validate(),
	],
	async (req: Request, res: Response) => {
		const { name, email, password } = req.body;

		const prisma = getPrisma(req);

		const hash = String.random(30);
		const key = String.random(5);

		const user = await prisma.user.create({
			data: {
				name,
				email,
				password: Hash.make(password),
				tokens: {
					create: {
						hash: md5(hash),
						key: md5(key),
					},
				},
			},
		});

		return res
			.cookie('key', key, { httpOnly: true, expires: dayjs().add(1, 'month').toDate() })
			.json({ user: user.except(['password']), token: hash });
	}
);

router.post(
	'/login',
	[body('email').isEmail(), body('password').isString().bail().notEmpty(), validate()],
	async (req: Request, res: Response) => {
		const { email, password } = req.body;

		const prisma = getPrisma(req);

		const user = await prisma.user.findFirst({
			where: {
				email,
			},
		});

		if (!user) {
			throw new NotFoundException('Email does not exist.');
		}

		if (!Hash.check(password, user.password)) {
			throw new BadRequestException('Password is incorrect.');
		}

		const hash = String.random(30);
		const key = String.random(5);

		await prisma.token.create({
			data: {
				userId: user.id,
				hash: md5(hash),
				key: md5(key),
			},
		});

		return res
			.cookie('key', key, { httpOnly: true, expires: dayjs().add(1, 'month').toDate() })
			.json({ user: user.except(['password']), token: hash });
	}
);

router.post(
	'/update',
	[
		body('name').isString().bail().notEmpty().optional(),
		body('email').isEmail().optional(),
		body('password').isString().bail().notEmpty().optional(),
		validate(),
	],
	async (req: Request, res: Response) => {
		const { name, email, password } = req.body;
		const prisma = getPrisma(req);
		if (email) {
			const exist = await prisma.user.findFirst({
				where: {
					email,
					id: {
						not: req.user?.id,
					},
				},
			});

			if (exist) {
				throw new BadRequestException('Email already exists.');
			}
		}

		const data = {
			name,
			email,
			password: password ? Hash.make(password) : undefined,
		};

		const user = await prisma.user.update({
			where: {
				id: req.user?.id,
			},
			data,
		});

		return res.json(user);
	}
);

router.get('/check', authenticate(), (req, res) => res.json(req.user?.except(['password'])));

router.get('/logout', authenticate(), async (req, res) => {
	const prisma = getPrisma(req);

	await prisma.token.delete({ where: { id: req.token?.id } });

	return res.clearCookie('key').sendStatus(204);
});

export const auth = router;
