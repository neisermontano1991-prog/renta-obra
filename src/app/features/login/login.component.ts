import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { DataService } from '../../core/services/data.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  private data = inject(DataService);
  private router = inject(Router);

  email = signal('');
  password = signal('');
  error = signal('');
  loading = signal(false);
  demo = signal(false);
  mode = signal<'login' | 'register'>('login');

  onEmail(event: Event): void {
    this.email.set((event.target as HTMLInputElement).value);
  }

  onPassword(event: Event): void {
    this.password.set((event.target as HTMLInputElement).value);
  }

  toggleMode(): void {
    this.mode.set(this.mode() === 'login' ? 'register' : 'login');
    this.error.set('');
  }

  async submit(): Promise<void> {
    const email = this.email().trim();
    const password = this.password();
    if (!email || !password) {
      this.error.set('Ingresa email y contraseña');
      return;
    }
    if (password.length < 6) {
      this.error.set('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    this.loading.set(true);
    this.error.set('');
    const res = this.mode() === 'login'
      ? await this.data.login(email, password)
      : await this.data.register(email, password);
    this.loading.set(false);
    if (res.ok) {
      this.router.navigate(['/panel']);
    } else {
      this.error.set(res.error || 'No se pudo completar la acción');
    }
  }

  enterDemo(): void {
    this.data.enterDemo();
    this.router.navigate(['/panel']);
  }
}