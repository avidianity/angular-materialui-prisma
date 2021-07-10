import * as toastr from 'toastr';

const swal = require('sweetalert');

window.toastr = toastr;

export function handleError(error: any) {
	if (error.error) {
		const response = error.error;
		if (response.message && error.status !== 422) {
			toastr.error(response.message);
		} else if (error.status === 422) {
			response.errors
				.map(({ param, msg }: any) => {
					const array = msg.split(' ');

					if (
						array[0].trim().toLowerCase() !==
							param.trim().toLowerCase() &&
						msg.includes('required')
					) {
						return `${param} ${msg}`;
					}
					return msg;
				})
				.forEach((error: any) => toastr.error(error));
		} else {
			toastr.error(
				'Something went wrong, please try again later.',
				'Oops!'
			);
		}
	} else if (error.message) {
		toastr.error(error.message);
	}
}

export class Asker {
	static async notice(message: string, title?: string) {
		return toBool(
			await swal({
				title,
				text: message,
				buttons: ['Cancel', 'Confirm'],
				icon: 'warning',
			})
		);
	}

	static async danger(message: string, title?: string) {
		return toBool(
			await swal({
				title,
				text: message,
				buttons: ['Cancel', 'Confirm'],
				dangerMode: true,
				icon: 'warning',
			})
		);
	}

	static async save(message: string, title?: string) {
		return toBool(
			await swal({
				title,
				text: message,
				buttons: ['Cancel', 'Save'],
				icon: 'info',
			})
		);
	}

	static async okay(message: string, title?: string) {
		return toBool(await swal({ title, text: message, icon: 'info' }));
	}
}

export function toBool(data: any) {
	return data ? true : false;
}
