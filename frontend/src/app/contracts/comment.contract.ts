import { Post } from './post.contract';
import { User } from './user.contract';

export class Comment {
	constructor(
		public postId: number,
		public content: string,
		public userId: number,
		public id?: number,
		public createdAt?: string,
		public updatedAt?: string,
		public user?: User,
		public post?: Post
	) {}
}
