import { Routes } from '@angular/router';
import { Home } from './pages/home/home';

export const routes: Routes = [
  { path: '*', redirectTo: 'home', pathMatch: 'full' },
  { path: '', component: Home },
  { path: 'agendamento', component: Home },
  { path: 'login', component: Home },
  { path: 'agendamento/login', component: Home },
  { path: 'meus-dados', component: Home },
  { path: 'agendamento/meus-dados', component: Home }
];