import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService } from '../../core/services/data.service';
import { CurrencyFormatPipe } from '../../core/pipes/format.pipe';

@Component({
  selector: 'app-clientes',
  standalone: true,
  imports: [CommonModule, CurrencyFormatPipe],
  templateUrl: './clientes.component.html',
  styleUrls: ['./clientes.component.css'],
})
export class ClientesComponent {
  private data = inject(DataService);

  clients = this.data.clients$;
  invoices = this.data.invoices$;

  showForm = signal(false);

  newClient = signal({ name: '', nit: '', phone: '', email: '', addr: '' });

  clientCount = computed(() => this.clients().length);

  clientData = computed(() =>
    this.clients().map(c => {
      const clientInvoices = this.data.getInvoicesByClient(c.id ?? '');
      const pending = clientInvoices.filter(
        inv => inv.status === 'pendiente' || inv.status === 'vencida'
      );
      const totalAmount = clientInvoices.reduce(
        (sum, inv) => sum + inv.items.reduce((s, i) => s + i.priceDay * i.days, 0),
        0
      );
      const pendingAmount = pending.reduce(
        (sum, inv) => sum + inv.items.reduce((s, i) => s + i.priceDay * i.days, 0),
        0
      );
      return {
        ...c,
        invoiceCount: clientInvoices.length,
        pendingCount: pending.length,
        totalAmount,
        pendingAmount,
      };
    })
  );

  initials(name: string): string {
    return name
      .split(/\s+/)
      .slice(0, 2)
      .map(w => w.charAt(0).toUpperCase())
      .join('');
  }

  toggleForm(): void {
    this.showForm.update(v => !v);
  }

  updateField(field: string, event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.newClient.update(c => ({ ...c, [field]: value }));
  }

  saveClient(): void {
    const c = this.newClient();
    if (!c.name) return;
    this.data.addClient(c);
    this.newClient.set({ name: '', nit: '', phone: '', email: '', addr: '' });
    this.showForm.set(false);
  }

  async removeClient(id: string): Promise<void> {
    if (confirm('¿Eliminar este cliente?')) {
      await this.data.removeClient(id);
    }
  }
}
