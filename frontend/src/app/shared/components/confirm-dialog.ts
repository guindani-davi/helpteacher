import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-confirm-dialog',
  template: `
    <dialog class="modal" [class.modal-open]="open()">
      <div class="modal-box">
        <h3 class="font-bold text-lg">{{ title() }}</h3>
        <p class="py-4">{{ message() }}</p>
        <div class="modal-action">
          <button class="btn" (click)="cancelled.emit()">Cancelar</button>
          <button
            class="btn"
            [class.btn-error]="variant() === 'danger'"
            [class.btn-primary]="variant() === 'primary'"
            (click)="confirmed.emit()"
          >
            {{ confirmLabel() }}
          </button>
        </div>
      </div>
      <form method="dialog" class="modal-backdrop">
        <button (click)="cancelled.emit()">close</button>
      </form>
    </dialog>
  `,
})
export class ConfirmDialog {
  open = input.required<boolean>();
  title = input('Tem certeza?');
  message = input('Esta ação não pode ser desfeita.');
  confirmLabel = input('Confirmar');
  variant = input<'danger' | 'primary'>('danger');

  confirmed = output<void>();
  cancelled = output<void>();
}
