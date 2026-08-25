import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService } from '../../core/services/data.service';
import { CurrencyFormatPipe } from '../../core/pipes/format.pipe';
import { Tool } from '../../core/models';

@Component({
  selector: 'app-herramientas',
  standalone: true,
  imports: [CommonModule, CurrencyFormatPipe],
  templateUrl: './herramientas.component.html',
  styleUrl: './herramientas.component.css',
})
export class HerramientasComponent {
  private data = inject(DataService);

  tools = this.data.tools$;

  showForm = signal(false);
  editingTool = signal<Tool | null>(null);
  newTool = signal({ name: '', priceDay: 0, stock: 1 });

  toolCount = computed(() => this.tools().length);

  toolData = computed(() =>
    this.tools().map(t => ({
      ...t,
      activeRentals: this.data.getActiveToolCount(t.id ?? ''),
    }))
  );

  toggleForm(): void {
    this.showForm.update(v => !v);
    if (!this.showForm()) {
      this.editingTool.set(null);
      this.newTool.set({ name: '', priceDay: 0, stock: 1 });
    }
  }

  startEdit(tool: Tool): void {
    this.editingTool.set(tool);
    this.newTool.set({ name: tool.name, priceDay: tool.priceDay, stock: tool.stock });
    this.showForm.set(true);
  }

  async saveTool(): Promise<void> {
    const t = this.newTool();
    if (!t.name || t.priceDay <= 0) return;

    const editing = this.editingTool();
    if (editing) {
      await this.data.updateTool({ ...editing, name: t.name, priceDay: t.priceDay, stock: t.stock });
    } else {
      await this.data.addTool(t);
    }
    this.newTool.set({ name: '', priceDay: 0, stock: 1 });
    this.editingTool.set(null);
    this.showForm.set(false);
  }

  removeTool(id: string): void {
    this.data.removeTool(id);
  }

  onFieldChange(field: 'name' | 'priceDay' | 'stock', event: Event): void {
    const val = (event.target as HTMLInputElement).value;
    this.newTool.update(t => ({
      ...t,
      [field]: field === 'name' ? val : Number(val) || 0,
    }));
  }
}
