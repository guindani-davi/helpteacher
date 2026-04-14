import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { form, FormField, required, submit } from '@angular/forms/signals';
import { Router } from '@angular/router';
import { ToastService } from '../../../../core/services/toast.service';
import { ConfirmDialog, PageHeader } from '../../../../shared';
import { OrganizationService } from '../../services/organization.service';
import { OrgContextService } from '../../state/org-context.service';

@Component({
  selector: 'app-org-settings-page',
  imports: [PageHeader, ConfirmDialog, FormField],
  template: `
    <app-page-header title="Organization Settings" subtitle="Manage your organization details" />

    <div class="max-w-2xl space-y-6">
      <!-- Logo upload -->
      <div class="card bg-base-100 shadow-sm border border-base-300">
        <div class="card-body">
          <h2 class="card-title text-base">Organization Logo</h2>
          <div class="flex items-center gap-6 mt-2">
            @if (logoUrl()) {
              <img
                [src]="logoUrl()"
                alt="Organization logo"
                class="w-20 h-20 rounded-lg object-cover border border-base-300"
              />
            } @else {
              <div
                class="w-20 h-20 rounded-lg bg-base-200 flex items-center justify-center border border-base-300"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-8 w-8 text-base-content/30"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
            }
            <div class="flex flex-col gap-2">
              <input
                #logoInput
                type="file"
                accept="image/png,image/jpeg"
                class="hidden"
                (change)="onLogoSelected($event)"
              />
              <button type="button" class="btn btn-outline w-fit" (click)="logoInput.click()">
                Choose File
              </button>
              <p class="text-sm text-base-content/50">PNG or JPEG, max 2 MB</p>
              @if (uploadingLogo()) {
                <span class="loading loading-spinner loading-sm text-primary"></span>
              }
            </div>
          </div>
        </div>
      </div>

      <!-- Edit form -->
      <div class="card bg-base-100 shadow-sm border border-base-300">
        <div class="card-body">
          <h2 class="card-title text-base">General</h2>

          <form (submit)="onSave($event)">
            <fieldset class="fieldset mb-4">
              <legend class="fieldset-legend text-sm mb-0.5">Organization Name</legend>
              <input
                type="text"
                class="input input-bordered w-full"
                [formField]="settingsForm.name"
              />
              @if (settingsForm.name().touched() && settingsForm.name().invalid()) {
                <p class="label text-error">
                  @for (err of settingsForm.name().errors(); track err.kind) {
                    {{ err.message }}
                  }
                </p>
              }
            </fieldset>

            <div class="flex justify-end mt-2">
              <button type="submit" class="btn btn-primary" [disabled]="saving()">
                @if (saving()) {
                  <span class="loading loading-spinner loading-sm"></span>
                }
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Danger zone (owner only) -->
      @if (orgContext.isOwner()) {
        <div class="card bg-base-100 shadow-sm border border-error/30">
          <div class="card-body">
            <h2 class="card-title text-base text-error">Danger Zone</h2>
            <p class="text-sm text-base-content/60">
              Permanently delete this organization and all its data. This cannot be undone.
            </p>
            <div class="flex justify-end mt-2">
              <button class="btn btn-error btn-outline" (click)="showDeleteConfirm.set(true)">
                Delete Organization
              </button>
            </div>
          </div>
        </div>
      }
    </div>

    <app-confirm-dialog
      [open]="showDeleteConfirm()"
      title="Delete Organization"
      message="This will permanently delete the organization and all associated data. This action cannot be undone."
      confirmLabel="Delete"
      variant="danger"
      (confirmed)="deleteOrg()"
      (cancelled)="showDeleteConfirm.set(false)"
    />
  `,
})
export default class OrgSettingsPage implements OnInit {
  protected readonly orgContext = inject(OrgContextService);
  private readonly orgService = inject(OrganizationService);
  private readonly toastService = inject(ToastService);
  private readonly router = inject(Router);

  protected readonly saving = signal(false);
  protected readonly showDeleteConfirm = signal(false);
  protected readonly uploadingLogo = signal(false);

  protected readonly logoUrl = computed(() => this.orgContext.org()?.logoUrl ?? '');

  protected readonly settingsModel = signal({ name: '' });

  protected readonly settingsForm = form(this.settingsModel, (s) => {
    required(s.name, { message: 'Name is required' });
  });

  ngOnInit(): void {
    const org = this.orgContext.org();
    if (org) {
      this.settingsModel.set({ name: org.name });
    }
  }

  onLogoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    const slug = this.orgContext.org()?.slug;
    if (!slug) return;

    this.uploadingLogo.set(true);
    this.orgService.uploadLogo(slug, file).subscribe({
      next: () => {
        this.toastService.success('Logo updated');
        // Reload org context to pick up new logoUrl
        this.orgContext.load(slug).finally(() => this.uploadingLogo.set(false));
      },
      error: () => {
        this.toastService.error('Failed to upload logo');
        this.uploadingLogo.set(false);
      },
    });
  }

  onSave(event: Event): void {
    event.preventDefault();
    submit(this.settingsForm, async () => {
      this.saving.set(true);
      const slug = this.orgContext.org()?.slug;
      if (!slug) return;

      try {
        const { name } = this.settingsModel();
        const res = await new Promise<{ data: { slug: string } }>((resolve, reject) => {
          this.orgService.update(slug, { name: name.trim() }).subscribe({
            next: (r) => resolve(r as { data: { slug: string } }),
            error: reject,
          });
        });
        this.toastService.success('Settings saved');
        // If slug changed, navigate to new URL
        if (res.data.slug !== slug) {
          this.router.navigateByUrl(`/orgs/${res.data.slug}/settings`);
        }
      } catch {
        this.toastService.error('Failed to save settings');
      } finally {
        this.saving.set(false);
      }
    });
  }

  deleteOrg(): void {
    const slug = this.orgContext.org()?.slug;
    if (!slug) return;
    this.showDeleteConfirm.set(false);
    this.orgService.delete(slug).subscribe({
      next: () => {
        this.toastService.success('Organization deleted');
        this.router.navigateByUrl('/orgs');
      },
      error: () => this.toastService.error('Failed to delete organization'),
    });
  }
}
