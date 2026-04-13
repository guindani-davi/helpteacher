import { Component, inject } from '@angular/core';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-toast-container',
  template: `
    <div class="toast toast-end toast-top z-50">
      @for (toast of toastService.toasts(); track toast.id) {
        <div
          class="alert shadow-lg cursor-pointer"
          [class.alert-success]="toast.type === 'success'"
          [class.alert-error]="toast.type === 'error'"
          [class.alert-info]="toast.type === 'info'"
          [class.alert-warning]="toast.type === 'warning'"
          (click)="toastService.dismiss(toast.id)"
        >
          <span>{{ toast.message }}</span>
        </div>
      }
    </div>
  `,
})
export class ToastContainer {
  protected readonly toastService = inject(ToastService);
}
