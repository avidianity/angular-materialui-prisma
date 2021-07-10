import { Component, OnInit } from '@angular/core';
import { Comment } from '../contracts/comment.contract';
import { Post } from '../contracts/post.contract';
import { User } from '../contracts/user.contract';
import { Asker, handleError } from '../helpers';
import { StorageService } from '../libraries/storage.service';
import { CommentService } from '../services/comment.service';
import { PostService } from '../services/post.service';

@Component({
	selector: 'app-posts',
	templateUrl: './posts.component.html',
	styleUrls: ['./posts.component.scss'],
})
export class PostsComponent implements OnInit {
	posts: Post[] = [];
	user = this.storage.get<User>('user');

	data = {
		comment: new Comment(0, '', this.user!.id!),
	};

	commentMode: 'View' | 'Add' | 'Edit' = 'View';

	processingComment = false;

	constructor(
		private postService: PostService,
		private commentService: CommentService,
		private storage: StorageService
	) {}

	ngOnInit(): void {
		this.postService.fetch().subscribe((posts) => {
			this.posts = posts;
		});
	}

	refresh() {
		this.postService.fetch();
	}

	async removePost(post: Post) {
		if (await Asker.danger('Are you sure you want to delete this Post?')) {
			await this.postService.delete(post.id!);
			toastr.success('Post deleted successfully.');
			this.postService.fetch();
		}
	}

	addComment(post: Post) {
		this.commentMode = 'Add';
		this.data.comment = new Comment(post.id!, '', this.user!.id!);
	}

	editComment(comment: Comment) {
		this.commentMode = 'Edit';
		this.data.comment = comment;
	}

	async removeComment(comment: Comment) {
		if (
			await Asker.danger('Are you sure you want to delete this Comment?')
		) {
			try {
				await this.commentService.delete(comment.id!);
				toastr.success('Comment deleted successfully.');
				this.postService.fetch();
			} catch (error) {
				handleError(error);
			}
		}
	}

	async submitComment() {
		this.processingComment = true;
		try {
			if (this.commentMode === 'Add') {
				await this.commentService.create(this.data.comment);
			} else {
				await this.commentService.update(
					this.data.comment.id!,
					this.data.comment
				);
			}
			toastr.success('Comment saved successfully.');
			this.cancelEdit();
			this.postService.fetch();
		} catch (error) {
			handleError(error);
		} finally {
			this.processingComment = false;
		}
	}

	cancelEdit() {
		this.commentMode = 'View';
		this.data.comment = new Comment(0, '', this.user!.id!);
	}
}
