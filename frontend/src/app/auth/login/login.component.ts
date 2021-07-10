import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { User } from 'src/app/contracts/user.contract';
import { UserService } from 'src/app/services/user.service';

@Component({
	selector: 'app-login',
	templateUrl: './login.component.html',
	styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
	user = new User('', '', '');

	processing = false;

	constructor(private userService: UserService, private router: Router) {}

	ngOnInit(): void {}

	async submit() {
		this.processing = true;
		const logged = await this.userService.login(
			this.user.email,
			this.user.password!
		);
		this.processing = false;
		if (logged) {
			this.router.navigate(['/posts']);
		}
	}
}
