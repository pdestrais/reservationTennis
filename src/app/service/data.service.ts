import { Injectable } from '@angular/core';
import * as PouchDB from 'pouchdb'

@Injectable()
export class DataService {
 
    db: any;
    remoteDatabase: any;
    remote: string = 'https://pdestrais.cloudant.com/resa_tennis';
    APIKeyUsr: string = 'redinteredwitchastoosell';
    APIKeyPwd: string = 'f264debec723022e3f0596c5a8aa0e5523880ba4';
 
    constructor() {
 
        this.db = new PouchDB('resa_tennis');
        this.remoteDatabase = new PouchDB(
            this.remote,
            {
                auth: {
                    username: this.APIKeyUsr,
                    password: this.APIKeyPwd
                },
                // The database already exists - no need for PouchDB to check to see
                // if it exists (and try to create it). This saves on some API requests.
                skip_setup: true
            }
        );
        let options = {
          live: true,
          retry: true,
          continuous: true
        };

        this.db.sync(this.remoteDatabase, options);
    }
 
}