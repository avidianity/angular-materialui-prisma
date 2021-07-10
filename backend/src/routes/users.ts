import { Router } from 'express';
import { authenticate } from '../middlewares';
import 'express-async-errors';
import { getPrisma } from '../helpers';
import { NotFoundException } from '../exceptions/NotFoundException';

const router = Router();

router.use(authenticate());

router.get('/', async (req, res) => {
	const prisma = getPrisma(req);
	return res.json((await prisma.user.findMany()).except(['password']));
});

router.get('/:id', async (req, res) => {
	const prisma = getPrisma(req);

	const user = await prisma.user.findFirst({
		where: { id: req.params.id.toNumber() },
	});

	if (!user) {
		throw new NotFoundException('User does not exist.');
	}

	return res.json(user);
});

export const users = router;
