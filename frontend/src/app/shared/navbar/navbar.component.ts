import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Asker } from 'src/app/helpers';
import { StorageService } from 'src/app/libraries/storage.service';
import { UserService } from 'src/app/services/user.service';

@Component({
	selector: 'app-navbar',
	templateUrl: './navbar.component.html',
	styleUrls: ['./navbar.component.scss'],
})
export class NavbarComponent implements OnInit {
	title = 'SocMed';

	constructor(
		private storage: StorageService,
		private router: Router,
		private userService: UserService
	) {}

	ngOnInit(): void {}

	async logout() {
		if (await Asker.notice('Are you sure you want to logout?')) {
			this.storage.remove('user').remove('token');
			await this.userService.logout();
			toastr.info('You have logged out.', 'Notice');
			this.router.navigate(['/login']);
		}
	}
}
