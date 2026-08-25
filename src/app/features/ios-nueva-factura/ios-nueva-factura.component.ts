import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../core/services/data.service';
import { CurrencyFormatPipe } from '../../core/pipes/format.pipe';
import { InvoiceItem } from '../../core/models';

interface DraftLine {
  toolId: string | null;
  name: string;
  priceDay: number;
  days: number;
}

@Component({
  selector: 'app-ios-nueva-factura',
  standalone: true,
  imports: [CommonModule, FormsModule, CurrencyFormatPipe],
  templateUrl: './ios-nueva-factura.component.html',
  styleUrl: './ios-nueva-factura.component.css',
})
export class IosNuevaFacturaComponent {
  private data = inject(DataService);

  clients = this.data.clients$;
  tools = this.data.tools$;

  clientId = signal<string | null>(null);
  ivaRate = signal(21);
  lines = signal<DraftLine[]>([]);
  saved = signal(false);

  base = computed(() =>
    this.lines().reduce((s, l) => s + l.priceDay * l.days, 0)
  );

  iva = computed(() => (this.base() * this.ivaRate()) / 100);

  total = computed(() => this.base() + this.iva());

  onClientChange(event: Event): void {
    const val = (event.target as HTMLSelectElement).value;
    this.clientId.set(val || null);
  }

  onToolSelect(event: Event, index: number): void {
    const toolId = (event.target as HTMLSelectElement).value;
    const tool = this.data.getToolById(toolId);
    if (!tool) return;
    this.lines.update(ls =>
      ls.map((l, i) =>
        i === index ? { ...l, toolId: tool.id ?? null, name: tool.name, priceDay: tool.priceDay } : l
      )
    );
  }

  incrementDays(index: number): void {
    this.lines.update(ls =>
      ls.map((l, i) => (i === index ? { ...l, days: l.days + 1 } : l))
    );
  }

  decrementDays(index: number): void {
    this.lines.update(ls =>
      ls.map((l, i) => (i === index ? { ...l, days: Math.max(1, l.days - 1) } : l))
    );
  }

  addLine(): void {
    this.lines.update(ls => [...ls, { toolId: null, name: '', priceDay: 0, days: 1 }]);
  }

  removeLine(index: number): void {
    this.lines.update(ls => ls.filter((_, i) => i !== index));
  }

  lineTotal(line: DraftLine): number {
    return line.priceDay * line.days;
  }

  async saveInvoice(): Promise<void> {
    if (!this.clientId() || this.lines().length === 0) return;
    const items: InvoiceItem[] = this.lines()
      .filter(l => l.toolId !== null)
      .map(l => ({ toolId: l.toolId!, name: l.name, priceDay: l.priceDay, days: l.days }));
    const now = new Date();
    const date = now.toISOString().slice(0, 10);
    const due = new Date(now.getTime() + 14 * 86400000).toISOString().slice(0, 10);
    await this.data.addInvoice({
      clientId: this.clientId()!,
      date,
      due,
      method: 'Transferencia',
      status: 'pendiente',
      items,
    });
    this.saved.set(true);
    setTimeout(() => this.saved.set(false), 2200);
  }

  goBack(): void {
    window.history.back();
  }
}
