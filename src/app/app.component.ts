import { Component, inject, signal } from '@angular/core';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { SidebarComponent } from './shared/components/sidebar/sidebar.component';
import { ToastComponent } from './shared/components/toast/toast.component';
import { filter, map } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent, ToastComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  private router = inject(Router);
  
  isMobileView = signal(false);
  
  currentUrl = toSignal(
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd),
      map((e: any) => e.urlAfterRedirects || e.url)
    ),
    { initialValue: this.router.url }
  );
  
  get showSidebar(): boolean {
    const url = this.currentUrl();
    return !url.startsWith('/ios/') && !url.startsWith('/android/');
  }
  
  get currentView(): string {
    const url = this.currentUrl();
    if (url.includes('panel')) return 'panel';
    if (url.includes('facturas') && !url.includes('android')) return 'facturas';
    if (url.includes('nueva-factura') && !url.includes('ios')) return 'nueva-factura';
    if (url.includes('clientes')) return 'clientes';
    if (url.includes('herramientas')) return 'herramientas';
    if (url.includes('ajustes')) return 'ajustes';
    return 'panel';
  }
  
  navigateTo(view: string) {
    this.router.navigate(['/' + view]);
  }
}
