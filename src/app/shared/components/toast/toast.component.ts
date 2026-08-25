import { Component, inject } from '@angular/core';
import { ToastService } from './toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  template: `
    <div class="toast" [class.show]="toast.visible()" role="status" aria-live="polite">
      {{ toast.message() }}
    </div>
  `,
})
export class ToastComponent {
  readonly toast = inject(ToastService);
}
