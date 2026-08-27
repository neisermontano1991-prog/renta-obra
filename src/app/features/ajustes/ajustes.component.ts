import { Component, inject, signal, effect } from '@angular/core';
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

  private loaded = signal(false);

  private syncEffect = effect(() => {
    const b = this.business();
    if (!this.loaded()) {
      this.loaded.set(true);
      this.form.set({
        name: b.name,
        nit: b.nit,
        phone: b.phone,
        addr: b.addr,
        email: b.email,
        rate: b.rate,
        prefix: b.prefix,
        logoUrl: b.logoUrl || '',
        adminName: b.adminName || '',
        paymentAccount: b.paymentAccount || '',
      });
    }
  });

  form = signal({
    name: '',
    nit: '',
    phone: '',
    addr: '',
    email: '',
    rate: 19,
    prefix: 'FAC',
    logoUrl: '',
    adminName: '',
    paymentAccount: '',
  });

  saved = signal(false);

  onFieldChange(field: string, event: Event): void {
    const val = (event.target as HTMLInputElement).value;
    this.form.update(f => ({
      ...f,
      [field]: field === 'rate' ? Number(val) || 0 : val,
    }));
  }

  onLogoUpload(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      this.form.update(f => ({ ...f, logoUrl: reader.result as string }));
    };
    reader.readAsDataURL(file);
  }

  removeLogo(): void {
    this.form.update(f => ({ ...f, logoUrl: '' }));
  }

  save(): void {
    this.data.updateBusiness(this.form());
    this.saved.set(true);
    setTimeout(() => this.saved.set(false), 2000);
  }
}
