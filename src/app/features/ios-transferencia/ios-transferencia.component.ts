import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService } from '../../core/services/data.service';

@Component({
  selector: 'app-ios-transferencia',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ios-transferencia.component.html',
  styleUrl: './ios-transferencia.component.css',
})
export class IosTransferenciaComponent {
  private data = inject(DataService);

  loading = signal(false);
  success = signal(false);

  confirm(): void {
    this.loading.set(true);
    setTimeout(() => {
      this.loading.set(false);
      this.success.set(true);
    }, 1400);
  }

  reset(): void {
    this.success.set(false);
    this.loading.set(false);
  }

  goBack(): void {
    window.history.back();
  }
}
