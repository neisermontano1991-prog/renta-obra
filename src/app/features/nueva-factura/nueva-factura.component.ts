import { Component, computed, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DataService } from '../../core/services/data.service';
import { CurrencyFormatPipe, DateFormatPipe } from '../../core/pipes/format.pipe';
import { InvoiceDocComponent } from '../../shared/components/invoice-doc/invoice-doc.component';
import { InvoiceItem, Client } from '../../core/models';

interface DraftLine {
  toolId: string | null;
  name: string;
  priceDay: number;
  days: number;
}

@Component({
  selector: 'app-nueva-factura',
  standalone: true,
  imports: [CommonModule, FormsModule, CurrencyFormatPipe, DateFormatPipe, InvoiceDocComponent],
  templateUrl: './nueva-factura.component.html',
  styleUrls: ['./nueva-factura.component.css'],
})
export class NuevaFacturaComponent implements OnInit {
  private data = inject(DataService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  clients = this.data.clients$;
  tools = this.data.tools$;
  business = this.data.business$;

  editMode = signal(false);
  editInvoiceId = signal<string | null>(null);
  editInvoiceNum = signal('');

  date = signal(new Date().toISOString().slice(0, 10));
  due = signal('');
  method = signal('Transferencia');
  clientId = signal<string | null>(null);
  showNewClient = signal(false);
  ivaRate = signal(21);

  lines = signal<DraftLine[]>([]);

  newClient = signal({ name: '', nit: '', phone: '', email: '', addr: '' });

  base = computed(() =>
    this.lines().reduce((s, l) => s + l.priceDay * l.days, 0)
  );

  iva = computed(() => (this.base() * this.ivaRate()) / 100);

  total = computed(() => this.base() + this.iva());

  draftItems = computed(() =>
    this.lines()
      .filter(l => l.toolId !== null)
      .map(l => ({ toolId: l.toolId!, name: l.name, priceDay: l.priceDay, days: l.days }))
  );

  selectedClient = computed(() => {
    const id = this.clientId();
    return id ? (this.data.getClientById(id) ?? null) : null;
  });

  methods = ['Transferencia', 'Efectivo', 'Tarjeta', 'Crédito a 30 días', 'Cheque'];

  toolOptions = computed(() => this.tools());

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['id']) {
        this.loadInvoice(params['id']);
      }
    });
  }

  private loadInvoice(id: string): void {
    const invoices = this.data.invoices$();
    const inv = invoices.find(i => i.id === id);
    if (!inv) return;

    this.editMode.set(true);
    this.editInvoiceId.set(inv.id!);
    this.editInvoiceNum.set(inv.num);
    this.date.set(inv.date);
    this.due.set(inv.due);
    this.method.set(inv.method);
    this.clientId.set(inv.clientId ?? null);
    this.lines.set(inv.items.map(i => ({
      toolId: i.toolId ?? null,
      name: i.name,
      priceDay: i.priceDay,
      days: i.days,
    })));
  }

  updateNewClientField(field: string, event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.newClient.update(c => ({ ...c, [field]: value }));
  }

  toggleNewClient(): void {
    this.showNewClient.update(v => !v);
  }

  async saveNewClient(): Promise<void> {
    const c = this.newClient();
    if (!c.name) return;
    const saved = await this.data.addClient(c);
    this.clientId.set(saved.id!);
    this.showNewClient.set(false);
    this.newClient.set({ name: '', nit: '', phone: '', email: '', addr: '' });
  }

  onClientChange(event: Event): void {
    const val = (event.target as HTMLSelectElement).value;
    this.clientId.set(val || null);
  }

  onToolSelect(event: Event, index: number): void {
    const toolId = (event.target as HTMLSelectElement).value;
    const tool = this.data.getToolById(toolId);
    if (!tool) return;
    this.lines.update(ls =>
      ls.map((l, i) => (i === index ? { ...l, toolId: tool.id ?? null, name: tool.name, priceDay: tool.priceDay } : l))
    );
  }

  onDaysChange(event: Event, index: number): void {
    const days = Number((event.target as HTMLInputElement).value) || 1;
    this.lines.update(ls => ls.map((l, i) => (i === index ? { ...l, days } : l)));
  }

  addLine(): void {
    this.lines.update(ls => [...ls, { toolId: null, name: '', priceDay: 0, days: 1 }]);
  }

  removeLine(index: number): void {
    this.lines.update(ls => ls.filter((_, i) => i !== index));
  }

  async saveInvoice(): Promise<void> {
    if (!this.clientId() || this.lines().length === 0) return;
    const items: InvoiceItem[] = this.lines()
      .filter(l => l.toolId !== null)
      .map(l => ({ toolId: l.toolId!, name: l.name, priceDay: l.priceDay, days: l.days }));

    if (this.editMode() && this.editInvoiceId()) {
      const existingInv = this.data.invoices$().find(i => i.id === this.editInvoiceId());
      await this.data.updateInvoice({
        id: this.editInvoiceId()!,
        num: existingInv?.num ?? '',
        clientId: this.clientId()!,
        date: this.date(),
        due: this.due(),
        method: this.method(),
        status: existingInv?.status ?? 'pendiente',
        items,
      });
    } else {
      await this.data.addInvoice({
        clientId: this.clientId()!,
        date: this.date(),
        due: this.due(),
        method: this.method(),
        status: 'pendiente',
        items,
      });
    }
    this.router.navigate(['/facturas']);
  }

  printInvoice(): void {
    window.print();
  }

  onIvaChange(event: Event): void {
    this.ivaRate.set(Number((event.target as HTMLInputElement).value) || 0);
  }
}
