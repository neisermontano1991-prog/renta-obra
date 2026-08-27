import { Component, computed, inject, signal, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DataService } from '../../core/services/data.service';
import { CurrencyFormatPipe } from '../../core/pipes/format.pipe';
import { InvoiceDocComponent } from '../../shared/components/invoice-doc/invoice-doc.component';
import { InvoiceItem, Client } from '../../core/models';

interface DraftLine {
  toolId: string | null;
  name: string;
  priceDay: number;
  days: number;
  quantity: number;
  delivered?: boolean;
}

@Component({
  selector: 'app-nueva-factura',
  standalone: true,
  imports: [CommonModule, FormsModule, CurrencyFormatPipe, InvoiceDocComponent],
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

  private pendingInvoiceItems: { items: InvoiceItem[]; clientId: string | null } | null = null;
  private pendingEditId: string | null = null;

  private _dataReadyEffect = effect(() => {
    const tools = this.tools();
    const invoices = this.data.invoices$();
    if (this.pendingEditId && invoices.length > 0) {
      const editId = this.pendingEditId;
      this.pendingEditId = null;
      const inv = invoices.find(i => i.id === editId);
      if (inv) {
        this.loadInvoice(editId);
      }
    }
    if (tools.length > 0 && this.pendingInvoiceItems) {
      const pending = this.pendingInvoiceItems;
      this.pendingInvoiceItems = null;
      const mappedLines = pending.items.map(i => {
        let toolId: string | null = i.toolId ?? null;
        if (!toolId || !tools.find(t => t.id === toolId)) {
          const match = tools.find(t => t.name === i.name);
          if (match) toolId = match.id ?? null;
        }
        return { toolId, name: i.name, priceDay: i.priceDay, days: i.days, quantity: i.quantity ?? 1, delivered: i.delivered };
      });
      this.lines.set(mappedLines);
      this.clientId.set(pending.clientId ?? null);
    }
  });

  editMode = signal(false);
  editInvoiceId = signal<string | null>(null);
  editInvoiceNum = signal('');

  date = signal(new Date().toISOString().slice(0, 10));
  due = signal('');
  method = signal('Transferencia');
  clientId = signal<string | null>(null);
  showNewClient = signal(false);
  ivaRate = signal(19);
  extraCharge = signal(0);
  extraDescription = signal('');
  notes = signal('');

  lines = signal<DraftLine[]>([]);

  newClient = signal({ name: '', nit: '', phone: '', email: '', addr: '' });

  base = computed(() =>
    this.lines().reduce((s, l) => s + l.priceDay * l.days * l.quantity, 0)
  );

  iva = computed(() => (this.base() * this.ivaRate()) / 100);

  total = computed(() => this.base() + this.extraCharge());

  draftItems = computed(() =>
    this.lines()
      .filter(l => l.toolId !== null)
      .map(l => ({ toolId: l.toolId!, name: l.name, priceDay: l.priceDay, days: l.days, quantity: l.quantity }))
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
    if (!inv) {
      this.pendingEditId = id;
      return;
    }

    this.pendingEditId = null;
    this.editMode.set(true);
    this.editInvoiceId.set(inv.id!);
    this.editInvoiceNum.set(inv.num);
    this.date.set(inv.date);
    this.due.set(inv.due);
    this.method.set(inv.method);
    this.notes.set(inv.notes || '');
    this.extraCharge.set(inv.extraCharge ?? 0);
    this.extraDescription.set(inv.extraDescription ?? '');

    if (this.tools().length > 0) {
      const mappedLines = inv.items.map(i => {
        let toolId: string | null = i.toolId ?? null;
        if (!toolId || !this.data.getToolById(toolId)) {
          const matchByName = this.tools().find(t => t.name === i.name);
          if (matchByName) toolId = matchByName.id ?? null;
        }
        return { toolId, name: i.name, priceDay: i.priceDay, days: i.days, quantity: i.quantity ?? 1, delivered: i.delivered };
      });
      this.lines.set(mappedLines);
      setTimeout(() => this.clientId.set(inv.clientId ?? null), 0);
    } else {
      this.pendingInvoiceItems = { items: inv.items, clientId: inv.clientId ?? null };
    }
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

  onToolSelect(toolId: string, index: number): void {
    const tool = this.tools().find(t => t.id === toolId);
    if (!tool) return;
    this.lines.update(ls =>
      ls.map((l, i) => (i === index ? { ...l, toolId: tool.id ?? null, name: tool.name, priceDay: tool.priceDay } : l))
    );
  }

  onDaysChange(event: Event, index: number): void {
    const days = Number((event.target as HTMLInputElement).value) || 1;
    this.lines.update(ls => ls.map((l, i) => (i === index ? { ...l, days } : l)));
  }

  onQuantityChange(event: Event, index: number): void {
    const quantity = Number((event.target as HTMLInputElement).value) || 1;
    this.lines.update(ls => ls.map((l, i) => (i === index ? { ...l, quantity } : l)));
  }

  addLine(): void {
    this.lines.update(ls => [...ls, { toolId: null, name: '', priceDay: 0, days: 1, quantity: 1 }]);
  }

  trackByIndex(index: number): number {
    return index;
  }

  removeLine(index: number): void {
    this.lines.update(ls => ls.filter((_, i) => i !== index));
  }

  async saveInvoice(): Promise<void> {
    if (!this.clientId() || this.lines().length === 0) return;
    const items: InvoiceItem[] = this.lines()
      .filter(l => l.toolId !== null)
      .map(l => ({ toolId: l.toolId!, name: l.name, priceDay: l.priceDay, days: l.days, quantity: l.quantity, delivered: l.delivered }));

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
        notes: this.notes(),
        extraCharge: this.extraCharge(),
        extraDescription: this.extraDescription(),
      });
    } else {
      await this.data.addInvoice({
        clientId: this.clientId()!,
        date: this.date(),
        due: this.due(),
        method: this.method(),
        status: 'pendiente',
        items,
        notes: this.notes(),
        extraCharge: this.extraCharge(),
        extraDescription: this.extraDescription(),
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

  onExtraChargeChange(event: Event): void {
    this.extraCharge.set(Number((event.target as HTMLInputElement).value) || 0);
  }
}
