export interface Business {
  id?: string;
  name: string;
  nit: string;
  phone: string;
  addr: string;
  email: string;
  rate: number;
  prefix: string;
  logoUrl: string;
  adminName: string;
  paymentAccount: string;
}

export interface Client {
  id?: string;
  name: string;
  nit: string;
  phone: string;
  email: string;
  addr: string;
}

export interface Tool {
  id?: string;
  name: string;
  priceDay: number;
  stock: number;
}

export interface InvoiceItem {
  toolId?: string;
  name: string;
  priceDay: number;
  days: number;
  quantity?: number;
  delivered?: boolean;
}

export interface InvoicePayment {
  id?: string;
  date: string;
  amount: number;
}

export interface Invoice {
  id?: string;
  num: string;
  clientId?: string;
  date: string;
  due: string;
  method: string;
  status: 'pagada' | 'pendiente' | 'vencida';
  items: InvoiceItem[];
  notes?: string;
  extraCharge?: number;
  extraDescription?: string;
  payments?: InvoicePayment[];
  createdBy?: string;
}

export interface Expense {
  id?: string;
  date: string;
  description: string;
  amount: number;
  category: string;
  invoiceId?: string;
}

export type InvoiceStatus = Invoice['status'];

export interface SessionUser {
  email: string;
  name: string;
  id?: string;
}

export interface AppState {
  business: Business;
  clients: Client[];
  tools: Tool[];
  invoices: Invoice[];
  seq: number;
}
