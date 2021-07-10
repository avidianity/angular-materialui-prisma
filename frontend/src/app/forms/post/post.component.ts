import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Post } from 'src/app/contracts/post.contract';
import { handleError } from 'src/app/helpers';
import { PostService } from 'src/app/services/post.service';

@Component({
	selector: 'app-post',
	templateUrl: './post.component.html',
	styleUrls: ['./post.component.scss'],
})
export class PostComponent implements OnInit {
	mode: 'Add' | 'Edit' = 'Add';

	post = new Post('', '', 0);

	processing = false;

	constructor(
		private router: Router,
		private route: ActivatedRoute,
		private postService: PostService
	) {}

	ngOnInit(): void {
		if (this.router.url.includes('edit')) {
			this.mode = 'Edit';
			const id = Number(this.route.snapshot.paramMap.get('id') || 0);
			this.fetchPost(id);
		}
	}

	private async fetchPost(id: number) {
		try {
			this.post = await this.postService.fetchOne(id);
		} catch (error) {
			handleError(error);
			this.router.navigate(['/posts']);
		}
	}

	async submit() {
		this.processing = true;

		if (this.mode === 'Add') {
			await this.postService.create(this.post);
		} else {
			await this.postService.update(this.post.id!, this.post);
		}

		this.processing = false;

		toastr.success('Post saved successfully.');

		this.router.navigate(['/posts']);
	}
}
