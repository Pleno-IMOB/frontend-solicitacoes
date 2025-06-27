import { Routes } from '@angular/router';
import { Home } from './pages/home/home';

export const routes: Routes = [
  { path: '', redirectTo: 'solicitar-vistoria', pathMatch: 'full' },
  { path: '*', redirectTo: 'solicitar-vistoria', pathMatch: 'full' },
  {
    path: 'solicitar-vistoria', children: [
      { path: '', component: Home }
    ]
  }
];
