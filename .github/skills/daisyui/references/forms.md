# Forms & Input Components

## Text Input

```html
<input type="text" placeholder="Type here" class="input input-primary" />
```

Styles: `input-ghost`. Colors: `input-neutral`, `input-primary`, `input-secondary`, `input-accent`, `input-info`, `input-success`, `input-warning`, `input-error`. Sizes: `input-xs`, `input-sm`, `input-md`, `input-lg`, `input-xl`.

## Input with Inline Label or Icon

Use the `input` class on a parent wrapper:

```html
<label class="input">
  <svg><!-- search icon --></svg>
  <input type="search" placeholder="Search" />
</label>

<label class="input">
  <span class="label">Username</span>
  <input type="text" placeholder="johndoe" />
</label>
```

## Floating Label

```html
<label class="floating-label">
  <input type="email" placeholder="Email" class="input" />
  <span>Email address</span>
</label>
```

## Textarea

```html
<textarea class="textarea textarea-primary" placeholder="Bio"></textarea>
```

Styles: `textarea-ghost`. Colors and sizes mirror input.

## Select

```html
<select class="select select-primary">
  <option disabled selected>Pick one</option>
  <option>Option A</option>
  <option>Option B</option>
</select>
```

## Checkbox / Radio / Toggle

```html
<input type="checkbox" class="checkbox checkbox-primary" />
<input type="radio" name="group" class="radio radio-primary" />
<input type="checkbox" class="toggle toggle-primary" />
```

Colors: `*-primary`, `*-secondary`, `*-accent`, `*-neutral`, `*-success`, `*-warning`, `*-info`, `*-error`. Sizes: `*-xs` through `*-xl`.

## Range Slider

```html
<input type="range" min="0" max="100" value="40" class="range range-primary" />
```

Always specify `min` and `max`.

## File Input

```html
<input type="file" class="file-input file-input-primary" />
```

## Rating

```html
<div class="rating rating-md">
  <input type="radio" name="rating" class="rating-hidden" />
  <input type="radio" name="rating" class="mask mask-star-2 bg-orange-400" />
  <input type="radio" name="rating" class="mask mask-star-2 bg-orange-400" />
  <input type="radio" name="rating" class="mask mask-star-2 bg-orange-400" />
  <input type="radio" name="rating" class="mask mask-star-2 bg-orange-400" />
  <input type="radio" name="rating" class="mask mask-star-2 bg-orange-400" />
</div>
```

Use a unique `name` per rating group. Add the first hidden `rating-hidden` input to allow clearing the rating.

## Fieldset (Form Section)

```html
<fieldset class="fieldset">
  <legend class="fieldset-legend">Account details</legend>
  <input type="text" class="input" placeholder="Username" />
  <p class="label">Must be unique and 3–20 characters.</p>
</fieldset>
```

## Filter (Radio Group with Reset)

```html
<form class="filter">
  <input class="btn btn-square" type="reset" value="×" />
  <input class="btn" type="radio" name="category" aria-label="All" />
  <input class="btn" type="radio" name="category" aria-label="Design" />
  <input class="btn" type="radio" name="category" aria-label="Code" />
</form>
```

Use unique `name` per filter group. Use `<form>` when possible; use `<div class="filter">` with `filter-reset` on the radio only when a form tag is unavailable.

## Validator (Inline Validation Feedback)

```html
<input type="email" class="input validator" required />
<p class="validator-hint">Please enter a valid email address.</p>
```

Works with `input`, `select`, and `textarea`. The hint shows automatically when the field is invalid.

## Join (Grouped Inputs and Buttons)

```html
<div class="join">
  <input class="input join-item" placeholder="Search" />
  <button class="btn btn-primary join-item">Go</button>
</div>

<!-- Vertical join -->
<div class="join join-vertical">
  <button class="btn join-item">Option A</button>
  <button class="btn join-item">Option B</button>
</div>
```

Use `lg:join-horizontal` for responsive direction switching.
