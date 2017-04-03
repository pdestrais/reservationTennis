import { Component, OnInit, ChangeDetectionStrategy, ViewChild, ElementRef } from '@angular/core';
import { MenuItem } from 'primeng/primeng';

import { Router } from '@angular/router';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-ui-top-navigation',
  templateUrl: './top-navigation.component.html',
  styleUrls: ['./top-navigation.component.css']
})
export class TopNavigationComponent implements OnInit {

  @ViewChild('topnav') topnav: ElementRef;
  private items: MenuItem[];
  private loggedInUser: string = JSON.parse(localStorage.getItem('currentUser'));
  
  constructor(private router: Router) { }

  ngOnInit() {
    this.items = [
            {label: 'Gestion Membres', icon: 'fa-users', routerLink: ['/dashboard']},
            {label: 'Profile', icon: 'fa-user', routerLink: ['/profile']},
            {label: 'Planning Réservations', icon: 'fa-calendar', routerLink: ['/schedule']}
        ];
  }

  toggle() {
    this.topnav.nativeElement.classList.toggle(['responsive']);
  }

    logout() {
        localStorage.removeItem('currentUser');
        this.router.navigate(['/login']);
    }
    

}
