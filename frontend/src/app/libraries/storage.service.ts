import { Injectable } from '@angular/core';
import { State } from './State';

@Injectable({
	providedIn: 'root',
})
export class StorageService extends State {
	constructor() {
		super();
	}
}
