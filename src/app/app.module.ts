import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app.router';
import { effects, store, instrumentation } from './store';
import { SharedModule } from './shared/shared.module';
import { TabMenuModule } from 'primeng/primeng';
import { ClubscheduleModule } from './clubschedule/clubschedule.module'
import { WeatherService } from './weather/weather.service';
import { EventService } from './service/eventservice';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    SharedModule,
    FormsModule,
    HttpModule,
    store,
    effects,
    AppRoutingModule,
    instrumentation,
    ClubscheduleModule,
    TabMenuModule
  ],
  providers: [
    WeatherService, EventService
  ],
  bootstrap: [
    AppComponent
  ]
})
export class AppModule {}
