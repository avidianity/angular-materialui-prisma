import { Comment } from './comment.contract';
import { User } from './user.contract';

export class Post {
	constructor(
		public title: string,
		public content: string,
		public userId: number,
		public user?: User,
		public comments?: Comment[],
		public id?: number,
		public createdAt?: string,
		public updatedAt?: string
	) {}
}
