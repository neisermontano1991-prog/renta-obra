import { Routes } from '@angular/router';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { DataService } from './core/services/data.service';

function authGuard(): boolean {
  const data = inject(DataService);
  const router = inject(Router);
  if (data.user$() || data.demoMode$()) return true;
  router.navigate(['/login']);
  return false;
}

export const routes: Routes = [
  { path: '', redirectTo: 'panel', pathMatch: 'full' },
  { path: 'login', loadComponent: () => import('./features/login/login.component').then(m => m.LoginComponent) },
  { path: 'panel', canActivate: [authGuard], loadComponent: () => import('./features/panel/panel.component').then(m => m.PanelComponent) },
  { path: 'facturas', canActivate: [authGuard], loadComponent: () => import('./features/facturas/facturas.component').then(m => m.FacturasComponent) },
  { path: 'nueva-factura', canActivate: [authGuard], loadComponent: () => import('./features/nueva-factura/nueva-factura.component').then(m => m.NuevaFacturaComponent) },
  { path: 'clientes', canActivate: [authGuard], loadComponent: () => import('./features/clientes/clientes.component').then(m => m.ClientesComponent) },
  { path: 'herramientas', canActivate: [authGuard], loadComponent: () => import('./features/herramientas/herramientas.component').then(m => m.HerramientasComponent) },
  { path: 'gastos', canActivate: [authGuard], loadComponent: () => import('./features/gastos/gastos.component').then(m => m.GastosComponent) },
  { path: 'ajustes', canActivate: [authGuard], loadComponent: () => import('./features/ajustes/ajustes.component').then(m => m.AjustesComponent) },
  { path: 'ios/nueva-factura', loadComponent: () => import('./features/ios-nueva-factura/ios-nueva-factura.component').then(m => m.IosNuevaFacturaComponent) },
  { path: 'ios/transferencia', loadComponent: () => import('./features/ios-transferencia/ios-transferencia.component').then(m => m.IosTransferenciaComponent) },
  { path: 'android/facturas', loadComponent: () => import('./features/android-facturas/android-facturas.component').then(m => m.AndroidFacturasComponent) },
  { path: '**', redirectTo: 'panel' }
];
