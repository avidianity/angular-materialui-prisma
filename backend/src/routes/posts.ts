import { Request, Response, Router } from 'express';
import { getPrisma, validate } from '../helpers';
import { authenticate } from '../middlewares';
import 'express-async-errors';
import { NotFoundException } from '../exceptions/NotFoundException';
import { body } from 'express-validator';
import '../types';

const router = Router();

router.use(authenticate());

router.get('/', async (req, res) => {
	const prisma = getPrisma(req);
	return res.json(
		await prisma.post.findMany({
			include: {
				user: true,
				comments: {
					include: {
						user: true,
					},
				},
			},
			orderBy: {
				createdAt: 'desc',
			},
		})
	);
});

router.get('/:id', async (req, res) => {
	const prisma = getPrisma(req);

	const post = await prisma.post.findFirst({
		where: { id: req.params.id.toNumber() },
		include: {
			comments: {
				include: {
					user: true,
				},
			},
			user: true,
		},
	});

	if (!post) {
		throw new NotFoundException('Post does not exist.');
	}

	return res.json(post);
});

router.post(
	'/',
	[body('title').isString().bail().notEmpty(), body('content').isString().bail().notEmpty(), validate()],
	async (req: Request, res: Response) => {
		const prisma = getPrisma(req);
		const { title, content } = req.body;

		const post = await prisma.post.create({
			data: {
				title,
				content,
				userId: req.user!.id,
			},
		});

		return res.json(post);
	}
);

function update() {
	return [
		body('title').isString().bail().notEmpty().optional(),
		body('content').isString().bail().notEmpty().optional(),
		validate(),
		async (req: Request, res: Response) => {
			const prisma = getPrisma(req);
			const { title, content } = req.body;

			const post = await prisma.post.findFirst({
				where: { id: req.params.id.toNumber(), userId: req.user?.id },
			});

			if (!post) {
				throw new NotFoundException('Post does not exist.');
			}

			return res.json(
				await prisma.post.update({
					where: { id: post.id },
					data: {
						title,
						content,
					},
				})
			);
		},
	];
}

router.patch('/:id', update());
router.put('/:id', update());

router.delete('/:id', async (req, res) => {
	const prisma = getPrisma(req);

	const post = await prisma.post.findFirst({
		where: { id: req.params.id.toNumber(), userId: req.user?.id },
	});

	if (!post) {
		throw new NotFoundException('Post does not exist.');
	}

	await prisma.post.delete({
		where: { id: post.id },
	});

	return res.sendStatus(204);
});

export const posts = router;
