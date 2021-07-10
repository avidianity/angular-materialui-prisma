import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';

@NgModule({
	declarations: [],
	exports: [
		CommonModule,
		MatInputModule,
		MatButtonModule,
		MatToolbarModule,
		MatMenuModule,
		MatCardModule,
		MatFormFieldModule,
		MatIconModule,
		MatDividerModule,
	],
})
export class MaterialModule {}
