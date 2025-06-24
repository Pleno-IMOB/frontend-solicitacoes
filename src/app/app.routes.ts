import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { SolicitarVistoria } from './pages/solicitar-vistoria/solicitar-vistoria';

export const routes: Routes = [
  { path: '*', redirectTo: 'home', pathMatch: 'full' },
  { path: '', component: Home },
  { path: 'login', component: Home },
  { path: 'minha-conta', component: SolicitarVistoria }
];
