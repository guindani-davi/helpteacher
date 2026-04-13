# Layout & Display Components

## Card

```html
<div class="card card-md bg-base-100 shadow-sm">
  <figure>
    <img src="https://picsum.photos/400/200" alt="Cover" />
  </figure>
  <div class="card-body">
    <h2 class="card-title">Card Title</h2>
    <p>Supporting description text.</p>
    <div class="card-actions justify-end">
      <button class="btn btn-primary">Buy</button>
    </div>
  </div>
</div>
```

Styles: `card-border`, `card-dash`. Sizes: `card-xs`, `card-sm`, `card-md`, `card-lg`, `card-xl`. Layout: `card-side` for horizontal. Use `sm:card-horizontal` for responsive. Use `image-full` to overlay content on top of the image.

## Hero

```html
<div class="hero min-h-screen bg-base-200">
  <div class="hero-content text-center">
    <div class="max-w-md">
      <h1 class="text-5xl font-bold">Hello there</h1>
      <p class="py-6">Description goes here.</p>
      <button class="btn btn-primary">Get Started</button>
    </div>
  </div>
</div>
```

Use `hero-overlay` to tint a background image:

```html
<div class="hero" style="background-image: url(...);">
  <div class="hero-overlay"></div>
  <div class="hero-content text-neutral-content text-center">...</div>
</div>
```

## Stats

```html
<div class="stats shadow sm:stats-horizontal">
  <div class="stat">
    <div class="stat-figure text-primary">
      <svg><!-- icon --></svg>
    </div>
    <div class="stat-title">Total Users</div>
    <div class="stat-value text-primary">31K</div>
    <div class="stat-desc">21% more than last month</div>
  </div>
  <div class="stat">
    <div class="stat-title">Revenue</div>
    <div class="stat-value">$4,200</div>
    <div class="stat-desc">↗︎ 400 (22%)</div>
  </div>
</div>
```

Direction: `stats-horizontal`, `stats-vertical`. Use `stat-figure` for an icon, `stat-actions` for buttons inside a stat.

## Table

```html
<div class="overflow-x-auto">
  <table class="table table-zebra">
    <thead>
      <tr>
        <th>#</th>
        <th>Name</th>
        <th>Role</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <th>1</th>
        <td>Alice</td>
        <td>Admin</td>
      </tr>
    </tbody>
  </table>
</div>
```

Always wrap in `overflow-x-auto`. Modifiers: `table-zebra`, `table-pin-rows`, `table-pin-cols`. Sizes: `table-xs`, `table-sm`, `table-md`, `table-lg`, `table-xl`.

## List

```html
<ul class="list bg-base-100 rounded-box shadow-sm">
  <li class="list-row">
    <div class="list-col-grow">
      <div class="font-bold">Title</div>
      <div class="text-sm text-base-content/70">Subtitle</div>
    </div>
    <button class="btn btn-sm btn-ghost">Action</button>
  </li>
</ul>
```

The second child of `list-row` fills remaining space by default. Add `list-col-grow` to a different child to change which one grows. Use `list-col-wrap` to wrap an item to the next line.

## Divider

```html
<div class="divider">OR</div>
<div class="divider divider-horizontal"></div> <!-- vertical line -->
<div class="divider divider-primary">Section</div>
```

Colors: `divider-neutral`, `divider-primary`, etc. Placement: `divider-start`, `divider-end` (moves text to either side).

## Stack

```html
<div class="stack">
  <div class="card bg-base-100 shadow">Item 3</div>
  <div class="card bg-base-200 shadow">Item 2</div>
  <div class="card bg-base-300 shadow">Item 1 (top)</div>
</div>
```

Elements are stacked visually on top of each other. Modifiers: `stack-top`, `stack-bottom`, `stack-start`, `stack-end`.

## Indicator

```html
<div class="indicator">
  <span class="indicator-item badge badge-error">99+</span>
  <button class="btn">Inbox</button>
</div>
```

Place all `indicator-item` elements before the main content. Placement: `indicator-start/center/end` (horizontal) + `indicator-top/middle/bottom` (vertical). Default is top-end.

## Steps

```html
<ul class="steps steps-vertical lg:steps-horizontal">
  <li class="step step-primary">Register</li>
  <li class="step step-primary">Verify</li>
  <li class="step">Purchase</li>
  <li class="step">Done</li>
</ul>
```

Add `step-primary` (or any color) to mark completed/active steps. Use `data-content="✓"` to set custom step icon text.

## Timeline

```html
<ul class="timeline timeline-vertical">
  <li>
    <div class="timeline-start">2020</div>
    <div class="timeline-middle">
      <svg><!-- dot icon --></svg>
    </div>
    <div class="timeline-end timeline-box">Founded the company</div>
  </li>
</ul>
```

Modifiers: `timeline-compact` (all items on one side), `timeline-snap-icon` (icon aligns to start). Use `timeline-box` on content for a card-style appearance.

## Carousel

```html
<div class="carousel w-full">
  <div id="slide1" class="carousel-item w-full">
    <img src="https://picsum.photos/800/400" class="w-full" alt="Slide 1" />
  </div>
  <div id="slide2" class="carousel-item w-full">
    <img src="https://picsum.photos/800/401" class="w-full" alt="Slide 2" />
  </div>
</div>
```

Modifier: `carousel-start` (default), `carousel-center`, `carousel-end`. Direction: `carousel-horizontal` (default), `carousel-vertical`.

## Diff (Side-by-side Comparison)

```html
<figure class="diff aspect-16/9">
  <div class="diff-item-1">
    <img src="after.png" alt="After" />
  </div>
  <div class="diff-item-2">
    <img src="before.png" alt="Before" />
  </div>
  <div class="diff-resizer"></div>
</figure>
```

Use `aspect-*` utilities to control the aspect ratio.

## Footer

```html
<footer class="footer bg-base-200 p-10 sm:footer-horizontal">
  <nav>
    <h6 class="footer-title">Product</h6>
    <a class="link link-hover">Features</a>
    <a class="link link-hover">Pricing</a>
  </nav>
  <nav>
    <h6 class="footer-title">Company</h6>
    <a class="link link-hover">About</a>
    <a class="link link-hover">Blog</a>
  </nav>
</footer>
```

Use `footer-center` for centered layout. Use `sm:footer-horizontal` for responsive direction.
