import {Injectable} from '@angular/core';
import {Http, Response} from '@angular/http';

@Injectable()
export class EventService {

    private dataUrl = '/api';  // URL to web API                    
    
    constructor(private http: Http) {}

    getEvents() {
        return this.http.get(this.dataUrl+"/events")
                    .map(res => <any[]> res.json().data);
/*        return this.http.get('showcase/resources/data/scheduleevents.json')
                    .toPromise()
                    .map(res => <any[]> res.json().data);
                    .then(data => { return data; });
*/    }
}