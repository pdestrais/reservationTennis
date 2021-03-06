import {Component,OnInit,SimpleChange,OnChanges} from '@angular/core';
import {EventService} from '../service/event.service';
import {AlertService} from '../service/alert.service';

import { Router } from '@angular/router';

import * as moment from 'moment/moment';

import { Event} from '../model/event';

@Component({
    templateUrl: './clubschedule.component.html',
    styles: [`
        .ui-grid-row div {
          padding: 4px 10px
        }
        
        .ui-grid-row div label {
          font-weight: bold;
        }
  `]
})

export class Clubschedule implements OnInit {

    events: any[];
    
    header: any;
    
    event: Event;
    startDate: string;
    startTime: string;
    endDate: string;
    endTime: string;

    defaultDate: string = moment().format("YYYY-MM-DD");
    
    dialogVisible: boolean = false;
    loading: boolean = false;

    allowToModify: boolean = true;

    times: any[] = [{label:"09:00",value:"09:00:00"},{label:"09:30",value:"09:30:00"},{label:"10:00",value:"10:00:00"},{label:"10:30",value:"10:30:00"},
                        {label:"11:00",value:"11:00:00"},{label:"11:30",value:"11:30:00"},{label:"12:00",value:"12:00:00"},{label:"12:30",value:"12:30:00"},
                        {label:"13:00",value:"13:00:00"},{label:"13:30",value:"13:30:00"},{label:"14:00",value:"14:00:00"},{label:"14:30",value:"14:30:00"},
                        {label:"15:00",value:"15:00:00"},{label:"15:30",value:"15:30:00"},{label:"16:00",value:"16:00:00"},{label:"16:30",value:"16:30:00"},
                        {label:"17:00",value:"17:00:00"},{label:"17:30",value:"17:30:00"},{label:"18:00",value:"18:00:00"},{label:"18:30",value:"18:30:00"},
                        {label:"19:00",value:"19:00:00"},{label:"19:30",value:"19:30:00"},{label:"20:00",value:"20:00:00"},{label:"20:30",value:"20:30:00"},
                        {label:"21:00",value:"21:00:00"},{label:"21:30",value:"21:30:00"},{label:"22:00",value:"22:00:00"},{label:"22:30",value:"22:30:00"}];
    
    idGen: number = 100;
    
    constructor(private eventService: EventService, private alertService: AlertService, private router: Router) { }

    ngOnInit() {
        if (!this.events) {
            let nowStart = moment().subtract(6,'M');
            let nowEnd = moment().add(6,'M');
            // NOT USED anymore ---- fetches 6 months before and after current date
/*            this.eventService.getEvents(this.getMonthDateRange(nowStart.year(),nowStart.month()).start.format("YYYY-MM-DD"),
                                        this.getMonthDateRange(nowEnd.year(),nowEnd.month()).end.format("YYYY-MM-DD"))
*/
            this.eventService.getAllEvents()
            .then(events => {
                this.events = events; 
                this.events.map(event => event.id = event._id)
                console.log("fetched events : "+JSON.stringify(this.events));});
        }

        this.header = {
			left: 'prev,next today',
			center: 'title',
			right: 'month,agendaWeek,agendaDay'
		};
    }

    handleTimeChanges(e) {
        this.endTime = moment(this.startDate+"T"+this.startTime).add(1,"h").format("HH:mm:SS");
    }
    
    handleDayClick(event) {
        this.event = new Event();
        this.event.title = JSON.parse(localStorage.getItem('currentUser')).lastname;
        if (event.view.name == 'month') {
            this.startDate = event.date.format();
            this.endDate = this.startDate;
            this.startTime = "09:00:00";
            this.endTime = "10:00:00";
        } else {
            let tmpDate = moment(event.date.format());
            this.startDate = tmpDate.format("YYYY-MM-DD");
            this.endDate = this.startDate;
            this.startTime = tmpDate.format("HH:mm:SS");
            this.endTime = tmpDate.add(1, 'h').format("HH:mm:SS");
        }
        this.dialogVisible = true;
        this.allowToModify = true;
    }
    
    handleEventMove(e) {
        this.handleEventResize(e);
    }

    handleEventResize(e) {
        this.event = new Event();
        this.event.title = e.event.title;
        this.startDate = e.event.start.format("YYYY-MM-DD");
        this.startTime = e.event.start.format("HH:mm:SS");
        this.endDate = e.event.end.format("YYYY-MM-DD");
        this.endTime = e.event.end.format("HH:mm:SS");
        this.event._id = e.event._id;
        this.event._rev = e.event._rev;
        this.saveEvent();
    }

    handleEventClick(e) {
        this.event = new Event();
        this.event.title = e.calEvent.title;
        this.startDate = e.calEvent.start.format("YYYY-MM-DD");
        this.startTime = e.calEvent.start.format("HH:mm:SS");
        this.endDate = e.calEvent.end.format("YYYY-MM-DD");
        this.endTime = e.calEvent.end.format("HH:mm:SS");
        this.event._id = e.calEvent._id;
        this.event._rev = e.calEvent._rev;
        if (this.event.title == JSON.parse(localStorage.getItem('currentUser')).lastname)
            this.allowToModify = true;
        else 
            this.allowToModify = false;
        this.dialogVisible = true;
    }
    
    saveEvent() {
        this.event.start = this.startDate+"T"+this.startTime;
        this.event.end = this.endDate+"T"+this.endTime;
        // Check that no overlap exist with other event
        let overlap: boolean = false;
        for (let i=0;i<this.events.length;i++) {
            //if overlap
            if (!(this.event._id == this.events[i]._id) && !(this.event.start >= this.events[i].end || this.event.end <= this.events[i].start) )
                {overlap = true;  break;}
            else { continue; }
        };
        if (overlap) {
            this.dialogVisible = false;
            this.alertService.error('votre réservation est en conflit avec une autre réservation', true);
        }
        else {
            //new event
            this.loading = true;
            if(!this.event._id) {
                this.eventService.createEvent(this.event)
                    .then(
                    data => {
                        console.log("event stored");
                        this.alertService.success('Enregistrement réussi', true);
                    },
                    error => {
                        console.log("problem storing event");
                        this.alertService.error(error);
                        this.loading = false;
                    });
            }
            //update
            else {
                //When an event is updated, this means that it's start or end is changed. As those values are used in the doc_id, we have to suppress the document and create a new one.
                this.eventService.deleteEvent(this.event)
                    .then(
                    data => {
                        console.log("event deleted");
                        delete this.event._id;
                        delete this.event._rev;
                        this.eventService.createEvent(this.event)
                        .then(
                        cdata => {
                            console.log("event stored");
                            this.event = null;
                            this.loading = false;
                            this.alertService.success('Mise à jour réussie', true);
                        },
                        error => {
                            console.log("problem updating event");
                            this.alertService.error(error);
                            this.loading = false;
                        });
                    },
                    error => {
                        this.alertService.error(error);
                        this.loading = false;
                    });
            }
            this.dialogVisible = false;
        }
    }
    
    deleteEvent() {
        this.eventService.deleteEvent(this.event)
                .then(
                data => {
                    this.alertService.success('Suppression réussie', true);
                },
                error => {
                    this.alertService.error(error);
                    this.loading = false;
                });
        this.dialogVisible = false;
    }

    getMonthDateRange(year, month) {
        // month in moment is 0 based, so 9 is actually october, subtract 1 to compensate
        // array is 'year', 'month', 'day', etc
        var startDate = moment([year, month - 1]);
        // Clone the value before .endOf()
        var endDate = moment(startDate).endOf('month');
        return { start: startDate, end: endDate };
    }
}