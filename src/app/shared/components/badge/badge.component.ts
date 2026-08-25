import { Component, computed, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InvoiceStatus } from '../../../core/models';

@Component({
  selector: 'app-badge',
  standalone: true,
  imports: [CommonModule],
  template: `<span class="badge" [ngClass]="'badge-' + status()">{{ labelMap[status()] }}</span>`,
})
export class BadgeComponent {
  status = input.required<InvoiceStatus>();

  labelMap: Record<InvoiceStatus, string> = {
    pagada: 'Pagada',
    pendiente: 'Pendiente',
    vencida: 'Vencida',
  };
}
