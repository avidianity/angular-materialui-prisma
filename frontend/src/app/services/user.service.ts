import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { constants } from '../constants';
import { User } from '../contracts/user.contract';
import { handleError } from '../helpers';
import { StorageService } from '../libraries/storage.service';

type AuthResponse = {
	user: User;
	token: string;
};

@Injectable({
	providedIn: 'root',
})
export class UserService {
	constructor(private http: HttpClient, private storage: StorageService) {}

	private headers = new HttpHeaders({
		'Content-Type': 'application/json',
		Accept: 'application/json',
	});

	public notify = true;

	withoutNotifications(callback: (service: this) => void) {
		const previous = this.notify;
		this.notify = false;
		callback(this);
		this.notify = previous;
	}

	async login(email: string, password: string) {
		try {
			const { user, token } = await this.http
				.post<AuthResponse>(
					`${constants.url}/auth/login`,
					{
						email,
						password,
					},
					{ headers: this.headers, withCredentials: true }
				)
				.toPromise();

			this.storage.set('user', user);
			this.storage.set('token', token);

			toastr.success(`Welcome back, ${user.name}!`);

			return true;
		} catch (error) {
			if (this.notify) {
				handleError(error);
			}
			return false;
		}
	}

	async register(name: string, email: string, password: string) {
		try {
			const { user, token } = await this.http
				.post<AuthResponse>(
					`${constants.url}/auth/register`,
					{
						email,
						password,
						name,
					},
					{ headers: this.headers, withCredentials: true }
				)
				.toPromise();

			this.storage.set('user', user);
			this.storage.set('token', token);

			toastr.success(`Welcome, ${user.name}!`);

			return true;
		} catch (error) {
			if (this.notify) {
				handleError(error);
			}
			return false;
		}
	}

	async logout() {
		try {
			await this.http.get(`${constants.url}/auth/logout`).toPromise();
		} catch (_) {}
	}
}
