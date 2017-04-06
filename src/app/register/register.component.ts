﻿import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { AlertService } from '../service/alert.service';
import { UserService } from '../service/user.service';

@Component({
    moduleId: module.id.toString(),
    templateUrl: 'register.component.html'
})

export class RegisterComponent {
    model: any = {};
    loading = false;

    constructor(
        private router: Router,
        private userService: UserService,
        private alertService: AlertService) { }

    register() {
        this.loading = true;
        this.userService.create(this.model)
            .subscribe(
                data => {
                    this.alertService.success('Création réussie', true);
                    this.router.navigate(['/members']);
                },
                error => {
                    this.alertService.error(error);
                    this.loading = false;
                });
    }
}
