import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { Zad1Component } from './pages/zad1/zad1.component';
import { Zad2Component } from './pages/zad2/zad2.component';
import { HomeComponent } from './pages/home/home.component';
import { Zad3Component } from './pages/zad3/zad3.component';

const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
  },
  {
    path: 'zad1',
    component: Zad1Component
  },
  {
    path: 'zad2',
    component: Zad2Component
  },
  {
    path: 'zad3',
    component: Zad3Component
  },
  {
    path: '*',
    redirectTo: ''
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
