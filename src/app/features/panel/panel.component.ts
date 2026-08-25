import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { DataService } from '../../core/services/data.service';
import { CurrencyFormatPipe, DateFormatPipe } from '../../core/pipes/format.pipe';
import { BadgeComponent } from '../../shared/components/badge/badge.component';
import { Invoice } from '../../core/models';

@Component({
  selector: 'app-panel',
  standalone: true,
  imports: [CommonModule, RouterLink, CurrencyFormatPipe, DateFormatPipe, BadgeComponent],
  templateUrl: './panel.component.html',
  styleUrl: './panel.component.css',
})
export class PanelComponent {
  private data = inject(DataService);

  today = new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' });

  private invoices = this.data.invoices$;
  private clients = this.data.clients$;
  private tools = this.data.tools$;

  ingresosDelMes = computed(() => {
    const now = new Date();
    const month = now.getMonth();
    const year = now.getFullYear();
    return this.invoices()
      .filter(inv => {
        if (inv.status !== 'pagada') return false;
        const d = new Date(inv.date + 'T00:00:00');
        return d.getMonth() === month && d.getFullYear() === year;
      })
      .reduce((sum, inv) => sum + inv.items.reduce((s, i) => s + i.priceDay * i.days, 0), 0);
  });

  pendienteData = computed(() => {
    const pending = this.invoices().filter(
      inv => inv.status === 'pendiente' || inv.status === 'vencida'
    );
    const total = pending.reduce(
      (sum, inv) => sum + inv.items.reduce((s, i) => s + i.priceDay * i.days, 0),
      0
    );
    return { total, count: pending.length };
  });

  facturasMes = computed(() => {
    const now = new Date();
    const month = now.getMonth();
    const year = now.getFullYear();
    return this.invoices().filter(inv => {
      const d = new Date(inv.date + 'T00:00:00');
      return d.getMonth() === month && d.getFullYear() === year;
    }).length;
  });

  herramientasAlquiler = computed(() => {
    const activeItems = new Set<string>();
    this.invoices()
      .filter(inv => inv.status === 'pendiente' || inv.status === 'vencida')
      .forEach(inv => inv.items.forEach(i => activeItems.add(i.toolId!)));
    return activeItems.size;
  });

  chartMonths = computed(() => {
    const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const now = new Date();
    const months: { label: string; amount: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const m = d.getMonth();
      const y = d.getFullYear();
      const amount = this.invoices()
        .filter(inv => {
          const invDate = new Date(inv.date + 'T00:00:00');
          return invDate.getMonth() === m && invDate.getFullYear() === y && inv.status === 'pagada';
        })
        .reduce((sum, inv) => sum + inv.items.reduce((s, i) => s + i.priceDay * i.days, 0), 0);
      months.push({ label: monthNames[m], amount });
    }
    return months;
  });

  chartMax = computed(() => Math.max(...this.chartMonths().map(m => m.amount), 1));

  recentInvoices = computed(() => {
    const sorted = [...this.invoices()].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    return sorted.slice(0, 5).map(inv => ({
      ...inv,
      clientName: this.data.getClientById(inv.clientId ?? '')?.name ?? '—',
    }));
  });

  invoiceTotal(inv: Invoice): number {
    return inv.items.reduce((s, i) => s + i.priceDay * i.days, 0);
  }
}
