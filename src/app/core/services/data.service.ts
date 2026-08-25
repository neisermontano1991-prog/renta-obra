import { Injectable, signal, computed } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Business, Client, Tool, Invoice, InvoiceItem } from '../models';
import { environment } from '../../../environments/environment';

const STORAGE_KEY = 'rentaobra-state-v1';

const DEFAULT_BUSINESS: Business = {
  name: 'RentaObra S.L.',
  nit: 'B-87000000',
  phone: '+34 600 000 000',
  addr: 'C/ Industria 42, 28037 Madrid',
  email: 'hola@rentaobra.es',
  rate: 21,
  prefix: 'FAC',
};

const DEFAULT_CLIENTS: Client[] = [
  { id: 'c1', name: 'Constructora Altamira S.L.', nit: 'B87654321', phone: '610 111 222', email: 'admin@altamira.es', addr: 'C/ Obra 8, 28045 Madrid' },
  { id: 'c2', name: 'Javier Ruiz García', nit: '50321547N', phone: '655 333 444', email: 'j.ruiz@gmail.com', addr: 'Av. de Europa 21, Getafe' },
  { id: 'c3', name: 'Ferretería El Tornillo', nit: 'B44556677', phone: '699 777 888', email: 'eltornillo@ferreteria.es', addr: 'Pol. Ind. La Laguna 3, Alcorcón' },
  { id: 'c4', name: 'Obras del Sur S.L.', nit: 'B99887766', phone: '688 999 000', email: 'cobros@obrasdelsur.es', addr: 'C/ Ronda 15, Móstoles' },
  { id: 'c5', name: 'Comunidad La Paz', nit: '51223344Q', phone: '633 555 666', email: 'presidencia@lapaz.es', addr: 'C/ Paz 3, Leganés' },
];

const DEFAULT_TOOLS: Tool[] = [
  { id: 't1', name: 'Martillo demoledor Hilti TE 3000', priceDay: 45, stock: 6 },
  { id: 't2', name: 'Taladro percutor Bosch GSB 21', priceDay: 18, stock: 12 },
  { id: 't3', name: 'Compactadora de placa Wacker', priceDay: 75, stock: 3 },
  { id: 't4', name: 'Andamio multifunción (juego)', priceDay: 32, stock: 8 },
  { id: 't5', name: 'Sierra circular Makita 5903R', priceDay: 22, stock: 9 },
  { id: 't6', name: 'Compresor de aire 50 l', priceDay: 40, stock: 4 },
  { id: 't7', name: 'Vibrador de concreto eléctrico', priceDay: 28, stock: 5 },
  { id: 't8', name: 'Amoladora angular DeWalt 125 mm', priceDay: 12, stock: 15 },
];

const DEFAULT_INVOICES: Invoice[] = [
  { id: 'inv1', num: 'FAC-2026-018', clientId: 'c1', date: '2026-07-28', due: '2026-08-11', method: 'Transferencia', status: 'pagada', items: [{ toolId: 't3', name: 'Compactadora de placa Wacker', priceDay: 75, days: 5 }, { toolId: 't5', name: 'Sierra circular Makita 5903R', priceDay: 22, days: 5 }] },
  { id: 'inv2', num: 'FAC-2026-019', clientId: 'c4', date: '2026-08-02', due: '2026-08-16', method: 'Crédito a 30 días', status: 'pendiente', items: [{ toolId: 't1', name: 'Martillo demoledor Hilti TE 3000', priceDay: 45, days: 3 }, { toolId: 't8', name: 'Amoladora angular DeWalt 125 mm', priceDay: 12, days: 3 }, { toolId: 't6', name: 'Compresor de aire 50 l', priceDay: 40, days: 4 }] },
  { id: 'inv3', num: 'FAC-2026-020', clientId: 'c2', date: '2026-08-05', due: '2026-08-19', method: 'Efectivo', status: 'pagada', items: [{ toolId: 't2', name: 'Taladro percutor Bosch GSB 21', priceDay: 18, days: 2 }] },
  { id: 'inv4', num: 'FAC-2026-021', clientId: 'c3', date: '2026-08-09', due: '2026-08-23', method: 'Transferencia', status: 'vencida', items: [{ toolId: 't7', name: 'Vibrador de concreto eléctrico', priceDay: 28, days: 6 }] },
  { id: 'inv5', num: 'FAC-2026-022', clientId: 'c1', date: '2026-08-12', due: '2026-08-26', method: 'Tarjeta', status: 'pendiente', items: [{ toolId: 't4', name: 'Andamio multifunción (juego)', priceDay: 32, days: 7 }] },
];

