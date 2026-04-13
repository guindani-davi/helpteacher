# Decorative & Miscellaneous Components

## Accordion

```html
<!-- Group: only one item open at a time via shared radio name -->
<div class="collapse collapse-arrow bg-base-200 rounded-box">
  <input type="radio" name="faq" checked="checked" />
  <div class="collapse-title font-semibold">Question 1</div>
  <div class="collapse-content text-sm">Answer 1</div>
</div>
<div class="collapse collapse-arrow bg-base-200 rounded-box">
  <input type="radio" name="faq" />
  <div class="collapse-title font-semibold">Question 2</div>
  <div class="collapse-content text-sm">Answer 2</div>
</div>
```

**Rules:**
- All radio inputs in a group share the same `name`. Use different names for separate accordion groups.
- Add `checked="checked"` to the radio of the item that should be open by default.
- Modifiers: `collapse-arrow`, `collapse-plus`, `collapse-open`, `collapse-close`.

## Collapse (Single Toggle)

```html
<!-- Checkbox-controlled -->
<div class="collapse collapse-plus bg-base-200">
  <input type="checkbox" />
  <div class="collapse-title">Click to expand</div>
  <div class="collapse-content">Hidden content</div>
</div>

<!-- Focus-controlled -->
<div tabindex="0" class="collapse collapse-arrow bg-base-200">
  <div class="collapse-title">Click to expand</div>
  <div class="collapse-content">Hidden content</div>
</div>
```

## Hover 3D Card

```html
<!-- Must have exactly 9 children: 1 content element + 8 empty divs -->
<div class="hover-3d my-12 mx-2">
  <div class="card bg-base-100 shadow-xl max-w-sm">
    <figure><img src="https://picsum.photos/400/300" alt="Product" /></figure>
    <div class="card-body">
      <h2 class="card-title">Product Name</h2>
      <p>Description text</p>
    </div>
  </div>
  <div></div><div></div><div></div><div></div>
  <div></div><div></div><div></div><div></div>
</div>
```

**Rules:**
- Exactly 1 content child + 8 empty `<div>` hover zone children. Never more, never less.
- Content inside must be **non-interactive** — no buttons, links, or inputs.
- To make the whole card clickable, make the `hover-3d` itself an `<a>` tag.

## Hover Gallery

```html
<!-- Up to 10 images; all must have identical dimensions -->
<figure class="hover-gallery max-w-xs">
  <img src="product-1.jpg" alt="View 1" />
  <img src="product-2.jpg" alt="View 2" />
  <img src="product-3.jpg" alt="View 3" />
  <img src="product-4.jpg" alt="View 4" />
</figure>
```

Always set a `max-w-*`. Images must be the same dimensions. Supports up to 10 images.

## Text Rotate

```html
<!-- 2–6 inner spans rotate on a 10-second loop -->
<span class="text-rotate text-4xl font-bold">
  <span>
    <span>Design</span>
    <span>Develop</span>
    <span>Deploy</span>
  </span>
</span>

<!-- Inline within a sentence -->
<p class="text-2xl">
  Built for
  <span class="text-rotate">
    <span>
      <span class="text-primary">designers</span>
      <span class="text-secondary">developers</span>
      <span class="text-accent">everyone</span>
    </span>
  </span>
</p>
```

Use `duration-{ms}` to change loop speed (e.g., `duration-15000`). The outer `text-rotate` span wraps an inner span which holds 2–6 text spans.

## Mask

```html
<img class="mask mask-hexagon w-24" src="avatar.jpg" alt="User" />
<div class="mask mask-heart bg-primary w-16 h-16"></div>
```

Shapes: `mask-squircle`, `mask-heart`, `mask-hexagon`, `mask-hexagon-2`, `mask-decagon`, `mask-pentagon`, `mask-diamond`, `mask-square`, `mask-circle`, `mask-star`, `mask-star-2`, `mask-triangle`, `mask-triangle-2`, `mask-triangle-3`, `mask-triangle-4`. Use `mask-half-1` / `mask-half-2` for half-shapes.

## Countdown

```html
<span class="countdown font-mono text-5xl">
  <span style="--value: 59;" aria-live="polite" aria-label="59">59</span>
</span>
```

`--value` must be 0–999. Update both the `--value` CSS variable and the inner text content via JS. Add `aria-live="polite"` and `aria-label` for screen reader support.

## Kbd (Keyboard Key)

```html
<kbd class="kbd">⌘</kbd> + <kbd class="kbd">K</kbd>
```

Sizes: `kbd-xs`, `kbd-sm`, `kbd-md`, `kbd-lg`, `kbd-xl`.

## Mockups

```html
<!-- Code editor mockup -->
<div class="mockup-code">
  <pre data-prefix="$"><code>npm install daisyui</code></pre>
  <pre data-prefix=">" class="text-success"><code>Done!</code></pre>
</div>

<!-- Browser mockup -->
<div class="mockup-browser border border-base-300">
  <div class="mockup-browser-toolbar">
    <div class="input">https://example.com</div>
  </div>
  <div class="flex justify-center px-4 py-8 border-t border-base-300">Content</div>
</div>

<!-- Phone mockup -->
<div class="mockup-phone">
  <div class="mockup-phone-camera"></div>
  <div class="mockup-phone-display">
    <div class="p-4">App content</div>
  </div>
</div>
```

## Anti-Patterns

| ❌ Don't | ✅ Do instead |
|---|---|
| `hover-3d` with ≠9 direct children | Exactly 1 content child + 8 empty `<div>`s |
| Interactive elements inside `hover-3d` | Non-interactive content only; wrap `hover-3d` in `<a>` if clickable |
| Accordion radio inputs with different `name` per item | Share the same `name` across all items in a group |
| `hover-gallery` images of different sizes | All images must have identical dimensions |
| Forgetting `overflow-x-auto` on table wrapper | Always wrap `<table>` in `overflow-x-auto` |
| Omitting `value`+`max` on `<progress>` | Always provide both attributes |
| Using `text-gray-*` for body copy | Use `text-base-content` |
| Using `dark:` prefixes with daisyUI colors | Not needed — daisyUI colors adapt automatically |
