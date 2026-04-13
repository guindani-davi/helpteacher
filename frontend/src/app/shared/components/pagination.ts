import { Component, computed, input, output } from '@angular/core';

@Component({
  selector: 'app-pagination',
  template: `
    @if (totalPages() > 1) {
      <div class="join">
        <button
          class="join-item btn btn-sm"
          [disabled]="currentPage() <= 1"
          (click)="pageChanged.emit(currentPage() - 1)"
        >
          «
        </button>
        @for (page of visiblePages(); track page) {
          <button
            class="join-item btn btn-sm"
            [class.btn-active]="page === currentPage()"
            (click)="pageChanged.emit(page)"
          >
            {{ page }}
          </button>
        }
        <button
          class="join-item btn btn-sm"
          [disabled]="currentPage() >= totalPages()"
          (click)="pageChanged.emit(currentPage() + 1)"
        >
          »
        </button>
      </div>
    }
  `,
})
export class Pagination {
  currentPage = input.required<number>();
  totalPages = input.required<number>();
  pageChanged = output<number>();

  protected visiblePages = computed(() => {
    const total = this.totalPages();
    const current = this.currentPage();
    const pages: number[] = [];
    const start = Math.max(1, current - 2);
    const end = Math.min(total, current + 2);
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  });
}
