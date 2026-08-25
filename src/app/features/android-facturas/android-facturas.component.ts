import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService } from '../../core/services/data.service';
import { CurrencyFormatPipe, DateFormatPipe } from '../../core/pipes/format.pipe';

@Component({
  selector: 'app-android-facturas',
  standalone: true,
  imports: [CommonModule, CurrencyFormatPipe, DateFormatPipe],
  templateUrl: './android-facturas.component.html',
  styleUrl: './android-facturas.component.css',
})
export class AndroidFacturasComponent {
  private data = inject(DataService);

  private invoices = this.data.invoices$;
  activeFilter = signal<'todas' | 'pagada' | 'pendiente' | 'vencida'>('todas');

  filteredInvoices = computed(() => {
    const filter = this.activeFilter();
    let list = this.invoices();
    if (filter !== 'todas') {
      list = list.filter(inv => inv.status === filter);
    }
    return list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  });

  setFilter(f: 'todas' | 'pagada' | 'pendiente' | 'vencida'): void {
    this.activeFilter.set(f);
  }

  invoiceTotal(inv: { items: { priceDay: number; days: number }[] }): number {
    return inv.items.reduce((s, i) => s + i.priceDay * i.days, 0);
  }

  clientName(clientId: string): string {
    return this.data.getClientById(clientId)?.name ?? '—';
  }

  statusLabel(status: string): string {
    switch (status) {
      case 'pagada': return 'Pagada';
      case 'pendiente': return 'Pendiente';
      case 'vencida': return 'Vencida';
      default: return status;
    }
  }

  goBack(): void {
    window.history.back();
  }
}
