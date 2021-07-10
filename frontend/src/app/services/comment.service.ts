import { HttpHeaders, HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { constants } from '../constants';
import { Comment } from '../contracts/comment.contract';
import { StorageService } from '../libraries/storage.service';

@Injectable({
	providedIn: 'root',
})
export class CommentService {
	private headers: HttpHeaders;

	comments = new Subject<Comment[]>();

	constructor(private http: HttpClient, private storage: StorageService) {
		this.headers = new HttpHeaders({
			'Content-Type': 'application/json',
			Accept: 'application/json',
			Authorization: `Bearer ${this.storage.get('token')}`,
		});
	}

	fetch() {
		this.http
			.get<Comment[]>(`${constants.url}/comments`, {
				headers: this.headers,
				withCredentials: true,
			})
			.toPromise()
			.then((comments) => this.comments.next(comments));

		return this.comments.asObservable();
	}

	async fetchOne(id: number) {
		const comment = await this.http
			.get<Comment>(`${constants.url}/comments/${id}`, {
				headers: this.headers,
				withCredentials: true,
			})
			.toPromise();

		return comment;
	}

	async create(data: Comment) {
		const comment = await this.http
			.post<Comment>(`${constants.url}/comments`, data, {
				headers: this.headers,
				withCredentials: true,
			})
			.toPromise();

		return comment;
	}

	async update(id: number, data: Comment) {
		const comment = await this.http
			.put<Comment>(`${constants.url}/comments/${id}`, data, {
				headers: this.headers,
				withCredentials: true,
			})
			.toPromise();

		return comment;
	}

	async delete(id: number) {
		await this.http
			.delete<void>(`${constants.url}/comments/${id}`, {
				headers: this.headers,
				withCredentials: true,
			})
			.toPromise();
	}
}
