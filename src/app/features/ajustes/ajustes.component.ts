import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService } from '../../core/services/data.service';

@Component({
  selector: 'app-ajustes',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ajustes.component.html',
  styleUrl: './ajustes.component.css',
})
export class AjustesComponent {
  private data = inject(DataService);

  business = this.data.business$;

  form = signal({
    name: '',
    nit: '',
    phone: '',
    addr: '',
    email: '',
    rate: 21,
    prefix: 'FAC',
  });

  saved = signal(false);

  constructor() {
    const b = this.data.business$();
    this.form.set({
      name: b.name,
      nit: b.nit,
      phone: b.phone,
      addr: b.addr,
      email: b.email,
      rate: b.rate,
      prefix: b.prefix,
    });
  }

  onFieldChange(field: string, event: Event): void {
    const val = (event.target as HTMLInputElement).value;
    this.form.update(f => ({
      ...f,
      [field]: field === 'rate' ? Number(val) || 0 : val,
    }));
  }

  save(): void {
    this.data.updateBusiness(this.form());
    this.saved.set(true);
    setTimeout(() => this.saved.set(false), 2000);
  }
}
