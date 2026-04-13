# Feedback & Overlay Components

## Alert

```html
<div role="alert" class="alert alert-success">
  <svg><!-- icon --></svg>
  <span>File saved successfully.</span>
</div>
```

Colors: `alert-info`, `alert-success`, `alert-warning`, `alert-error`. Styles: `alert-outline`, `alert-dash`, `alert-soft`. Direction: `alert-horizontal`, `alert-vertical`. Use `sm:alert-horizontal` for responsive layout.

## Modal

Prefer the native `<dialog>` element:

```html
<button class="btn btn-primary" onclick="my_modal.showModal()">Open</button>

<dialog id="my_modal" class="modal">
  <div class="modal-box">
    <h3 class="font-bold text-lg">Title</h3>
    <p class="py-4">Content goes here.</p>
    <div class="modal-action">
      <form method="dialog">
        <button class="btn">Close</button>
      </form>
    </div>
  </div>
  <!-- Click outside to close -->
  <form method="dialog" class="modal-backdrop">
    <button>close</button>
  </form>
</dialog>
```

Placement: `modal-top`, `modal-middle`, `modal-bottom`, `modal-start`, `modal-end`. Use unique IDs per modal. Use `<form method="dialog">` to close via submit.

## Toast

```html
<div class="toast toast-end toast-bottom">
  <div class="alert alert-success"><span>Settings saved!</span></div>
</div>
```

Placement: `toast-start`, `toast-center`, `toast-end` (horizontal) and `toast-top`, `toast-middle`, `toast-bottom` (vertical). Render toasts dynamically via JS — add to DOM, remove after a timeout.

## Tooltip

```html
<div class="tooltip tooltip-top" data-tip="Save changes">
  <button class="btn btn-primary">Save</button>
</div>
```

Placement: `tooltip-top` (default), `tooltip-bottom`, `tooltip-left`, `tooltip-right`. Colors: `tooltip-primary`, `tooltip-secondary`, `tooltip-accent`, `tooltip-info`, `tooltip-success`, `tooltip-warning`, `tooltip-error`. Add `tooltip-open` to always show.

## Loading

```html
<span class="loading loading-spinner loading-md"></span>
```

Styles: `loading-spinner`, `loading-dots`, `loading-ring`, `loading-ball`, `loading-bars`, `loading-infinity`. Sizes: `loading-xs`, `loading-sm`, `loading-md`, `loading-lg`, `loading-xl`.

## Skeleton

```html
<!-- Block skeleton -->
<div class="skeleton h-32 w-full rounded-box"></div>

<!-- Text skeleton -->
<div class="skeleton skeleton-text h-4 w-48"></div>
```

Always set `h-*` and `w-*` to match the dimensions of the element being loaded.

## Progress Bar

```html
<progress class="progress progress-primary" value="70" max="100"></progress>
```

Always include `value` and `max`. Colors: `progress-neutral`, `progress-primary`, `progress-secondary`, `progress-accent`, `progress-info`, `progress-success`, `progress-warning`, `progress-error`.

## Radial Progress

```html
<div
  class="radial-progress"
  style="--value: 70;"
  aria-valuenow="70"
  role="progressbar"
>
  70%
</div>
```

`--value` must be 0–100. Use `--size` to set diameter (default `5rem`) and `--thickness` for indicator width. Always include `role="progressbar"` and `aria-valuenow`.
