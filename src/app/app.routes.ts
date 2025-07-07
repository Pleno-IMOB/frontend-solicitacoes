import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import {MinhaConta} from './pages/minha-conta/minha-conta/minha-conta';

export const routes: Routes = [
  { path: '*', redirectTo: 'home', pathMatch: 'full' },
  { path: '', component: Home },
  { path: 'login', component: Home },
  { path: 'minha-conta', component: MinhaConta }
];
