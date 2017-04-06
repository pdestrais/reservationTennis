import {NgModule}     from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule}    from '@angular/forms';
import {MembersComponent} from './members.component';
import {DataListModule} from 'primeng/components/datalist/datalist';
import {DialogModule} from 'primeng/components/dialog/dialog';
import { RouterModule, Route } from '@angular/router';

@NgModule({
	imports: [
		CommonModule,
        FormsModule,
        DataListModule,
        DialogModule,
				RouterModule
	],
	declarations: [
		MembersComponent
	]
})
export class MembersModule {}
