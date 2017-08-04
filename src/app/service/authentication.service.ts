import { Injectable } from '@angular/core';
import { Http, Headers, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

@Injectable()
export class AuthenticationService {
    constructor(private http: Http) { }

    login(username: string, password: string) {
        return this.http.post('/api/users/login', { username: username, password: password })
            .map((response: Response) => {
                // login successful if there's a jwt token in the response
                let user = response.json();
                //if username or password is not correct, a message is returned by the server
                if (user.message) {
                    switch (user.message) {
                        case 'Wrong password' : throw new Error('Mot de passe incorrect');
                        case 'Username not found' : throw new Error("Nom d'utilisateur incorrect");
                    }
                } else if (user && user.token) {
                    // store user details and jwt token in local storage to keep user logged in between page refreshes
                    localStorage.setItem('currentUser', JSON.stringify(user));
                }
            })
            .catch((error:any) => Observable.throw(error.message  || error.json().error || 'Server error'));
    }

    logout() {
        // remove user from local storage to log user out
        localStorage.removeItem('currentUser');
    }
}
