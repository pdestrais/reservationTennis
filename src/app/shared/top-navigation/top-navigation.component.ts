import { Component, OnInit, ChangeDetectionStrategy, ViewChild, ElementRef } from '@angular/core';
import {TabMenuModule,MenuItem} from 'primeng/primeng';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-ui-top-navigation',
  templateUrl: './top-navigation.component.html',
  styleUrls: ['./top-navigation.component.css']
})
export class TopNavigationComponent implements OnInit {

  @ViewChild('topnav') topnav: ElementRef;
  private items: MenuItem[];
  
  constructor() { }

  ngOnInit() {
    this.items = [
            {label: 'Gestion Membres', icon: 'fa-users', routerLink: ['/dashboard']},
            {label: 'Profile', icon: 'fa-user', routerLink: ['/profile']},
            {label: 'Schedule', icon: 'fa-calendar', routerLink: ['/schedule']}
        ];
  }

  toggle() {
    this.topnav.nativeElement.classList.toggle(['responsive']);
  }

}
