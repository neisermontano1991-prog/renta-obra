import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'panel', pathMatch: 'full' },
  { path: 'panel', loadComponent: () => import('./features/panel/panel.component').then(m => m.PanelComponent) },
  { path: 'facturas', loadComponent: () => import('./features/facturas/facturas.component').then(m => m.FacturasComponent) },
  { path: 'nueva-factura', loadComponent: () => import('./features/nueva-factura/nueva-factura.component').then(m => m.NuevaFacturaComponent) },
  { path: 'clientes', loadComponent: () => import('./features/clientes/clientes.component').then(m => m.ClientesComponent) },
  { path: 'herramientas', loadComponent: () => import('./features/herramientas/herramientas.component').then(m => m.HerramientasComponent) },
  { path: 'ajustes', loadComponent: () => import('./features/ajustes/ajustes.component').then(m => m.AjustesComponent) },
  { path: 'ios/nueva-factura', loadComponent: () => import('./features/ios-nueva-factura/ios-nueva-factura.component').then(m => m.IosNuevaFacturaComponent) },
  { path: 'ios/transferencia', loadComponent: () => import('./features/ios-transferencia/ios-transferencia.component').then(m => m.IosTransferenciaComponent) },
  { path: 'android/facturas', loadComponent: () => import('./features/android-facturas/android-facturas.component').then(m => m.AndroidFacturasComponent) },
  { path: '**', redirectTo: 'panel' }
];
