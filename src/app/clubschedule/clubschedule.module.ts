import {NgModule}     from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule}    from '@angular/forms';
import {Clubschedule} from './clubschedule.component';
import {ScheduleRoutingModule} from './clubschedule.router';
import {ScheduleModule} from 'primeng/components/schedule/schedule';
import {DialogModule} from 'primeng/components/dialog/dialog';
import {InputTextModule} from 'primeng/components/inputtext/inputtext';
import {CalendarModule} from 'primeng/components/calendar/calendar';
import {CheckboxModule} from 'primeng/components/checkbox/checkbox';
import {DropdownModule} from 'primeng/components/dropdown/dropdown';
import {ButtonModule} from 'primeng/components/button/button';
import {TabViewModule} from 'primeng/components/tabview/tabview';
import {CodeHighlighterModule} from 'primeng/components/codehighlighter/codehighlighter';

@NgModule({
	imports: [
		CommonModule,
        FormsModule,
		ScheduleRoutingModule,
        ScheduleModule,
        DialogModule,
        InputTextModule,
        CalendarModule,
        CheckboxModule,
        DropdownModule,
        ButtonModule,
        TabViewModule,
        CodeHighlighterModule
	],
	declarations: [
		Clubschedule
	]
})
export class ClubscheduleModule {}
