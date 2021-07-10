import './types';
import { PrismaClient } from '@prisma/client';
import express, { json, urlencoded } from 'express';
import { Express } from 'express-serve-static-core';
import passport from 'passport';
import { Strategy, VerifyFunctionWithRequest } from 'passport-http-bearer';
import cookieParser from 'cookie-parser';
import 'express-async-errors';
import md5 from 'md5';
import cors from 'cors';
import { errorHandler } from './middlewares';
import { auth } from './routes/auth';
import { users } from './routes/users';
import { posts } from './routes/posts';
import { comments } from './routes/comments';

const prisma = new PrismaClient();

function createServer() {
	return new Promise<Express>((resolve) => {
		const app = express();
		app.listen(process.env.PORT || 8000, () => resolve(app));
	});
}

async function main() {
	await prisma.$connect();

	const app = await createServer();

	app.use(urlencoded({ extended: true }));
	app.use(json());
	app.use(cookieParser(String.random(20)));
	app.use(cors({ credentials: true, origin: (origin, callback) => callback(null, origin) }));

	passport.use(
		new Strategy<VerifyFunctionWithRequest>(
			{
				passReqToCallback: true,
			},
			async (req, hash, done) => {
				try {
					const { key } = req.cookies;
					const token = await prisma.token.findFirst({
						where: {
							hash: md5(hash),
						},
						include: {
							user: true,
						},
					});

					if (!token || !key) {
						return done(null, false);
					}

					if (token.key !== md5(key)) {
						await prisma.token.delete({ where: { id: token.id } });
						return done(null, false);
					}

					req.token = token.except(['user']);

					return done(null, token.user, { scope: 'all' });
				} catch (error) {
					return done(error);
				}
			}
		)
	);

	app.use(passport.initialize());

	app.use('/auth', auth);
	app.use('/users', users);
	app.use('/posts', posts);
	app.use('/comments', comments);

	app.set('prisma', prisma);

	app.use(errorHandler);

	console.log(`✨: Server running on port ${process.env.PORT || 8000}`);
}

main().catch((e) => {
	throw e;
});
