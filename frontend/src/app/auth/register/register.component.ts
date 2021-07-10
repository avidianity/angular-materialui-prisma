import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { User } from 'src/app/contracts/user.contract';
import { UserService } from 'src/app/services/user.service';

@Component({
	selector: 'app-register',
	templateUrl: './register.component.html',
	styleUrls: ['./register.component.scss'],
})
export class RegisterComponent implements OnInit {
	user = new User('', '', '');

	processing = false;

	constructor(private userService: UserService, private router: Router) {}

	ngOnInit(): void {}

	async submit() {
		this.processing = true;

		const registered = await this.userService.register(
			this.user.name,
			this.user.email,
			this.user.password!
		);

		this.processing = false;

		if (registered) {
			this.router.navigate(['/posts']);
		}
	}
}
