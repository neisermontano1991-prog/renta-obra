import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { DataService } from '../../core/services/data.service';
import { CurrencyFormatPipe } from '../../core/pipes/format.pipe';
import { BadgeComponent } from '../../shared/components/badge/badge.component';
import { Invoice } from '../../core/models';

@Component({
  selector: 'app-panel',
  standalone: true,
  imports: [CommonModule, RouterLink, CurrencyFormatPipe, BadgeComponent],
  templateUrl: './panel.component.html',
  styleUrl: './panel.component.css',
})
export class PanelComponent {
  private data = inject(DataService);

  today = new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' });

  private invoices = this.data.invoices$;
  private clients = this.data.clients$;
  private tools = this.data.tools$;
  private expenses = this.data.expenses$;

  selectedMonth = signal<{ month: number; year: number }>({
    month: new Date().getMonth(),
    year: new Date().getFullYear(),
  });

  gastosDelMes = computed(() => {
    const { month, year } = this.selectedMonth();
    return this.expenses()
      .filter(e => {
        const d = new Date(e.date + 'T00:00:00');
        return d.getMonth() === month && d.getFullYear() === year;
      })
      .reduce((sum, e) => sum + e.amount, 0);
  });

  ingresosDelMes = computed(() => {
    const { month, year } = this.selectedMonth();
    const base = this.invoices()
      .filter(inv => {
        if (inv.status !== 'pagada') return false;
        const d = new Date(inv.date + 'T00:00:00');
        return d.getMonth() === month && d.getFullYear() === year;
      })
      .reduce((sum, inv) => sum + inv.items.reduce((s, i) => s + i.priceDay * i.days * (i.quantity || 1), 0), 0);
    return base - this.gastosDelMes();
  });

  pendienteData = computed(() => {
    const pending = this.invoices().filter(
      inv => inv.status === 'pendiente' || inv.status === 'vencida'
    );
    const total = pending.reduce(
      (sum, inv) => sum + inv.items.reduce((s, i) => s + i.priceDay * i.days * (i.quantity || 1), 0),
      0
    );
    return { total, count: pending.length };
  });

  facturasMes = computed(() => {
    const { month, year } = this.selectedMonth();
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
    const months: { label: string; amount: number; month: number; year: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const m = d.getMonth();
      const y = d.getFullYear();
      const gastos = this.expenses()
        .filter(e => {
          const ed = new Date(e.date + 'T00:00:00');
          return ed.getMonth() === m && ed.getFullYear() === y;
        })
        .reduce((sum, e) => sum + e.amount, 0);
      const amount = this.invoices()
        .filter(inv => {
          const invDate = new Date(inv.date + 'T00:00:00');
          return invDate.getMonth() === m && invDate.getFullYear() === y && inv.status === 'pagada';
        })
        .reduce((sum, inv) => sum + inv.items.reduce((s, i) => s + i.priceDay * i.days * (i.quantity || 1), 0), 0) - gastos;
      months.push({ label: monthNames[m], amount: Math.max(amount, 0), month: m, year: y });
    }
    return months;
  });

  chartMax = computed(() => Math.max(...this.chartMonths().map(m => m.amount), 1));

  selectedMonthLabel = computed(() => {
    const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    const { month, year } = this.selectedMonth();
    return `${monthNames[month]} ${year}`;
  });

  recentInvoices = computed(() => {
    const { month, year } = this.selectedMonth();
    return this.invoices()
      .filter(inv => {
        const d = new Date(inv.date + 'T00:00:00');
        return d.getMonth() === month && d.getFullYear() === year;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .map(inv => ({
        ...inv,
        clientName: this.data.getClientById(inv.clientId ?? '')?.name ?? '—',
      }));
  });

  selectMonth(month: number, year: number): void {
    this.selectedMonth.set({ month, year });
  }

  invoiceTotal(inv: Invoice): number {
    return inv.items.reduce((s, i) => s + i.priceDay * i.days * (i.quantity || 1), 0);
  }
}
