# Buttons & Action Components

## Button

```html
<button class="btn btn-primary">Primary</button>
<button class="btn btn-secondary btn-outline">Outline</button>
<button class="btn btn-accent btn-soft btn-lg">Large Soft</button>
<button class="btn btn-ghost">Ghost</button>
<button class="btn btn-link">Link</button>
<button class="btn btn-circle btn-primary">
  <svg><!-- icon --></svg>
</button>
```

Colors: `btn-neutral`, `btn-primary`, `btn-secondary`, `btn-accent`, `btn-info`, `btn-success`, `btn-warning`, `btn-error`. Styles: `btn-outline`, `btn-dash`, `btn-soft`, `btn-ghost`, `btn-link`. Sizes: `btn-xs`, `btn-sm`, `btn-md`, `btn-lg`, `btn-xl`. Shape: `btn-wide`, `btn-block`, `btn-square`, `btn-circle`.

`btn` works on `<button>`, `<a>`, and `<input type="submit">`.

To disable without the HTML attribute, use `tabindex="-1" role="button" aria-disabled="true"` + `btn-disabled`.

## Badge

```html
<span class="badge badge-primary">New</span>
<span class="badge badge-error badge-sm">3</span>
<!-- Empty badge (dot) -->
<span class="badge badge-success"></span>
```

Colors: `badge-neutral`, `badge-primary`, `badge-secondary`, `badge-accent`, `badge-info`, `badge-success`, `badge-warning`, `badge-error`. Styles: `badge-outline`, `badge-dash`, `badge-soft`, `badge-ghost`. Sizes: `badge-xs`, `badge-sm`, `badge-md`, `badge-lg`, `badge-xl`.

Use inside buttons or text for inline status labels.

## Dropdown

Prefer `<details>` for zero-JS dropdowns:

```html
<details class="dropdown dropdown-end">
  <summary class="btn btn-ghost">Menu ▾</summary>
  <ul class="dropdown-content menu bg-base-100 rounded-box shadow-sm z-10 w-52 p-2">
    <li><a>Profile</a></li>
    <li><a>Settings</a></li>
    <li><a>Logout</a></li>
  </ul>
</details>
```

Popover API (stays open independently of focus):

```html
<button popovertarget="dd1" style="anchor-name:--dd1">Open</button>
<ul class="dropdown-content menu bg-base-100 rounded-box shadow-sm"
    popover id="dd1" style="position-anchor:--dd1">
  <li><a>Item</a></li>
</ul>
```

Placement: `dropdown-start`, `dropdown-center`, `dropdown-end`, `dropdown-top`, `dropdown-bottom`, `dropdown-left`, `dropdown-right`.

## FAB (Floating Action Button)

```html
<!-- Simple single FAB -->
<div class="fab">
  <button class="btn btn-lg btn-circle btn-primary">+</button>
</div>

<!-- FAB with speed-dial -->
<div class="fab">
  <div tabindex="0" role="button" class="btn btn-lg btn-circle btn-primary">+</div>
  <button class="btn btn-lg btn-circle">✏️</button>
  <button class="btn btn-lg btn-circle">📎</button>
  <button class="btn btn-lg btn-circle">🖼️</button>
</div>

<!-- FAB flower layout (quarter-circle) -->
<div class="fab fab-flower">
  <div tabindex="0" role="button" class="btn btn-lg btn-circle btn-primary">+</div>
  <button class="fab-main-action btn btn-circle btn-lg">★</button>
  <div class="tooltip tooltip-left" data-tip="Upload">
    <button class="btn btn-lg btn-circle">📎</button>
  </div>
  <div class="tooltip tooltip-left" data-tip="Edit">
    <button class="btn btn-lg btn-circle">✏️</button>
  </div>
</div>
```

Use `fab-close` class on a child to replace the trigger button with a close button when open. Use `fab-main-action` for a prominent action shown after opening.

## Swap (Toggle Two Elements)

```html
<!-- Using checkbox -->
<label class="swap swap-rotate">
  <input type="checkbox" />
  <svg class="swap-on"><!-- sun icon --></svg>
  <svg class="swap-off"><!-- moon icon --></svg>
</label>

<!-- Using JS class -->
<div class="swap swap-flip" id="my-swap">
  <div class="swap-on">ON</div>
  <div class="swap-off">OFF</div>
</div>
<script>
  document.getElementById('my-swap').classList.toggle('swap-active');
</script>
```

Styles: `swap-rotate`, `swap-flip`. Control with checkbox or by toggling `swap-active` via JS.

## Avatar

```html
<!-- Single avatar -->
<div class="avatar avatar-online">
  <div class="w-12 rounded-full">
    <img src="..." alt="User avatar" />
  </div>
</div>

<!-- Placeholder (no image) -->
<div class="avatar avatar-placeholder">
  <div class="bg-neutral text-neutral-content w-12 rounded-full">
    <span>JD</span>
  </div>
</div>

<!-- Avatar group -->
<div class="avatar-group -space-x-4">
  <div class="avatar"><div class="w-10"><img src="..." /></div></div>
  <div class="avatar"><div class="w-10"><img src="..." /></div></div>
  <div class="avatar avatar-placeholder">
    <div class="bg-neutral text-neutral-content w-10">+3</div>
  </div>
</div>
```

Modifiers: `avatar-online`, `avatar-offline`, `avatar-placeholder`. Size via `w-*`. Shape via `rounded-full`, `mask-squircle`, etc.

## Link

```html
<a class="link link-primary">Click here</a>
<a class="link link-hover">Hover to underline</a>
```

Colors: `link-neutral`, `link-primary`, `link-secondary`, `link-accent`, `link-success`, `link-info`, `link-warning`, `link-error`. Use `link-hover` to only show underline on hover.
