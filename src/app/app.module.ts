import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { IpcService } from './services/ipc.service';
import { DataService } from './services/data.service';
import { Zad1Component } from './pages/zad1/zad1.component';
import { Zad2Component } from './pages/zad2/zad2.component';
import { HomeComponent } from './pages/home/home.component';
import { Zad3Component } from './pages/zad3/zad3.component';

@NgModule({
  declarations: [
    AppComponent,

    HomeComponent,

    Zad1Component,
    Zad2Component,
    Zad3Component,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [
    IpcService,
    DataService
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
