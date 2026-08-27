import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { NgClass } from '@angular/common';
import { DataService } from '../../../core/services/data.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, NgClass],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css'],
})
export class SidebarComponent {
  @Input() currentView = 'panel';
  @Output() viewChange = new EventEmitter<string>();

  private data = inject(DataService);
  private router = inject(Router);
  business = this.data.business$;
  user = this.data.user$;
  demoMode = this.data.demoMode$;

  get initials(): string {
    const name = this.user()?.name || this.business().adminName || this.business().name || '';
    return name.split(' ').map(w => w[0]).filter(Boolean).slice(0, 2).join('').toUpperCase();
  }

  get displayName(): string {
    const u = this.user();
    const b = this.business();
    return this.demoMode() ? 'Modo Demo' : (u?.name || b.adminName || b.name || '');
  }

  get displaySub(): string {
    return this.demoMode() ? 'Datos de ejemplo' : (this.user()?.email ? String(this.user()!.email) : 'Administrador');
  }

  logout(): void {
    this.data.logout();
    this.router.navigate(['/login']);
  }

  exitDemo(): void {
    this.data.exitDemo();
  }
}