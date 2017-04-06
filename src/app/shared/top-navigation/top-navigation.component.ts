import { Component, OnInit, ChangeDetectionStrategy, ViewChild, ElementRef } from '@angular/core';
import { MenuItem } from 'primeng/primeng';

import { Router } from '@angular/router';

@Component({
  changeDetection: ChangeDetectionStrategy.Default,
  selector: 'app-ui-top-navigation',
  templateUrl: './top-navigation.component.html',
  styleUrls: ['./top-navigation.component.css']
})
export class TopNavigationComponent implements OnInit {

  @ViewChild('topnav') topnav: ElementRef;
  private items: MenuItem[];
  private loggedInUser: string = '';
  
  constructor(private router: Router) { }

  ngOnInit() {
    this.loggedInUser = JSON.parse(localStorage.getItem('currentUser'));
  }

  ngDoCheck() {
      // Custom change detection
      this.loggedInUser = JSON.parse(localStorage.getItem('currentUser'));
    }

  toggle() {
    this.topnav.nativeElement.classList.toggle(['responsive']);
  }

    logout() {
        localStorage.removeItem('currentUser');
        this.loggedInUser = null;
        this.router.navigate(['/login']);
    }
    

}