@Injectable({ providedIn: 'root' })
export class DataService {
  private supabase: SupabaseClient;
  private connected = signal(false);

  private business = signal<Business>(DEFAULT_BUSINESS);
  private clients = signal<Client[]>(DEFAULT_CLIENTS);
  private tools = signal<Tool[]>(DEFAULT_TOOLS);
  private invoices = signal<Invoice[]>(DEFAULT_INVOICES);
  private seq = signal<number>(23);

  readonly business$ = this.business.asReadonly();
  readonly clients$ = this.clients.asReadonly();
  readonly tools$ = this.tools.asReadonly();
  readonly invoices$ = this.invoices.asReadonly();
  readonly isConnected = this.connected.asReadonly();

  readonly invoicesCount = computed(() => this.invoices().length);
  readonly totalFacturado = computed(() =>
    this.invoices().reduce((sum, inv) => {
      if (inv.status === 'pagada') {
        return sum + inv.items.reduce((s, item) => s + item.priceDay * item.days, 0);
      }
      return sum;
    }, 0)
  );

  constructor() {
    this.supabase = createClient(environment.supabaseUrl, environment.supabaseAnonKey);
    this.init();
  }

  private async init(): Promise<void> {
    try {
      await this.loadFromSupabase();
      this.connected.set(true);
      console.log('[RentaObra] Conectado a Supabase ✓');
    } catch (err) {
      console.warn('[RentaObra] Supabase no disponible, usando datos locales', err);
      this.loadFromLocalStorage();
    }
  }

  private async loadFromSupabase(): Promise<void> {
    const [bizRes, cliRes, toolRes, invRes, seqRes] = await Promise.all([
      this.supabase.from('businesses').select('*').limit(1).maybeSingle(),
      this.supabase.from('clients').select('*'),
      this.supabase.from('tools').select('*'),
      this.supabase.from('invoices').select('*'),
      this.supabase.from('counters').select('seq').limit(1).maybeSingle(),
    ]);

    if (bizRes.error) throw bizRes.error;

    if (bizRes.data) {
      this.business.set({
        id: bizRes.data.id,
        name: bizRes.data.name,
        nit: bizRes.data.nif || '',
        phone: bizRes.data.phone || '',
        addr: bizRes.data.address || '',
        email: bizRes.data.email || '',
        rate: 21,
        prefix: 'FAC',
      });
    }

    if (cliRes.data) {
      this.clients.set(cliRes.data.map(c => ({
        id: c.id,
        name: c.name,
        nit: c.nit || '',
        phone: c.phone || '',
        email: c.email || '',
        addr: c.addr || '',
      })));
    }

    if (toolRes.data) {
      this.tools.set(toolRes.data.map(t => ({
        id: t.id,
        name: t.name,
        priceDay: t.price_day,
        stock: t.stock,
      })));
    }

    if (invRes.data) {
      const invoices: Invoice[] = [];
      for (const inv of invRes.data) {
        const itemsRes = await this.supabase
          .from('invoice_items')
          .select('*')
          .eq('invoice_id', inv.id);

        invoices.push({
          id: inv.id,
          num: inv.number,
          clientId: inv.client_id,
          date: inv.date,
          due: inv.due_date || '',
          method: inv.notes || '',
          status: inv.status,
          items: (itemsRes.data || []).map(i => ({
            toolId: i.tool_id,
            name: i.tool_name,
            priceDay: i.price_day,
            days: i.days,
          })),
        });
      }
      this.invoices.set(invoices);
    }

    if (seqRes.data) {
      this.seq.set(seqRes.data.seq + 1);
    }
  }

