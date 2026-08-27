import { Injectable, signal, computed } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Business, Client, Tool, Invoice, InvoiceItem, Expense, SessionUser } from '../models';
import { environment } from '../../../environments/environment';

const STORAGE_KEY = 'rentaobra-state-v1';
const SESSION_KEY = 'rentaobra-session';

const DEFAULT_BUSINESS: Business = {
  name: 'RentaObra S.L.',
  nit: 'B-87000000',
  phone: '+34 600 000 000',
  addr: 'C/ Industria 42, 28037 Madrid',
  email: 'hola@rentaobra.es',
  rate: 19,
  prefix: 'FAC',
  logoUrl: '',
  adminName: '',
  paymentAccount: '',
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
  private expenses = signal<Expense[]>([]);
  private seq = signal<number>(23);
  private user = signal<SessionUser | null>(null);
  private demo = signal(false);

  readonly business$ = this.business.asReadonly();
  readonly clients$ = this.clients.asReadonly();
  readonly tools$ = this.tools.asReadonly();
  readonly expenses$ = this.expenses.asReadonly();
  readonly isConnected = this.connected.asReadonly();
  readonly user$ = this.user.asReadonly();
  readonly demoMode$ = this.demo.asReadonly();

  readonly invoices$ = computed(() => {
    const all = this.invoices();
    if (this.demo()) return all;
    const u = this.user()?.email;
    if (!u) return all;
    return all.filter(inv => !inv.createdBy || inv.createdBy.toLowerCase() === u.toLowerCase());
  });

  readonly invoicesCount = computed(() => this.invoices().length);
  readonly totalGastado = computed(() =>
    this.expenses().reduce((sum, e) => sum + e.amount, 0)
  );
  readonly totalFacturado = computed(() =>
    this.invoices().reduce((sum, inv) => {
      if (inv.status === 'pagada') {
        return sum + this.getInvoiceTotal(inv);
      }
      return sum;
    }, 0)
  );

  constructor() {
    this.supabase = createClient(environment.supabaseUrl, environment.supabaseAnonKey);
    this.init();
  }

  private async init(): Promise<void> {
    this.restoreSession();
    try {
      await this.loadFromSupabase();
      this.connected.set(true);
      console.log('[RentaObra] Conectado a Supabase ✓');
    } catch (err) {
      console.warn('[RentaObra] Supabase no disponible, usando datos locales', err);
      this.loadFromLocalStorage();
    }
  }

  private restoreSession(): void {
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      if (raw) {
        const u = JSON.parse(raw);
        if (u?.email) this.user.set(u);
      }
    } catch {}
  }

  async login(email: string, password: string): Promise<{ ok: boolean; error?: string }> {
    try {
      const { data, error } = await this.supabase.auth.signInWithPassword({ email, password });
      if (error || !data.user) {
        const signUp = await this.supabase.auth.signUp({ email, password });
        if (signUp.error || !signUp.data.user) return { ok: false, error: signUp.error?.message || error?.message };
        const u: SessionUser = { id: signUp.data.user.id, email, name: email.split('@')[0] };
        this.user.set(u);
        localStorage.setItem(SESSION_KEY, JSON.stringify(u));
        return { ok: true };
      }
      const u: SessionUser = { id: data.user.id, email, name: email.split('@')[0] };
      this.user.set(u);
      localStorage.setItem(SESSION_KEY, JSON.stringify(u));
      return { ok: true };
    } catch (err: any) {
      return { ok: false, error: err?.message || 'Error de conexión' };
    }
  }

  logout(): void {
    this.supabase.auth.signOut();
    this.user.set(null);
    localStorage.removeItem(SESSION_KEY);
  }

  enterDemo(): void {
    this.demo.set(true);
    this.business.set(DEFAULT_BUSINESS);
    this.clients.set(DEFAULT_CLIENTS);
    this.tools.set(DEFAULT_TOOLS);
    this.invoices.set(DEFAULT_INVOICES);
    this.expenses.set([]);
  }

  exitDemo(): void {
    this.demo.set(false);
    localStorage.setItem('rentaobra-noinit', 'false');
    this.init();
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
        rate: bizRes.data.iva_rate || 19,
        prefix: bizRes.data.prefix || 'FAC',
        logoUrl: bizRes.data.logo_url || '',
        adminName: bizRes.data.admin_name || '',
        paymentAccount: bizRes.data.payment_account || '',
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

        let payments: Invoice['payments'] = [];
        if (Array.isArray(inv.payments)) {
          payments = inv.payments.map((p: any) => ({ date: p.date, amount: p.amount }));
        }

        invoices.push({
          id: inv.id,
          num: inv.number,
          clientId: inv.client_id,
          date: inv.date,
          due: inv.due_date || '',
          method: inv.notes || '',
          status: inv.status,
          notes: inv.invoice_notes || '',
          extraCharge: inv.extra_charge || 0,
          extraDescription: inv.extra_description || '',
          payments,
          createdBy: inv.created_by || '',
          items: (itemsRes.data || []).map(i => ({
            toolId: i.tool_id || null,
            name: i.tool_name,
            priceDay: i.price_day,
            days: i.days,
            quantity: i.quantity || 1,
            delivered: i.delivered || false,
          })),
        });
      }
      this.invoices.set(invoices);
    }

    if (seqRes.data) {
      this.seq.set(seqRes.data.seq + 1);
    }

    const expRes = await this.supabase.from('expenses').select('*').order('date', { ascending: false });
    if (expRes.data) {
      this.expenses.set(expRes.data.map(e => ({
        id: e.id,
        date: e.date,
        description: e.description,
        amount: e.amount,
        category: e.category,
        invoiceId: e.invoice_id || undefined,
      })));
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
        if (state.invoices) {
          const all = state.invoices as Invoice[];
          const u = this.user()?.email;
          const filtered = u ? all.filter(inv => !inv.createdBy || inv.createdBy.toLowerCase() === u.toLowerCase()) : all;
          this.invoices.set(filtered);
        }
        if (state.expenses) this.expenses.set(state.expenses);
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
      expenses: this.expenses(),
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

  async removeClient(id: string): Promise<void> {
    if (this.connected()) {
      await this.supabase.from('clients').delete().eq('id', id);
    }
    this.clients.update(list => list.filter(c => c.id !== id));
    this.saveToLocal();
  }

  async addExpense(e: Omit<Expense, 'id'>): Promise<Expense> {
    if (this.connected()) {
      const { data, error } = await this.supabase
        .from('expenses')
        .insert({ date: e.date, description: e.description, amount: e.amount, category: e.category, invoice_id: e.invoiceId || null, business_id: this.getBusinessId() || null })
        .select()
        .single();
      if (data && !error) {
        const newExpense: Expense = { ...e, id: data.id };
        this.expenses.update(list => [newExpense, ...list]);
        return newExpense;
      }
      console.error('[RentaObra] Error addExpense:', error);
    }
    const newExpense: Expense = { ...e, id: crypto.randomUUID() };
    this.expenses.update(list => [newExpense, ...list]);
    this.saveToLocal();
    return newExpense;
  }

  async removeExpense(id: string): Promise<void> {
    if (this.connected()) {
      await this.supabase.from('expenses').delete().eq('id', id);
    }
    this.expenses.update(list => list.filter(e => e.id !== id));
    this.saveToLocal();
  }

  async addInvoice(inv: Omit<Invoice, 'id' | 'num'>): Promise<Invoice> {
    const seqNum = this.seq();
    const num = `${this.business().prefix}-${new Date().getFullYear()}-${String(seqNum).padStart(3, '0')}`;

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
          invoice_notes: inv.notes || '',
          extra_charge: inv.extraCharge ?? 0,
          extra_description: inv.extraDescription ?? '',
          payments: inv.payments || [],
          created_by: this.user()?.email || '',
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
          invoice_notes: inv.notes || '',
          extra_charge: inv.extraCharge ?? 0,
          extra_description: inv.extraDescription ?? '',
          business_id: this.getBusinessId() || null,
        }));
      }

      if (data && !error) {
        for (const item of inv.items) {
          const itemRes = await this.supabase.from('invoice_items').insert({
            invoice_id: data.id,
            tool_id: item.toolId || null,
            tool_name: item.name,
            price_day: item.priceDay,
            days: item.days,
            quantity: item.quantity || 1,
            delivered: item.delivered || false,
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
          invoice_notes: inv.notes || '',
          extra_charge: inv.extraCharge ?? 0,
          extra_description: inv.extraDescription ?? '',
          payments: inv.payments || [],
        })
        .eq('id', inv.id);

      if (error) {
        console.error('[RentaObra] Error updateInvoice:', error.message, error.details);
        const fallback = await this.supabase
          .from('invoices')
          .update({
            client_id: inv.clientId,
            date: inv.date,
            due_date: inv.due,
            status: inv.status,
            notes: inv.method,
            extra_charge: inv.extraCharge ?? 0,
            extra_description: inv.extraDescription ?? '',
            payments: inv.payments || [],
          })
          .eq('id', inv.id);
        if (fallback.error) {
          console.error('[RentaObra] Error updateInvoice fallback:', fallback.error.message);
        }
      }

      if (!error || true) {
        await this.supabase.from('invoice_items').delete().eq('invoice_id', inv.id);
        for (const item of inv.items) {
          await this.supabase.from('invoice_items').insert({
            invoice_id: inv.id,
            tool_id: item.toolId || null,
            tool_name: item.name,
            price_day: item.priceDay,
            days: item.days,
            quantity: item.quantity || 1,
            delivered: item.delivered || false,
          });
        }
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
    const markingPaid = inv.status !== 'pagada';
    const newStatus = markingPaid ? 'pagada' : 'pendiente';
    const allDelivered = markingPaid;

    let payments = inv.payments ?? [];
    if (markingPaid) {
      const total = this.getInvoiceTotal(inv);
      const alreadyPaid = this.getInvoicePaid(inv);
      const restante = Math.max(total - alreadyPaid, 0);
      if (restante > 0) {
        payments = [...payments, { date: new Date().toISOString().slice(0, 10), amount: restante }];
      }
    }

    if (this.connected()) {
      await this.supabase.from('invoices').update({ status: newStatus, payments }).eq('id', id);
      if (allDelivered) {
        for (const item of inv.items) {
          item.delivered = true;
        }
        await this.supabase.from('invoice_items').update({ delivered: true }).eq('invoice_id', id);
      }
    }

    this.invoices.update(list =>
      list.map(i => i.id === id ? { ...i, status: newStatus, payments, items: i.items.map(item => ({ ...item, delivered: allDelivered })) } : i)
    );
    this.saveToLocal();
  }

  async addPayment(invoiceId: string, amount: number): Promise<void> {
    const inv = this.invoices().find(i => i.id === invoiceId);
    if (!inv || amount <= 0) return;

    const payments = [...(inv.payments ?? []), { date: new Date().toISOString().slice(0, 10), amount }];
    const paidNow = payments.reduce((s, p) => s + p.amount, 0);
    const total = this.getInvoiceTotal(inv);
    const status: Invoice['status'] = paidNow >= total ? 'pagada' : 'pendiente';

    if (this.connected()) {
      await this.supabase.from('invoices').update({ payments, status }).eq('id', invoiceId);
    }

    this.invoices.update(list =>
      list.map(i => i.id === invoiceId ? { ...i, payments, status } : i)
    );
    this.saveToLocal();
  }

  async toggleItemDelivered(invoiceId: string, itemIndex: number): Promise<void> {
    const inv = this.invoices().find(i => i.id === invoiceId);
    if (!inv || !inv.items[itemIndex]) return;

    inv.items[itemIndex].delivered = !inv.items[itemIndex].delivered;

    if (this.connected()) {
      const item = inv.items[itemIndex];
      const itemsRes = await this.supabase.from('invoice_items').select('id').eq('invoice_id', invoiceId).eq('tool_name', item.name);
      if (itemsRes.data && itemsRes.data.length > 0) {
        await this.supabase.from('invoice_items').update({ delivered: item.delivered }).eq('id', itemsRes.data[0].id);
      }
    }

    this.invoices.update(list => list.map(i => i.id === invoiceId ? { ...i } : i));
    this.saveToLocal();
  }

  async updateBusiness(b: Partial<Business>): Promise<void> {
    this.business.update(current => ({ ...current, ...b }));

    if (this.connected() && this.business().id) {
      const { error } = await this.supabase
        .from('businesses')
        .update({ name: b.name, nif: b.nit, phone: b.phone, address: b.addr, email: b.email, iva_rate: b.rate, prefix: b.prefix, logo_url: b.logoUrl, admin_name: b.adminName, payment_account: b.paymentAccount })
        .eq('id', this.business().id);
      if (error) console.error('[RentaObra] Error updateBusiness:', error.message);
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
    const tool = this.getToolById(toolId);
    if (!tool) return 0;
    return this.invoices()
      .filter(inv => inv.status === 'pendiente' || inv.status === 'vencida')
      .reduce((count, inv) => {
        const item = inv.items.find(i => i.toolId === toolId || i.name === tool.name);
        return count + (item ? (item.quantity || 1) : 0);
      }, 0);
  }

  getInvoiceTotal(inv: Invoice): number {
    const base = inv.items.reduce((s, i) => s + i.priceDay * i.days * (i.quantity || 1), 0);
    return base + (inv.extraCharge ?? 0);
  }

  getInvoicePaid(inv: Invoice): number {
    return (inv.payments ?? []).reduce((s, p) => s + p.amount, 0);
  }

  getInvoicePending(inv: Invoice): number {
    return Math.max(this.getInvoiceTotal(inv) - this.getInvoicePaid(inv), 0);
  }
}
