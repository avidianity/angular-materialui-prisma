import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { constants } from '../constants';
import { Post } from '../contracts/post.contract';
import { StorageService } from '../libraries/storage.service';

@Injectable({
	providedIn: 'root',
})
export class PostService {
	private headers: HttpHeaders;

	posts = new Subject<Post[]>();

	constructor(private http: HttpClient, private storage: StorageService) {
		this.headers = new HttpHeaders({
			'Content-Type': 'application/json',
			Accept: 'application/json',
			Authorization: `Bearer ${this.storage.get('token')}`,
		});
	}

	fetch() {
		this.http
			.get<Post[]>(`${constants.url}/posts`, {
				headers: this.headers,
				withCredentials: true,
			})
			.toPromise()
			.then((posts) => this.posts.next(posts));

		return this.posts.asObservable();
	}

	async fetchOne(id: number) {
		const post = await this.http
			.get<Post>(`${constants.url}/posts/${id}`, {
				headers: this.headers,
				withCredentials: true,
			})
			.toPromise();

		return post;
	}

	async create(data: Post) {
		const post = await this.http
			.post<Post>(`${constants.url}/posts`, data, {
				headers: this.headers,
				withCredentials: true,
			})
			.toPromise();

		return post;
	}

	async update(id: number, data: Post) {
		const post = await this.http
			.put<Post>(`${constants.url}/posts/${id}`, data, {
				headers: this.headers,
				withCredentials: true,
			})
			.toPromise();

		return post;
	}

	async delete(id: number) {
		await this.http
			.delete<void>(`${constants.url}/posts/${id}`, {
				headers: this.headers,
				withCredentials: true,
			})
			.toPromise();
	}
}
