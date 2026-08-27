import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService } from '../../core/services/data.service';
import { CurrencyFormatPipe } from '../../core/pipes/format.pipe';
import { Expense } from '../../core/models';

@Component({
  selector: 'app-gastos',
  standalone: true,
  imports: [CommonModule, CurrencyFormatPipe],
  templateUrl: './gastos.component.html',
  styleUrl: './gastos.component.css',
})
export class GastosComponent {
  private data = inject(DataService);

  expenses = this.data.expenses$;

  showForm = signal(false);
  form = signal({
    date: new Date().toISOString().slice(0, 10),
    description: '',
    amount: 0,
    category: 'Transporte',
  });

  categories = ['Transporte', 'Gasolina', 'Mantenimiento', 'Herramientas', 'Personal', 'Imprevisto', 'Otro'];

  totalGastado = computed(() =>
    this.expenses().reduce((sum, e) => sum + e.amount, 0)
  );

  toggleForm(): void {
    this.showForm.update(v => !v);
    if (!this.showForm()) {
      this.resetForm();
    }
  }

  resetForm(): void {
    this.form.set({
      date: new Date().toISOString().slice(0, 10),
      description: '',
      amount: 0,
      category: 'Transporte',
    });
  }

  async saveExpense(): Promise<void> {
    const f = this.form();
    if (!f.description || f.amount <= 0) return;
    await this.data.addExpense(f);
    this.resetForm();
    this.showForm.set(false);
  }

  removeExpense(id: string): void {
    if (confirm('¿Eliminar este gasto?')) {
      this.data.removeExpense(id);
    }
  }

  onFieldChange(field: string, event: Event): void {
    const val = (event.target as HTMLInputElement).value;
    this.form.update(f => ({
      ...f,
      [field]: field === 'amount' ? Number(val) || 0 : val,
    }));
  }

  onCategoryChange(event: Event): void {
    const val = (event.target as HTMLSelectElement).value;
    this.form.update(f => ({ ...f, category: val }));
  }
}
