import { Injectable, NgZone } from '@angular/core';
import { Http, Headers, RequestOptions, Response } from '@angular/http';
import * as PouchDB from 'pouchdb';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/rx';
import {DataService} from './data.service'
import { User } from '../model/user';

@Injectable()
export class UserService {

    private postSubject: any = new Subject();

    private users: User[];

    constructor(public dataService: DataService, public http: Http, public zone: NgZone) { 
        this.getAll();
        this.dataService.db.changes({live: true, since: 'now', include_docs: true}).on('change', (change) => {
            if(change.doc.type === 'membre'){
                this.handleEventChanges(change);
            }
        });

    }

        handleEventChanges(change){
        this.zone.run(() => {
            console.log("incoming change : "+JSON.stringify(change));
            let changedDoc = null;
            let changedIndex = null;
            
            this.users.forEach((doc, index) => {
                if(doc._id === change.id){
                changedDoc = doc;
                changedIndex = index;
                }
            });
            
            //A document was deleted
            if(change.deleted){
                this.users.splice(changedIndex, 1);
            } 
            else {
                //A document was updated
                if(changedDoc){
                    this.users[changedIndex] = change.doc;
                } 
                //A document was added
                else {
                    this.users.push(change.doc); 
                }
            } 
            this.postSubject.next(this.users);   
        });
 
    }


/*getAllii() : Observable<any> {
        return Observable.fromPromise(
            this.initDB()
                .then(() => {
                    return this.db.allDocs({ include_docs: true });
                })
                .then(docs => {

                    // Each row has a .doc object and we just want to send an 
                    // array of birthday objects back to the calling code,
                    // so let's map the array to contain just the .doc objects.

                    return docs.rows.map(row => {
                        // Convert string to date, doesn't happen automatically.
                        row.doc.Date = new Date(row.doc.Date);
                        return row.doc;
                    });
                }));
    }
*/    getAll() : Observable<any> {
        return Observable.from(this.dataService.db.allDocs({
                include_docs: true,
                startkey: "membre|",
                endkey:"membre|\uffff"
            })
            .then((result) => {
                this.users = [];
                let docs = result.rows.map((row) => {
                    this.users.push(row.doc);
                });
                //this.postSubject.next(this.users);
                return this.users;
            })
            .catch((error) => {
                console.log(error);
                return error;
                //this.postSubject.error(error);
                //return this.postSubject;
            })); 
    }

    getById(_id: string) {
        this.dataService.db.get(_id)
            .then((result) => { this.postSubject.next(result); })
            .catch((error) => {
                console.log(error);
                this.postSubject.error(error);
            }); 
    }

    //Use NodeJS API because of crypto function used to hash Password
    create(user: User) {
        return this.http.post('/api/users', user, this.jwt())
                .map((response: Response) => response.json())
                .catch((error) => Observable.throw(error.json().message || 'Server error'));
    }

    //Use NodeJS API because of crypto function used to hash Password (if password is changed)
    update(user: User) {
        return this.http.put('/api/users/', user, this.jwt())
                        .map((response: Response) => response.json())
                        .catch((error) => Observable.throw(error.json().message || 'Server error'));;
    }

    //Use NodeJS API because of crypto function used to hash Password (if password is changed)
    updatePwd(user: User, currPwd: string, newPwd: string) {
        let reqBody = {user: user, currPwd: currPwd, newPwd: newPwd};
        return this.http.put('/api/users/changePwd', reqBody, this.jwt())
                        .map((response: Response) => response.json())
                        .catch((error) => Observable.throw(error.json().message || 'Server error'));;
    }

    delete(_id: string, _rev: string) {
        return Observable.from(
            this.dataService.db.remove(_id,_rev)
            .then((result) => { this.postSubject.next(result); })
            .catch((error) => {
                console.log(error);
                this.postSubject.error(error);
            })
        ); 
    }

    private handleError(error: Response | any) {
        // In a real world app, you might use a remote logging infrastructure
        let errMsg: string;
        if (error instanceof Response) {
            const body = error.json() || '';
            const err = body.error || JSON.stringify(body);
            errMsg = `${error.status} - ${error.statusText || ''} ${err}`;
        } else {
            errMsg = error.message ? error.message : error.toString();
        }
        console.error(errMsg);
        return this.postSubject.error(errMsg);
    }
    // private helper methods

    private jwt() {
        // create authorization header with jwt token
        let currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (currentUser && currentUser.token) {
            let headers = new Headers({ 'Authorization': currentUser.token });
            return new RequestOptions({ headers: headers });
        }
    }
}