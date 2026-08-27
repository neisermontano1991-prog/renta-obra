import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { DataService } from '../../core/services/data.service';
import { CurrencyFormatPipe, DateFormatPipe } from '../../core/pipes/format.pipe';
import { BadgeComponent } from '../../shared/components/badge/badge.component';
import { Invoice } from '../../core/models';

@Component({
  selector: 'app-facturas',
  standalone: true,
  imports: [CommonModule, CurrencyFormatPipe, DateFormatPipe, BadgeComponent],
  templateUrl: './facturas.component.html',
  styleUrl: './facturas.component.css',
})
export class FacturasComponent {
  private data = inject(DataService);
  private router = inject(Router);

  activeFilter = signal<'todas' | 'pagada' | 'pendiente' | 'vencida'>('todas');
  searchQuery = signal('');
  expandedInvoice = signal<string | null>(null);

  private invoices = this.data.invoices$;

  invoiceCount = computed(() => this.invoices().length);

  filteredInvoices = computed(() => {
    const filter = this.activeFilter();
    const query = this.searchQuery().toLowerCase().trim();
    let list = this.invoices();

    if (filter !== 'todas') {
      list = list.filter(inv => inv.status === filter);
    }

    if (query) {
      list = list.filter(inv => {
        const client = this.data.getClientById(inv.clientId ?? '');
        return (
          inv.num.toLowerCase().includes(query) ||
          (client?.name.toLowerCase().includes(query) ?? false) ||
          inv.date.includes(query)
        );
      });
    }

    return list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  });

  setFilter(f: 'todas' | 'pagada' | 'pendiente' | 'vencida'): void {
    this.activeFilter.set(f);
  }

  onSearch(event: Event): void {
    this.searchQuery.set((event.target as HTMLInputElement).value);
  }

  toggleStatus(id: string): void {
    this.data.toggleInvoiceStatus(id);
  }

  toggleExpanded(id: string): void {
    this.expandedInvoice.update(current => current === id ? null : id);
  }

  toggleItemDelivered(invoiceId: string, itemIndex: number): void {
    this.data.toggleItemDelivered(invoiceId, itemIndex);
  }

  openInvoice(inv: Invoice): void {
    this.router.navigate(['/nueva-factura'], { queryParams: { id: inv.id } });
  }

  total(inv: Invoice): number {
    return inv.items.reduce((s, i) => s + i.priceDay * i.days * (i.quantity || 1), 0) + (inv.extraCharge ?? 0);
  }

  clientName(clientId: string): string {
    return this.data.getClientById(clientId)?.name ?? '—';
  }
}
