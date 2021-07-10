export class User {
	constructor(
		public name: string,
		public email: string,
		public password?: string,
		public id?: number,
		public createdAt?: string,
		public updatedAt?: string
	) {}
}
