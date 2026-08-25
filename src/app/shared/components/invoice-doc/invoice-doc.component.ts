import { Component, computed, input } from '@angular/core';
import { CurrencyFormatPipe, DateFormatPipe } from '../../../core/pipes/format.pipe';
import { Business, Client, InvoiceItem } from '../../../core/models/index';

@Component({
  selector: 'app-invoice-doc',
  standalone: true,
  imports: [CurrencyFormatPipe, DateFormatPipe],
  template: `
    <div class="invoice-doc">
      <div class="doc-head">
        <div class="doc-brand">
          <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; margin-right: 6px;">
            <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
            <polyline points="9 22 9 12 15 12 15 22"/>
          </svg>
          {{ business().name }}
          <small>NIT: {{ business().nit }} &middot; {{ business().phone }} &middot; {{ business().addr }}</small>
        </div>
        <div class="doc-title">
          <h2>FACTURA</h2>
          <div class="doc-num">{{ invoiceNum() || 'Borrador' }}</div>
          <div class="doc-num">Fecha: {{ invoiceDate() | dateFormat }}</div>
          <div class="doc-num">Vence: {{ invoiceDue() | dateFormat }}</div>
        </div>
      </div>

      <div class="doc-body">
        <div class="doc-block">
          <div class="label">Facturado a</div>
          @if (client()) {
            <div>{{ client()!.name }}</div>
            <div style="font-size: var(--fs-sm); color: var(--muted);">NIT: {{ client()!.nit }} &middot; {{ client()!.email }}</div>
          } @else {
            <div style="color: var(--muted);">Sin cliente asignado</div>
          }
        </div>
        <div class="doc-block">
          <div class="label">Condiciones de pago</div>
          <div>{{ invoiceMethod() }}</div>
        </div>
      </div>

      <table class="doc-table">
        <thead>
          <tr>
            <th>Herramienta</th>
            <th class="right">Valor / día</th>
            <th class="right">Días</th>
            <th class="right">Total</th>
          </tr>
        </thead>
        <tbody>
          @for (item of items(); track item.toolId) {
            <tr>
              <td>{{ item.name }}</td>
              <td class="right">{{ item.priceDay | currencyFormat }}</td>
              <td class="right">{{ item.days }}</td>
              <td class="right">{{ item.priceDay * item.days | currencyFormat }}</td>
            </tr>
          } @empty {
            <tr>
              <td colspan="4" style="text-align:center; color: var(--meta);">Sin líneas</td>
            </tr>
          }
        </tbody>
      </table>

      <div class="doc-totals">
        <div class="row">
          <span class="lbl">Base</span>
          <span class="val">{{ base() | currencyFormat }}</span>
        </div>
        <div class="row">
          <span class="lbl">IVA ({{ ivaRate() }}%)</span>
          <span class="val">{{ iva() | currencyFormat }}</span>
        </div>
        <div class="row grand">
          <span class="lbl">Total</span>
          <span class="val">{{ total() | currencyFormat }}</span>
        </div>
      </div>

      <div class="doc-foot">
        ¡Gracias por su preferencia!
      </div>
    </div>
  `,
})
export class InvoiceDocComponent {
  business = input.required<Business>();
  client = input<Client | null>(null);
  items = input<InvoiceItem[]>([]);
  invoiceNum = input('');
  invoiceDate = input('');
  invoiceDue = input('');
  invoiceMethod = input('');
  ivaRate = input(21);

  readonly base = computed(() =>
    this.items().reduce((sum, i) => sum + i.priceDay * i.days, 0)
  );

  readonly iva = computed(() => (this.base() * this.ivaRate()) / 100);

  readonly total = computed(() => this.base() + this.iva());
}
