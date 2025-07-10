import { Routes } from '@angular/router';
import { Home } from './pages/home/home';

export const routes: Routes = [
  { path: '*', redirectTo: 'home', pathMatch: 'full' },
  { path: '', component: Home },
  { path: 'login', component: Home }
];
