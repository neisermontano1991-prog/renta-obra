export interface Business {
  id?: string;
  name: string;
  nit: string;
  phone: string;
  addr: string;
  email: string;
  rate: number;
  prefix: string;
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
}

export type InvoiceStatus = Invoice['status'];

export interface AppState {
  business: Business;
  clients: Client[];
  tools: Tool[];
  invoices: Invoice[];
  seq: number;
}
