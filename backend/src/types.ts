import { Token, User as UserModel } from '@prisma/client';
import '@avidian/extras';

declare global {
	namespace Express {
		export interface Request {
			token?: Token;
		}

		export interface User extends UserModel {}
	}
}
