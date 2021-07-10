import { Request, Response, Router } from 'express';
import { getPrisma, validate, Validation } from '../helpers';
import { authenticate } from '../middlewares';
import 'express-async-errors';
import { NotFoundException } from '../exceptions/NotFoundException';
import { body } from 'express-validator';

const router = Router();

router.use(authenticate());

router.get('/', async (req, res) => {
	const prisma = getPrisma(req);
	return res.json(await prisma.comment.findMany({ include: { user: true, post: true } }));
});

router.get('/:id', async (req, res) => {
	const prisma = getPrisma(req);

	const comment = await prisma.comment.findFirst({
		where: { id: req.params.id.toNumber() },
		include: {
			post: true,
			user: true,
		},
	});

	if (!comment) {
		throw new NotFoundException('Comment does not exist.');
	}

	return res.json(comment);
});

router.post(
	'/',
	[body('content').isString().bail().notEmpty(), body('postId').isNumeric().bail().custom(Validation.exists('post', 'id')), validate()],
	async (req: Request, res: Response) => {
		const prisma = getPrisma(req);
		const { postId, content } = req.body;

		const comment = await prisma.comment.create({
			data: {
				content,
				userId: req.user!.id,
				postId,
			},
		});

		return res.json(comment);
	}
);

function update() {
	return [
		body('content').isString().bail().notEmpty().optional(),
		validate(),
		async (req: Request, res: Response) => {
			const prisma = getPrisma(req);
			const { content } = req.body;

			const comment = await prisma.comment.findFirst({
				where: { id: req.params.id.toNumber(), userId: req.user?.id },
			});

			if (!comment) {
				throw new NotFoundException('Comment does not exist.');
			}

			return res.json(
				await prisma.comment.update({
					where: { id: comment.id },
					data: {
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

	const comment = await prisma.comment.findFirst({
		where: { id: req.params.id.toNumber(), userId: req.user?.id },
	});

	if (!comment) {
		throw new NotFoundException('Comment does not exist.');
	}

	await prisma.comment.delete({
		where: { id: comment.id },
	});

	return res.sendStatus(204);
});

export const comments = router;