  private loadFromLocalStorage(): void {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const state = JSON.parse(raw);
        if (state.business) this.business.set(state.business);
        if (state.clients) this.clients.set(state.clients);
        if (state.tools) this.tools.set(state.tools);
        if (state.invoices) this.invoices.set(state.invoices);
        if (state.seq) this.seq.set(state.seq);
      }
    } catch {}
  }

  private saveToLocal(): void {
    const state = {
      business: this.business(),
      clients: this.clients(),
      tools: this.tools(),
      invoices: this.invoices(),
      seq: this.seq(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  private getBusinessId(): string | undefined {
    return this.business()?.id;
  }

  async addClient(c: Omit<Client, 'id'>): Promise<Client> {
    if (this.connected()) {
      const { data, error } = await this.supabase
        .from('clients')
        .insert({ name: c.name, nit: c.nit, phone: c.phone, email: c.email, addr: c.addr, business_id: this.getBusinessId() })
        .select()
        .single();
      if (data && !error) {
        const newClient: Client = { ...c, id: data.id };
        this.clients.update(list => [...list, newClient]);
        return newClient;
      }
      console.error('[RentaObra] Error addClient:', error);
    }
    const newClient: Client = { ...c, id: crypto.randomUUID() };
    this.clients.update(list => [...list, newClient]);
    this.saveToLocal();
    return newClient;
  }

  async updateClient(c: Client): Promise<void> {
    if (this.connected() && c.id) {
      await this.supabase
        .from('clients')
        .update({ name: c.name, nit: c.nit, phone: c.phone, email: c.email, addr: c.addr })
        .eq('id', c.id);
    }
    this.clients.update(list => list.map(cl => cl.id === c.id ? c : cl));
    this.saveToLocal();
  }

  async addTool(t: Omit<Tool, 'id'>): Promise<Tool> {
    if (this.connected()) {
      const { data, error } = await this.supabase
        .from('tools')
        .insert({ name: t.name, price_day: t.priceDay, stock: t.stock, business_id: this.getBusinessId() })
        .select()
        .single();
      if (data && !error) {
        const newTool: Tool = { ...t, id: data.id };
        this.tools.update(list => [...list, newTool]);
        return newTool;
      }
      console.error('[RentaObra] Error addTool:', error);
    }
    const newTool: Tool = { ...t, id: crypto.randomUUID() };
    this.tools.update(list => [...list, newTool]);
    this.saveToLocal();
    return newTool;
  }

  async updateTool(t: Tool): Promise<void> {
    if (this.connected() && t.id) {
      const { error } = await this.supabase
        .from('tools')
        .update({ name: t.name, price_day: t.priceDay, stock: t.stock })
        .eq('id', t.id);
      if (error) console.error('[RentaObra] Error updateTool:', error);
    }
    this.tools.update(list => list.map(tool => tool.id === t.id ? t : tool));
    this.saveToLocal();
  }

  async removeTool(id: string): Promise<void> {
    if (this.connected()) {
      await this.supabase.from('tools').delete().eq('id', id);
    }
    this.tools.update(list => list.filter(t => t.id !== id));
    this.saveToLocal();
  }

  async addInvoice(inv: Omit<Invoice, 'id' | 'num'>): Promise<Invoice> {
    const seqNum = this.seq();
    const num = `${this.business().prefix}-2026-${String(seqNum).padStart(3, '0')}`;

    if (this.connected()) {
      const { data, error } = await this.supabase
        .from('invoices')
        .insert({
          number: num,
          client_id: inv.clientId,
          date: inv.date,
          due_date: inv.due,
          status: inv.status,
          notes: inv.method,
          business_id: this.getBusinessId() || null,
        })
        .select()
        .single();

      if (error) {
        console.error('[RentaObra] Error insertando factura:', JSON.stringify({ message: error.message, details: error.details, hint: error.hint, code: error.code }));
        console.error('[RentaObra] Datos enviados:', JSON.stringify({
          number: num,
          client_id: inv.clientId,
          date: inv.date,
          due_date: inv.due,
          status: inv.status,
          notes: inv.method,
          business_id: this.getBusinessId() || null,
        }));
      }

      if (data && !error) {
        for (const item of inv.items) {
          const itemRes = await this.supabase.from('invoice_items').insert({
            invoice_id: data.id,
            tool_name: item.name,
            price_day: item.priceDay,
            days: item.days,
          });
          if (itemRes.error) {
            console.error('[RentaObra] Error insertando item:', itemRes.error.message);
          }
        }

        const newInvoice: Invoice = { ...inv, id: data.id, num };
        this.invoices.update(list => [...list, newInvoice]);
        this.seq.set(seqNum + 1);

        const counterRes = await this.supabase
          .from('counters')
          .update({ seq: seqNum + 1 })
          .eq('id', 'invoice-seq');
        if (counterRes.error) {
          console.error('[RentaObra] Error actualizando contador:', counterRes.error.message);
        }

        return newInvoice;
      }
    }

    console.warn('[RentaObra] Factura guardada localmente (Supabase no disponible)');
    const newInvoice: Invoice = { ...inv, id: crypto.randomUUID(), num };
    this.invoices.update(list => [...list, newInvoice]);
    this.seq.set(seqNum + 1);
    this.saveToLocal();
    return newInvoice;
  }

  async updateInvoice(inv: Invoice): Promise<void> {
    if (this.connected() && inv.id) {
      const { error } = await this.supabase
        .from('invoices')
        .update({
          client_id: inv.clientId,
          date: inv.date,
          due_date: inv.due,
          status: inv.status,
          notes: inv.method,
        })
        .eq('id', inv.id);

      if (!error) {
        await this.supabase.from('invoice_items').delete().eq('invoice_id', inv.id);
        for (const item of inv.items) {
          await this.supabase.from('invoice_items').insert({
            invoice_id: inv.id,
            tool_name: item.name,
            price_day: item.priceDay,
            days: item.days,
          });
        }
      } else {
        console.error('[RentaObra] Error updateInvoice:', error);
      }
    }
    this.invoices.update(list => list.map(i => i.id === inv.id ? inv : i));
    this.saveToLocal();
  }

  async deleteInvoice(id: string): Promise<void> {
    if (this.connected()) {
      await this.supabase.from('invoice_items').delete().eq('invoice_id', id);
      await this.supabase.from('invoices').delete().eq('id', id);
    }
    this.invoices.update(list => list.filter(i => i.id !== id));
    this.saveToLocal();
  }

  async toggleInvoiceStatus(id: string): Promise<void> {
    const inv = this.invoices().find(i => i.id === id);
    if (!inv) return;
    const newStatus = inv.status === 'pagada' ? 'pendiente' : 'pagada';

    if (this.connected()) {
      await this.supabase.from('invoices').update({ status: newStatus }).eq('id', id);
    }

    this.invoices.update(list =>
      list.map(i => i.id === id ? { ...i, status: newStatus } : i)
    );
    this.saveToLocal();
  }

  async updateBusiness(b: Partial<Business>): Promise<void> {
    this.business.update(current => ({ ...current, ...b }));

    if (this.connected() && this.business().id) {
      await this.supabase
        .from('businesses')
        .update({ name: b.name, nif: b.nit, phone: b.phone, address: b.addr, email: b.email })
        .eq('id', this.business().id);
    }
    this.saveToLocal();
  }

  getClientById(id: string): Client | undefined {
    return this.clients().find(c => c.id === id);
  }

  getToolById(id: string): Tool | undefined {
    return this.tools().find(t => t.id === id);
  }

  getInvoicesByClient(clientId: string): Invoice[] {
    return this.invoices().filter(inv => inv.clientId === clientId);
  }

  getActiveToolCount(toolId: string): number {
    return this.invoices()
      .filter(inv => inv.status === 'pendiente' || inv.status === 'vencida')
      .reduce((count, inv) => {
        const item = inv.items.find(i => i.toolId === toolId);
        return count + (item ? 1 : 0);
      }, 0);
  }
}
