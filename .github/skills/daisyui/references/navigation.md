# Navigation Components

## Navbar

```html
<div class="navbar bg-base-200">
  <div class="navbar-start">
    <a class="btn btn-ghost text-xl">Brand</a>
  </div>
  <div class="navbar-center hidden lg:flex">
    <ul class="menu menu-horizontal px-1">
      <li><a>Home</a></li>
      <li><a>About</a></li>
    </ul>
  </div>
  <div class="navbar-end">
    <button class="btn btn-primary">Sign up</button>
  </div>
</div>
```

Use `navbar-start`, `navbar-center`, `navbar-end` to position content.

## Menu

```html
<!-- Vertical (default) -->
<ul class="menu bg-base-200 rounded-box w-56">
  <li><a>Item 1</a></li>
  <li><span class="menu-title">Section</span></li>
  <li>
    <details>
      <summary>Parent</summary>
      <ul><li><a>Child</a></li></ul>
    </details>
  </li>
</ul>

<!-- Horizontal -->
<ul class="menu menu-horizontal">
  <li><a>Item 1</a></li>
  <li><a>Item 2</a></li>
</ul>
```

Use `lg:menu-horizontal` for responsive menus. Use `menu-active` on `<li>` for active state. Use `menu-disabled` on `<li>` for disabled state.

## Drawer (Sidebar Layout)

```html
<!-- Sidebar hidden on mobile, always visible on large screens -->
<div class="drawer lg:drawer-open">
  <input id="my-drawer" type="checkbox" class="drawer-toggle" />
  <div class="drawer-content">
    <!-- All page content goes here -->
    <label for="my-drawer" class="btn drawer-button lg:hidden">Open menu</label>
  </div>
  <div class="drawer-side">
    <label for="my-drawer" aria-label="close sidebar" class="drawer-overlay"></label>
    <ul class="menu bg-base-200 min-h-full w-80 p-4">
      <li><a>Dashboard</a></li>
      <li><a>Settings</a></li>
    </ul>
  </div>
</div>
```

**Rules:**
- Every page element (navbar, footer, content) must be inside `drawer-content`.
- `drawer-toggle` is a hidden checkbox. Use `<label for="...">` to open/close.
- `drawer-end` places the sidebar on the right.
- `lg:drawer-open` keeps the sidebar always visible on large screens.

## Tabs

Using radio inputs (supports tab content panels):

```html
<div role="tablist" class="tabs tabs-lift">
  <input type="radio" name="my_tabs" class="tab" aria-label="Tab 1" checked />
  <div class="tab-content bg-base-100 border-base-300 p-6">Content 1</div>

  <input type="radio" name="my_tabs" class="tab" aria-label="Tab 2" />
  <div class="tab-content bg-base-100 border-base-300 p-6">Content 2</div>
</div>
```

Styles: `tabs-box`, `tabs-border`, `tabs-lift`. Placement: `tabs-top` (default), `tabs-bottom`.

## Breadcrumbs

```html
<div class="breadcrumbs text-sm">
  <ul>
    <li><a>Home</a></li>
    <li><a>Products</a></li>
    <li>Current page</li>
  </ul>
</div>
```

## Dock (Bottom Navigation)

```html
<div class="dock">
  <button class="dock-active">
    <svg><!-- icon --></svg>
    <span class="dock-label">Home</span>
  </button>
  <button>
    <svg><!-- icon --></svg>
    <span class="dock-label">Search</span>
  </button>
  <button>
    <svg><!-- icon --></svg>
    <span class="dock-label">Profile</span>
  </button>
</div>
```

Add `<meta name="viewport" content="viewport-fit=cover">` for correct iOS safe area behavior. Sizes: `dock-xs`, `dock-sm`, `dock-md`, `dock-lg`, `dock-xl`.
